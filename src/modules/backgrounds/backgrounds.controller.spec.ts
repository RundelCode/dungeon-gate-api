import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundsController } from './backgrounds.controller';

describe('BackgroundsController', () => {
  let controller: BackgroundsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackgroundsController],
    }).compile();

    controller = module.get<BackgroundsController>(BackgroundsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
