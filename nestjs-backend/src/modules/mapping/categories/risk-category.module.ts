import { Module } from '@nestjs/common';
import { RiskCategoryService } from './risk-category.service';
import { RiskCategoryController } from './risk-category.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskCategoryController],
  providers: [RiskCategoryService],
  exports: [RiskCategoryService],
})
export class RiskCategoryModule {}



