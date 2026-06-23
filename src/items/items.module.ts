import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { TodoList } from 'src/todo_lists/todo_list.entity';
import { TodoListsModule } from 'src/todo_lists/todo_lists.module';
import { BullModule } from '@nestjs/bullmq';
import { BulkOperationsProcessor } from './processors/bulk-operations.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, TodoList]),
    TodoListsModule,
    BullModule.registerQueue({
      name: 'bulk-operations',
    }),
  ],
  controllers: [ItemsController],
  providers: [ItemsService, BulkOperationsProcessor],
})
export class ItemsModule {}
