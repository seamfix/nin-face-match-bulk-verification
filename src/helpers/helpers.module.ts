import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { CacheService } from './cache/cache.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  providers: [HelpersService, CacheService],
  exports: [HelpersService, CacheService]
})
export class HelpersModule {}
