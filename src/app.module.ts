import { Module } from '@nestjs/common';
import { TodoListsModule } from './todo_lists/todo_lists.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_lists/todo_list.entity';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from './items/items.module';
import { Item } from './items/entities/item.entity';
import { BullModule } from '@nestjs/bullmq';
// import { SyncModule } from './sync-poc/processors/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TodoListsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [TodoList, Item],
      synchronize: true,
      logging: true,
    }),
    ItemsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    // SyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
