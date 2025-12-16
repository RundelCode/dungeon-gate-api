import { Test, TestingModule } from '@nestjs/testing';
import { CombatParticipantsService } from './combat-participants.service';

describe('CombatParticipantsService', () => {
  let service: CombatParticipantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatParticipantsService],
    }).compile();

    service = module.get<CombatParticipantsService>(CombatParticipantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
