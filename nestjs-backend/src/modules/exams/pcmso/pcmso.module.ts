import { Module } from '@nestjs/common';
import { PCMSOGeneratorService } from './pcmso-generator.service';
import { PCMSORuleEngineService } from './pcmso-rule-engine.service';
import { PCMSOController } from './pcmso.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PCMSOController],
  providers: [PCMSOGeneratorService, PCMSORuleEngineService],
  exports: [PCMSOGeneratorService, PCMSORuleEngineService],
})
export class PCMSOModule {}
