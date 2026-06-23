/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from '../../todo_lists/todo_list.entity';
import { ExternalApiClient } from '../api/external-api.client';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { SyncStatus } from 'src/common/sync.enum';

@Injectable()
export class InboundSyncService {
  private readonly logger = new Logger(InboundSyncService.name);
  private readonly ETAG_CACHE_KEY = 'sync:inbound:todolists:etag';

  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepo: Repository<TodoList>,
    private readonly apiClient: ExternalApiClient,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // Automatically runs every 10 seconds
  @Cron('*/10 * * * * *')
  async handleInboundSync() {
    this.logger.log('Starting inbound synchronization check...');

    try {
      // 1. Fetch the last stored ETag fingerprint from Redis cache
      const cachedEtag = await this.redis.get(this.ETAG_CACHE_KEY);

      // 2. Query the external API passing our conditional formatting token
      const response = await this.apiClient.getTodoLists({
        ifNoneMatch: cachedEtag || '',
      });

      // 3. Handle the Native HTTP Caching Response
      if (response.status === 304) {
        this.logger.log(
          'Network payload optimization triggered: 304 Not Modified. Data is already up-to-date.',
        );
        return;
      }

      const { data, headers } = response;
      const newEtag = headers['etag'];

      // 4. Core Delta Reconciliation Engine Logic
      this.logger.log(
        `Data modifications detected. Reconciling ${data.length} external entities...`,
      );

      for (const externalList of data) {
        // Look up our matching entity mapping bridge via externalId
        const existingLocalList = await this.todoListRepo.findOneBy({
          externalId: externalList.id,
        });

        if (!existingLocalList) {
          // Scenario A: External user created a list we don't have locally yet
          this.logger.log(
            `Inbound delta match: Creating missing local entity for external ID ${externalList.id}`,
          );
          const newList = this.todoListRepo.create({
            name: externalList.name,
            externalId: externalList.id,
            syncStatus: SyncStatus.SYNCED, // It came directly from the source of truth, no need to push back out
          });
          await this.todoListRepo.save(newList);
        } else {
          // Scenario B: Upstream update occurred. Check if local content differs
          if (existingLocalList.name !== externalList.name) {
            this.logger.log(
              `Inbound delta match: Updating stale local list title for ID ${existingLocalList.id}`,
            );
            await this.todoListRepo.update(existingLocalList.id, {
              name: externalList.name,
              syncStatus: SyncStatus.SYNCED,
            });
          }
        }
      }

      // 5. Commit the new ETag fingerprint token to Redis for subsequent iterations
      if (newEtag) {
        await this.redis.set(this.ETAG_CACHE_KEY, newEtag);
        this.logger.log(
          `New synchronization validation checkpoint saved: ${newEtag}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to execute inbound background synchronization reconciliation loop',
        error.stack,
      );
    }
  }
}
