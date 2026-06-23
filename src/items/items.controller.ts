import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('api/todolists/:todoListId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Body() createItemDto: CreateItemDto,
  ) {
    return this.itemsService.create(createItemDto, todoListId);
  }

  @Get()
  findAll(@Param('todoListId', ParseIntPipe) todoListId: number) {
    return this.itemsService.all(+todoListId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('todoListId', ParseIntPipe) todoListId: number,
  ) {
    return this.itemsService.get(id, todoListId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto, todoListId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('todoListId', ParseIntPipe) todoListId: number,
  ) {
    return this.itemsService.delete(id, todoListId);
  }
}
