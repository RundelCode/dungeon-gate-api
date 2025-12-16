import { Test, TestingModule } from '@nestjs/testing';
import { SpellsController } from './spells.controller';

describe('SpellsController', () => {
  let controller: SpellsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpellsController],
    }).compile();

    controller = module.get<SpellsController>(SpellsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
