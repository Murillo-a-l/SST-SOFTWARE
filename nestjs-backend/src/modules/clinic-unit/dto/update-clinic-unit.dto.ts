import { PartialType } from '@nestjs/swagger';
import { CreateClinicUnitDto } from './create-clinic-unit.dto';

export class UpdateClinicUnitDto extends PartialType(CreateClinicUnitDto) {}
