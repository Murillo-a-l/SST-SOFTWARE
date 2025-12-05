import { Module } from '@nestjs/common';
import { JobMappingService } from './job-mapping.service';
import { JobMappingController } from './job-mapping.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobMappingController],
  providers: [JobMappingService],
  exports: [JobMappingService],
})
export class JobMappingModule {}



