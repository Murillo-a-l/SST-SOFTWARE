import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PCMSOGeneratorService } from './pcmso-generator.service';
import { PCMSORuleEngineService } from './pcmso-rule-engine.service';

@ApiTags('PCMSO - Programa de Controle Médico de Saúde Ocupacional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pcmso')
export class PCMSOController {
  constructor(
    private readonly pcmsoGeneratorService: PCMSOGeneratorService,
    private readonly pcmsoRuleEngine: PCMSORuleEngineService,
  ) {}

  @Get('companies/:companyId/detect-changes')
  @ApiOperation({
    summary: 'Detectar mudanças no mapeamento desde a última versão assinada',
    description:
      'Compara o estado atual do mapeamento (cargos, riscos, exames) com a última versão assinada do PCMSO',
  })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  @ApiResponse({
    status: 200,
    description: 'Detecção de mudanças concluída',
    schema: {
      type: 'object',
      properties: {
        hasChanges: { type: 'boolean' },
        lastSignedVersion: { type: 'object' },
        changes: { type: 'array' },
        affectedJobs: { type: 'array' },
        affectedRisks: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  detectChanges(@Param('companyId') companyId: string) {
    return this.pcmsoGeneratorService.detectChanges(companyId);
  }

  @Post('companies/:companyId/generate-draft')
  @ApiOperation({
    summary: 'Gerar nova versão draft do PCMSO',
    description:
      'Cria uma nova versão em status DRAFT consolidando todas as regras de exames configuradas',
  })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  @ApiResponse({ status: 201, description: 'Draft do PCMSO gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async generateDraft(
    @Param('companyId') companyId: string,
    @Body() body: { title?: string; useAI?: boolean; aiModel?: string },
    @Req() req: any,
  ) {
    const userId = req.user.userId; // Extraído do JWT pelo guard
    return this.pcmsoGeneratorService.generateDraft(companyId, userId, {
      title: body.title,
      useAI: body.useAI,
      aiModel: body.aiModel,
    });
  }

  @Post('versions/:versionId/sign')
  @ApiOperation({
    summary: 'Assinar versão do PCMSO',
    description:
      'Move o status de DRAFT/UNDER_REVIEW para SIGNED, torna imutável e gera hash SHA256',
  })
  @ApiParam({ name: 'versionId', description: 'ID da versão do PCMSO' })
  @ApiResponse({ status: 200, description: 'Versão assinada com sucesso' })
  @ApiResponse({ status: 400, description: 'Versão não pode ser assinada (status inválido)' })
  @ApiResponse({ status: 404, description: 'Versão não encontrada' })
  async signVersion(@Param('versionId') versionId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.pcmsoGeneratorService.signVersion(versionId, userId);
  }

  @Get('versions/:versionId/validate-nr7')
  @ApiOperation({
    summary: 'Validar conformidade com NR-7',
    description: 'Verifica se o PCMSO está em conformidade com os requisitos da NR-7',
  })
  @ApiParam({ name: 'versionId', description: 'ID da versão do PCMSO' })
  @ApiResponse({
    status: 200,
    description: 'Validação concluída',
    schema: {
      type: 'object',
      properties: {
        isCompliant: { type: 'boolean' },
        errors: { type: 'array' },
        warnings: { type: 'array' },
        recommendations: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Versão não encontrada' })
  validateNR7(@Param('versionId') versionId: string) {
    return this.pcmsoRuleEngine.validateNR7Compliance(versionId);
  }

  @Get('versions/:versionId/suggest-exams')
  @ApiOperation({
    summary: 'Sugerir exames adicionais',
    description: 'Analisa riscos e sugere exames adicionais que podem ser relevantes',
  })
  @ApiParam({ name: 'versionId', description: 'ID da versão do PCMSO' })
  @ApiResponse({ status: 200, description: 'Sugestões retornadas com sucesso' })
  suggestExams(@Param('versionId') versionId: string) {
    return this.pcmsoRuleEngine.suggestAdditionalExams(versionId);
  }

  @Get('versions/diff')
  @ApiOperation({
    summary: 'Obter diff estruturado entre duas versões',
    description: 'Compara duas versões do PCMSO e retorna as diferenças',
  })
  @ApiResponse({ status: 200, description: 'Diff retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Versões de empresas diferentes' })
  @ApiResponse({ status: 404, description: 'Uma ou ambas as versões não encontradas' })
  getDiff(@Query('from') fromVersionId: string, @Query('to') toVersionId: string) {
    return this.pcmsoGeneratorService.getDiff(fromVersionId, toVersionId);
  }

  @Patch('companies/:companyId/versions/:versionNumber/mark-outdated')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marcar versões anteriores como desatualizadas',
    description: 'Marca todas as versões assinadas anteriores à especificada como OUTDATED',
  })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  @ApiParam({ name: 'versionNumber', description: 'Número da versão atual' })
  @ApiResponse({ status: 204, description: 'Versões marcadas como desatualizadas' })
  async markOutdated(
    @Param('companyId') companyId: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    await this.pcmsoGeneratorService.markPreviousVersionsAsOutdated(
      companyId,
      parseInt(versionNumber, 10),
    );
  }
}
