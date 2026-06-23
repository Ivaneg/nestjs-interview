import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { TodoListsService } from '../todo_lists/todo_lists.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly todoListService: TodoListsService,
  ) {}

  async all(todoListId: number): Promise<Item[]> {
    await this.checkTodoListExist(todoListId);
    return await this.itemRepository.find({
      where: { todoList: { id: todoListId } },
    });
  }

  async get(id: number, todoListId: number): Promise<Item | null> {
    await this.checkTodoListExist(todoListId);
    const item = await this.itemRepository.findOne({
      where: {
        id,
        todoList: { id: todoListId },
      },
    });

    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);

    return item;
  }

  async create(dto: CreateItemDto, todoListId: number): Promise<Item> {
    await this.checkTodoListExist(todoListId);
    const item = this.itemRepository.create({
      ...dto,
      todoList: { id: todoListId },
    });
    return await this.itemRepository.save(item);
  }

  async update(
    id: number,
    dto: UpdateItemDto,
    todoListId: number,
  ): Promise<Item> {
    const item = await this.get(id, todoListId);

    return await this.itemRepository.save({
      ...item,
      ...dto,
    });
  }

  async delete(id: number, todoListId: number): Promise<void> {
    const deleted = await this.itemRepository.delete({
      id,
      todoList: { id: todoListId },
    });

    if (deleted.affected === 0)
      throw new NotFoundException(`Item with ID ${id} not found`);
  }

  async checkTodoListExist(todoListId: number): Promise<void> {
    const todoListExist = await this.todoListService.exist(todoListId);
    if (!todoListExist)
      throw new NotFoundException(`TodoList with ID ${todoListId} not found`);
  }
}
