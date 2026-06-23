/* eslint-disable */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from '../../todo_lists/todo_list.entity';
import { Logger } from '@nestjs/common';
import { SyncStatus } from 'src/common/sync.enum';
import { ExternalApiClient } from '../api/external-api.client';

interface SyncJobPayload {
  action: 'create_list' | 'update_list' | 'delete_list' | 'update_item';
  localId: number;
  externalId?: string;
}

@Processor('outbound-sync')
export class OutboundSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboundSyncProcessor.name);

  constructor(
    @InjectRepository(TodoList) private readonly listRepo: Repository<TodoList>,
    private readonly apiClient: ExternalApiClient,
  ) {
    super();
  }

  async process(job: Job<SyncJobPayload>): Promise<void> {
    const { action, localId, externalId } = job.data;
    this.logger.log(
      `Processing outbound sync action: ${action} for ID: ${localId}`,
    );

    try {
      switch (action) {
        case 'create_list':
          const list = await this.listRepo.findOneBy({ id: localId });
          // Checks if the list doesn't exist or is already created it stops the execution
          if (!list || list.externalId) return;

          // It creates the list
          const externalData = await this.apiClient.createTodoList({
            name: list.name,
          });
          await this.listRepo.update(localId, {
            externalId: externalData.id,
            syncStatus: SyncStatus.SYNCED,
          });
          break;

        case 'delete_list':
          if (externalId) {
            await this.apiClient.deleteTodoList(externalId);
            // Completely purge locally now that remote confirms deletion success
            await this.listRepo.delete({ id: localId });
          }
          break;

        // Handle update cases similarly...
      }
    } catch (error) {
      this.logger.error(
        `Sync job failed for action ${action}: ${error.message}`,
      );
      // Throwing tells BullMQ to activate the configured exponential backoff retry loop
      throw error;
    }
  }
}
