import { Module } from '@nestjs/common';
import { ClinicUnitService } from './clinic-unit.service';
import { ClinicUnitController } from './clinic-unit.controller';

@Module({
  controllers: [ClinicUnitController],
  providers: [ClinicUnitService],
  exports: [ClinicUnitService],
})
export class ClinicUnitModule {}
