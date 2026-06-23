// All the commented code is a POC of the outbound SYNC that
// code would be needed if we wired it up all together
import { Injectable } from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from './todo_list.entity';
// import { InjectQueue } from '@nestjs/bullmq'; // 1. Import InjectQueue
// import { Queue } from 'bullmq';               // 2. Import Queue type
// import { SyncStatus } from 'src/common/sync.enum'; // 3. Import SyncStatus Enum

@Injectable()
export class TodoListsService {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
    // 4. Inject the outbound synchronization queue
    // @InjectQueue('outbound-sync')
    // private readonly syncQueue: Queue,
  ) {}

  async all(): Promise<TodoList[]> {
    return await this.todoListRepository.find();
  }

  async get(id: number): Promise<TodoList | null> {
    return await this.todoListRepository.findOneBy({ id });
  }

  async create(dto: CreateTodoListDto): Promise<TodoList> {
    const todoList = this.todoListRepository.create({
      name: dto.name,
      // externalId: null,
      // syncStatus: SyncStatus.PENDING,
    });
    const savedList = await this.todoListRepository.save(todoList);

    // await this.syncQueue.add('create_list', {
    //   action: 'create_list',
    //   localId: savedList.id,
    // });

    return savedList;
  }

  async update(id: number, dto: UpdateTodoListDto): Promise<TodoList> {
    return await this.todoListRepository.save({ id, ...dto } as TodoList);
  }

  async delete(id: number): Promise<void> {
    await this.todoListRepository.delete(id);
  }

  async exist(id: number): Promise<boolean> {
    return await this.todoListRepository.existsBy({ id });
  }
}
