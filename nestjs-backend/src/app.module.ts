import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { WorkerModule } from './modules/worker/worker.module';
import { JobModule } from './modules/job/job.module';
import { EmploymentModule } from './modules/employment/employment.module';
import { ProcedureModule } from './modules/procedure/procedure.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { DocumentModule } from './modules/document/document.module';
import { FileModule } from './modules/file/file.module';
import { ClinicUnitModule } from './modules/clinic-unit/clinic-unit.module';
import { RoomModule } from './modules/room/room.module';
import { MappingModule } from './modules/mapping/mapping.module';
import { ExamsModule } from './modules/exams/exams.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UserModule,
    CompanyModule,
    WorkerModule,
    JobModule,
    EmploymentModule,
    ProcedureModule,
    AppointmentModule,
    DocumentModule,
    FileModule,
    ClinicUnitModule,
    RoomModule,
    MappingModule,
    ExamsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
