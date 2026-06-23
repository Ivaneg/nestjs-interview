import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from '../interfaces/todo_list.interface';
import { TodoListsService } from './todo_lists.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('api/todolists')
export class TodoListsController {
  constructor(
    private todoListsService: TodoListsService,
    @InjectQueue('bulk-operations') private readonly bulkQueue: Queue,
  ) {}

  @Get()
  index(): Promise<TodoList[]> {
    return this.todoListsService.all();
  }

  @Get('/:todoListId')
  show(
    @Param('todoListId', ParseIntPipe) todoListId: number,
  ): Promise<TodoList | null> {
    return this.todoListsService.get(todoListId);
  }

  @Post()
  create(@Body() dto: CreateTodoListDto): Promise<TodoList> {
    return this.todoListsService.create(dto);
  }

  @Put('/:todoListId')
  update(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Body() dto: UpdateTodoListDto,
  ): Promise<TodoList> {
    return this.todoListsService.update(todoListId, dto);
  }

  @Delete('/:todoListId')
  delete(@Param('todoListId', ParseIntPipe) todoListId: number): Promise<void> {
    return this.todoListsService.delete(todoListId);
  }

  @Post(':id/complete-all')
  @HttpCode(HttpStatus.ACCEPTED)
  async completeAllItems(@Param('id', ParseIntPipe) id: number) {
    await this.bulkQueue.add(
      'complete-all-items',
      { todoListId: id },
      {
        removeOnComplete: true,
        attempts: 3,
      },
    );
    return { success: true, message: 'Task queued successfully' };
  }
}
