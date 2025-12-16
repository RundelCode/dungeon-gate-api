import { Test, TestingModule } from '@nestjs/testing';
import { CombatParticipantsController } from './combat-participants.controller';

describe('CombatParticipantsController', () => {
  let controller: CombatParticipantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CombatParticipantsController],
    }).compile();

    controller = module.get<CombatParticipantsController>(CombatParticipantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
