import { Test, TestingModule } from '@nestjs/testing';
import { ParentItemsService } from './parent-items.service';
import { PrismaService } from '../prisma.service'; // Adjust the import path if necessary

const mockPrismaService = {};

describe('ParentItemsService', () => {
  let service: ParentItemsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentItemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ParentItemsService>(ParentItemsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests as needed
});
