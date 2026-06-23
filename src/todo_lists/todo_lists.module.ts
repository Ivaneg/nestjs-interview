import { Module } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_list.entity';
import { Item } from 'src/items/entities/item.entity';
import { BullModule } from '@nestjs/bullmq';
// import { SyncModule } from 'src/sync-poc/processors/sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoList, Item]),
    BullModule.registerQueue({ name: 'bulk-operations' }),
    // SyncModule,
  ],
  controllers: [TodoListsController],
  providers: [TodoListsService],
  exports: [TodoListsService],
})
export class TodoListsModule {}
