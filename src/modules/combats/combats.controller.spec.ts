import { Test, TestingModule } from '@nestjs/testing';
import { CombatsController } from './combats.controller';

describe('CombatsController', () => {
  let controller: CombatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CombatsController],
    }).compile();

    controller = module.get<CombatsController>(CombatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
