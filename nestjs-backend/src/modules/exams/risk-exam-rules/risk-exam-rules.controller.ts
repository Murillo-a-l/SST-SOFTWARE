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
import { RiskExamRulesService } from './risk-exam-rules.service';
import { CreateRiskExamRuleDto } from './dto/create-risk-exam-rule.dto';
import { UpdateRiskExamRuleDto } from './dto/update-risk-exam-rule.dto';
import { RiskExamRuleFiltersDto } from './dto/risk-exam-rule-filters.dto';

@ApiTags('Regras de Exames por Risco')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams/risk-rules')
export class RiskExamRulesController {
  constructor(private readonly riskExamRulesService: RiskExamRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova regra de exame por risco' })
  @ApiResponse({ status: 201, description: 'Regra criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Risco ou exame não encontrado' })
  @ApiResponse({ status: 409, description: 'Já existe regra para esta combinação' })
  create(@Body() createRiskExamRuleDto: CreateRiskExamRuleDto) {
    return this.riskExamRulesService.create(createRiskExamRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as regras com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de regras retornada com sucesso' })
  findAll(@Query() filters: RiskExamRuleFiltersDto) {
    return this.riskExamRulesService.findAll(filters);
  }

  @Get('by-risk/:riskId')
  @ApiOperation({ summary: 'Buscar todas as regras de um risco específico' })
  @ApiParam({ name: 'riskId', description: 'ID do risco' })
  @ApiResponse({ status: 200, description: 'Regras do risco retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Risco não encontrado' })
  findByRisk(@Param('riskId') riskId: string) {
    return this.riskExamRulesService.findByRisk(riskId);
  }

  @Get('suggest/:riskId')
  @ApiOperation({ summary: 'Sugerir exames para um risco baseado em NR-7 e boas práticas' })
  @ApiParam({ name: 'riskId', description: 'ID do risco' })
  @ApiResponse({ status: 200, description: 'Sugestões retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Risco não encontrado' })
  suggestExamsForRisk(@Param('riskId') riskId: string) {
    return this.riskExamRulesService.suggestExamsForRisk(riskId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar regra por ID' })
  @ApiResponse({ status: 200, description: 'Regra encontrada' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  findOne(@Param('id') id: string) {
    return this.riskExamRulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar regra existente' })
  @ApiResponse({ status: 200, description: 'Regra atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  update(@Param('id') id: string, @Body() updateRiskExamRuleDto: UpdateRiskExamRuleDto) {
    return this.riskExamRulesService.update(id, updateRiskExamRuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir regra (soft delete)' })
  @ApiResponse({ status: 204, description: 'Regra excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada' })
  @ApiResponse({ status: 409, description: 'Regra está sendo usada em PCMSOs ativos' })
  remove(@Param('id') id: string) {
    return this.riskExamRulesService.remove(id);
  }
}
