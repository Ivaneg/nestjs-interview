import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../../items/entities/item.entity';
import { TodoList } from '../../todo_lists/todo_list.entity';
import { ExternalApiClient } from '../api/external-api.client';
import { OutboundSyncProcessor } from '../processors/outbound-sync.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, TodoList]),

    BullModule.registerQueue({
      name: 'outbound-sync',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  providers: [ExternalApiClient, OutboundSyncProcessor],
  exports: [BullModule],
})
export class SyncModule {}
