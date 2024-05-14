import { Test, TestingModule } from '@nestjs/testing';
import { ShipheroService } from './shiphero.service';

describe('ShipheroService', () => {
  let service: ShipheroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipheroService],
    }).compile();

    service = module.get<ShipheroService>(ShipheroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
