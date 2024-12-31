import { Test, TestingModule } from '@nestjs/testing';
import { ProcessNinController } from './process-nin.controller';

describe('ProcessNinController', () => {
  let controller: ProcessNinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessNinController],
    }).compile();

    controller = module.get<ProcessNinController>(ProcessNinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
