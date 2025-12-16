import { Test, TestingModule } from '@nestjs/testing';
import { GamePlayersService } from './game-players.service';

describe('GamePlayersService', () => {
  let service: GamePlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamePlayersService],
    }).compile();

    service = module.get<GamePlayersService>(GamePlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
