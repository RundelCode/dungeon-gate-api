import { Test, TestingModule } from '@nestjs/testing';
import { ActorsInGameController } from './actors-in-game.controller';

describe('ActorsInGameController', () => {
  let controller: ActorsInGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActorsInGameController],
    }).compile();

    controller = module.get<ActorsInGameController>(ActorsInGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
