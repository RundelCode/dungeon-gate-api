import { Test, TestingModule } from '@nestjs/testing';
import { GameSnapshotsService } from './game-snapshots.service';

describe('GameSnapshotsService', () => {
  let service: GameSnapshotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameSnapshotsService],
    }).compile();

    service = module.get<GameSnapshotsService>(GameSnapshotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
