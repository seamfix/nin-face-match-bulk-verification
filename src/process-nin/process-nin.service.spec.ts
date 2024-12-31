import { Test, TestingModule } from '@nestjs/testing';
import { ProcessNinService } from './process-nin.service';

describe('ProcessNinService', () => {
  let service: ProcessNinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessNinService],
    }).compile();

    service = module.get<ProcessNinService>(ProcessNinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
