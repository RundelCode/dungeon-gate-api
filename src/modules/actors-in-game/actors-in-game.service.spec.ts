import { Test, TestingModule } from '@nestjs/testing';
import { ActorsInGameService } from './actors-in-game.service';

describe('ActorsInGameService', () => {
  let service: ActorsInGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorsInGameService],
    }).compile();

    service = module.get<ActorsInGameService>(ActorsInGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
