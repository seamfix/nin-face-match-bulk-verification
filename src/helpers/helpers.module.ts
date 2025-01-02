import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { CacheService } from './cache/cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { NeuroTechFaceMatchService } from './neurotech/neurotech.service';

@Module({
  imports: [CacheModule.register()],
  providers: [HelpersService, CacheService, NeuroTechFaceMatchService],
  exports: [HelpersService, CacheService, NeuroTechFaceMatchService]
})
export class HelpersModule {}
