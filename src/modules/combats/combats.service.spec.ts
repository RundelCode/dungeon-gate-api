import { Test, TestingModule } from '@nestjs/testing';
import { CombatsService } from './combats.service';

describe('CombatsService', () => {
  let service: CombatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatsService],
    }).compile();

    service = module.get<CombatsService>(CombatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
