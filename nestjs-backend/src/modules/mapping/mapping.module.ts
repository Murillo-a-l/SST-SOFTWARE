import { Module } from '@nestjs/common';
import { RiskCategoryModule } from './categories/risk-category.module';
import { RiskModule } from './risks/risk.module';
import { EnvironmentModule } from './environments/environment.module';
import { JobMappingModule } from './jobs/job-mapping.module';

@Module({
  imports: [
    RiskCategoryModule,
    RiskModule,
    EnvironmentModule,
    JobMappingModule,
  ],
  exports: [
    RiskCategoryModule,
    RiskModule,
    EnvironmentModule,
    JobMappingModule,
  ],
})
export class MappingModule {}



