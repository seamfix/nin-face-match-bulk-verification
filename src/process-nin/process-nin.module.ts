import { Module } from '@nestjs/common';
import { ProcessNinController } from './process-nin.controller';
import { ProcessNinService } from './process-nin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NinBulkVerifications } from 'src/entities/nin_bulk_verifications';
import { NinLookup } from 'src/entities/nin_lookup';
import { NinRecords } from 'src/entities/nin_records';
import { HelpersService } from 'src/helpers/helpers.service';
import { HelpersModule } from 'src/helpers/helpers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NinBulkVerifications, NinLookup, NinRecords]),
    HelpersModule
  ],
  controllers: [ProcessNinController],
  providers: [ProcessNinService, HelpersService],
})
export class ProcessNinModule {}
