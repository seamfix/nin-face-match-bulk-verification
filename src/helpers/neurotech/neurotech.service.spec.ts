import { Test, TestingModule } from '@nestjs/testing';
import { NeuroTechFaceMatchService } from './neurotech.service';

describe('NeurotechService', () => {
  let service: NeuroTechFaceMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeuroTechFaceMatchService],
    }).compile();

    service = module.get<NeuroTechFaceMatchService>(NeuroTechFaceMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
