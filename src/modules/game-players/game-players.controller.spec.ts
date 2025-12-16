import { Test, TestingModule } from '@nestjs/testing';
import { GamePlayersController } from './game-players.controller';

describe('GamePlayersController', () => {
  let controller: GamePlayersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamePlayersController],
    }).compile();

    controller = module.get<GamePlayersController>(GamePlayersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
