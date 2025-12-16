import { Test, TestingModule } from '@nestjs/testing';
import { GameSnapshotsController } from './game-snapshots.controller';

describe('GameSnapshotsController', () => {
  let controller: GameSnapshotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameSnapshotsController],
    }).compile();

    controller = module.get<GameSnapshotsController>(GameSnapshotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
