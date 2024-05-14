import { Test, TestingModule } from '@nestjs/testing';
import { ParentItemsController } from './parent-items.controller';
import { ParentItemsService } from './parent-items.service';
import { PrismaService } from '../prisma.service'; // Adjust the import path if necessary

const mockPrismaService = {};

describe('ParentItemsController', () => {
  let controller: ParentItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentItemsController],
      providers: [
        ParentItemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ParentItemsController>(ParentItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests as needed
});
