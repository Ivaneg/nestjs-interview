import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemsController', () => {
  let controller: ItemsController;

  const mockItemsService = {
    create: jest.fn(),
    all: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should invoke the service layer and pass parameters to create a new item', async () => {
      const todoListId = 1;
      const dto: CreateItemDto = { name: 'Buy milk', done: false };
      const expectedResult = { id: 101, ...dto, todoListId };

      mockItemsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(todoListId, dto);

      expect(mockItemsService.create).toHaveBeenCalledWith(dto, todoListId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll()', () => {
    it('should return a collection of matching nested items from the service', async () => {
      const todoListId = 1;
      const expectedItems = [
        { id: 101, name: 'Item 1', done: true },
        { id: 102, name: 'Item 2', done: false },
      ];

      mockItemsService.all.mockResolvedValue(expectedItems);

      const result = await controller.findAll(todoListId);

      expect(mockItemsService.all).toHaveBeenCalledWith(todoListId);
      expect(result).toEqual(expectedItems);
    });
  });

  describe('findOne()', () => {
    it('should fetch a single contextual item using its unique identifier bridge', async () => {
      const todoListId = 1;
      const itemId = 101;
      const expectedItem = { id: itemId, name: 'Target Item', done: false };

      mockItemsService.get.mockResolvedValue(expectedItem);

      const result = await controller.findOne(itemId, todoListId);

      expect(mockItemsService.get).toHaveBeenCalledWith(itemId, todoListId);
      expect(result).toEqual(expectedItem);
    });
  });

  describe('update()', () => {
    it('should pass down the patch update requirements to the service layer', async () => {
      const todoListId = 1;
      const itemId = 101;
      const dto: UpdateItemDto = { done: true };
      const expectedResult = { id: itemId, name: 'Old Name', done: true };

      mockItemsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(itemId, todoListId, dto);

      expect(mockItemsService.update).toHaveBeenCalledWith(
        itemId,
        dto,
        todoListId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should request a deletion lifecycle execution from the service layer', async () => {
      const todoListId = 1;
      const itemId = 101;

      mockItemsService.delete.mockResolvedValue({ deleted: true });

      await controller.remove(itemId, todoListId);

      expect(mockItemsService.delete).toHaveBeenCalledWith(itemId, todoListId);
    });
  });
});
