import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JobMappingService } from './job-mapping.service';
import { CreateJobMappingDto } from './dto/create-job-mapping.dto';
import { UpdateJobMappingDto } from './dto/update-job-mapping.dto';
import { UpdateJobNotesDto } from './dto/update-job-notes.dto';
import { AddJobEnvironmentDto } from './dto/add-job-environment.dto';
import { AddJobRiskDto } from './dto/add-job-risk.dto';
import { AddJobExamDto } from './dto/add-job-exam.dto';
import { JobMappingResponseDto } from './dto/job-mapping-response.dto';

@ApiTags('Mapping - Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mapping/jobs')
export class JobMappingController {
  constructor(private readonly service: JobMappingService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cargo com mapeamento' })
  @ApiResponse({ status: 201, description: 'Cargo criado', type: JobMappingResponseDto })
  @ApiResponse({ status: 404, description: 'Empresa ou ambiente não encontrado' })
  create(@Body() createDto: CreateJobMappingDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cargos com filtros opcionais' })
  @ApiQuery({ name: 'companyId', type: String, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Lista de cargos', type: [JobMappingResponseDto] })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('active') active?: string,
  ) {
    return this.service.findAll({
      companyId,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cargo por ID com todos os detalhes' })
  @ApiResponse({ status: 200, description: 'Cargo encontrado', type: JobMappingResponseDto })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados básicos do cargo' })
  @ApiResponse({ status: 200, description: 'Cargo atualizado', type: JobMappingResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateJobMappingDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar cargo (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cargo desativado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Notes endpoints

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Atualizar notas/textos do cargo' })
  @ApiResponse({ status: 200, description: 'Notas atualizadas' })
  updateNotes(@Param('id') id: string, @Body() notesDto: UpdateJobNotesDto) {
    return this.service.updateNotes(id, notesDto);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Buscar notas do cargo' })
  @ApiResponse({ status: 200, description: 'Notas do cargo' })
  getNotes(@Param('id') id: string) {
    return this.service.getNotes(id);
  }

  // Environment endpoints

  @Post(':id/environments')
  @ApiOperation({ summary: 'Adicionar ambiente ao cargo' })
  @ApiResponse({ status: 201, description: 'Ambiente adicionado' })
  @ApiResponse({ status: 404, description: 'Cargo ou ambiente não encontrado' })
  @ApiResponse({ status: 409, description: 'Ambiente já vinculado ao cargo' })
  addEnvironment(@Param('id') id: string, @Body() dto: AddJobEnvironmentDto) {
    return this.service.addEnvironment(id, dto);
  }

  @Delete(':id/environments/:environmentId')
  @ApiOperation({ summary: 'Remover ambiente do cargo' })
  @ApiResponse({ status: 200, description: 'Ambiente removido' })
  @ApiResponse({ status: 404, description: 'Ambiente não vinculado a este cargo' })
  removeEnvironment(@Param('id') id: string, @Param('environmentId') environmentId: string) {
    return this.service.removeEnvironment(id, environmentId);
  }

  @Get(':id/environments')
  @ApiOperation({ summary: 'Listar ambientes do cargo' })
  @ApiResponse({ status: 200, description: 'Lista de ambientes' })
  getEnvironments(@Param('id') id: string) {
    return this.service.getEnvironments(id);
  }

  // Risk endpoints

  @Post(':id/risks')
  @ApiOperation({ summary: 'Adicionar risco ao cargo' })
  @ApiResponse({ status: 201, description: 'Risco adicionado' })
  @ApiResponse({ status: 404, description: 'Cargo ou risco não encontrado' })
  @ApiResponse({ status: 409, description: 'Risco já vinculado ao cargo' })
  addRisk(@Param('id') id: string, @Body() dto: AddJobRiskDto) {
    return this.service.addRisk(id, dto);
  }

  @Delete(':id/risks/:riskId')
  @ApiOperation({ summary: 'Remover risco do cargo' })
  @ApiResponse({ status: 200, description: 'Risco removido' })
  @ApiResponse({ status: 404, description: 'Risco não vinculado a este cargo' })
  removeRisk(@Param('id') id: string, @Param('riskId') riskId: string) {
    return this.service.removeRisk(id, riskId);
  }

  @Get(':id/risks')
  @ApiOperation({ summary: 'Listar riscos do cargo' })
  @ApiResponse({ status: 200, description: 'Lista de riscos' })
  getRisks(@Param('id') id: string) {
    return this.service.getRisks(id);
  }

  // Exam endpoints

  @Post(':id/exams')
  @ApiOperation({ summary: 'Adicionar exame ao cargo' })
  @ApiResponse({ status: 201, description: 'Exame adicionado' })
  @ApiResponse({ status: 409, description: 'Exame já vinculado ao cargo' })
  addExam(@Param('id') id: string, @Body() dto: AddJobExamDto) {
    return this.service.addExam(id, dto);
  }

  @Delete(':id/exams/:examName')
  @ApiOperation({ summary: 'Remover exame do cargo' })
  @ApiResponse({ status: 200, description: 'Exame removido' })
  @ApiResponse({ status: 404, description: 'Exame não vinculado a este cargo' })
  removeExam(@Param('id') id: string, @Param('examName') examName: string) {
    return this.service.removeExam(id, examName);
  }

  @Get(':id/exams')
  @ApiOperation({ summary: 'Listar exames do cargo' })
  @ApiResponse({ status: 200, description: 'Lista de exames' })
  getExams(@Param('id') id: string) {
    return this.service.getExams(id);
  }
}



