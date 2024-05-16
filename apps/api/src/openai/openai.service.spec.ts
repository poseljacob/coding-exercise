import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { PrismaService } from '../prisma.service';

describe('OpenaiService', () => {
  let service: OpenAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAIService, PrismaService],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
