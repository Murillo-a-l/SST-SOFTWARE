import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JobExamRulesService } from './job-exam-rules.service';
import { CreateJobExamRuleDto } from './dto/create-job-exam-rule.dto';
import { UpdateJobExamRuleDto } from './dto/update-job-exam-rule.dto';
import { JobExamRuleFiltersDto } from './dto/job-exam-rule-filters.dto';

@ApiTags('Regras de Exames por Cargo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams/job-rules')
export class JobExamRulesController {
  constructor(private readonly jobExamRulesService: JobExamRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova regra de exame por cargo' })
  @ApiResponse({ status: 201, description: 'Regra criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cargo ou exame não encontrado' })
  @ApiResponse({ status: 409, description: 'Já existe regra para esta combinação' })
  create(@Body() createJobExamRuleDto: CreateJobExamRuleDto) {
    return this.jobExamRulesService.create(createJobExamRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as regras com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de regras retornada com sucesso' })
  findAll(@Query() filters: JobExamRuleFiltersDto) {
    return this.jobExamRulesService.findAll(filters);
  }

  @Get('by-job/:jobId')
  @ApiOperation({ summary: 'Buscar todas as regras de um cargo específico' })
  @ApiParam({ name: 'jobId', description: 'ID do cargo' })
  @ApiResponse({ status: 200, description: 'Regras do cargo retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  findByJob(@Param('jobId') jobId: string) {
    return this.jobExamRulesService.findByJob(jobId);
  }

  @Get('consolidate/:jobId')
  @ApiOperation({
    summary: 'Consolidar exames para um cargo (regras do cargo + regras dos riscos associados)',
  })
  @ApiParam({ name: 'jobId', description: 'ID do cargo' })
  @ApiResponse({
    status: 200,
    description: 'Exames consolidados retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        jobRules: { type: 'array' },
        riskRules: { type: 'array' },
        consolidated: { type: 'array' },
        overrides: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  consolidateExamsForJob(@Param('jobId') jobId: string) {
    return this.jobExamRulesService.consolidateExamsForJob(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar regra por ID' })
  @ApiResponse({ status: 200, description: 'Regra encontrada' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  findOne(@Param('id') id: string) {
    return this.jobExamRulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar regra existente' })
  @ApiResponse({ status: 200, description: 'Regra atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  update(@Param('id') id: string, @Body() updateJobExamRuleDto: UpdateJobExamRuleDto) {
    return this.jobExamRulesService.update(id, updateJobExamRuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir regra (soft delete)' })
  @ApiResponse({ status: 204, description: 'Regra excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  @ApiResponse({ status: 409, description: 'Regra está sendo usada em PCMSOs ativos' })
  remove(@Param('id') id: string) {
    return this.jobExamRulesService.remove(id);
  }
}
