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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ExaminationsService } from './examinations.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { ExamFiltersDto } from './dto/exam-filters.dto';

@ApiTags('Exames Ocupacionais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExaminationsController {
  constructor(private readonly examinationsService: ExaminationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo exame ocupacional' })
  @ApiResponse({ status: 201, description: 'Exame criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Exame com este nome já existe' })
  create(@Body() createExaminationDto: CreateExaminationDto) {
    return this.examinationsService.create(createExaminationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exames com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de exames retornada com sucesso' })
  findAll(@Query() filters: ExamFiltersDto) {
    return this.examinationsService.findAll(filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar exames por termo (nome ou descrição)' })
  @ApiQuery({ name: 'q', description: 'Termo de busca', required: true })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  @ApiResponse({ status: 400, description: 'Termo de busca vazio' })
  search(@Query('q') term: string) {
    return this.examinationsService.search(term);
  }

  @Get('table27')
  @ApiOperation({ summary: 'Obter todos os códigos da Tabela 27 do eSocial em uso' })
  @ApiResponse({ status: 200, description: 'Lista de códigos retornada com sucesso' })
  getAllTable27Codes() {
    return this.examinationsService.getAllTable27Codes();
  }

  @Post('table27/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar códigos da Tabela 27 do eSocial' })
  @ApiResponse({ status: 200, description: 'Validação concluída' })
  validateTable27Codes(@Body() body: { codes: string[] }) {
    return this.examinationsService.validateTable27CodesEndpoint(body.codes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar exame por ID' })
  @ApiResponse({ status: 200, description: 'Exame encontrado' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  findOne(@Param('id') id: string) {
    return this.examinationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar exame existente' })
  @ApiResponse({ status: 200, description: 'Exame atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 409, description: 'Nome de exame já existe' })
  update(@Param('id') id: string, @Body() updateExaminationDto: UpdateExaminationDto) {
    return this.examinationsService.update(id, updateExaminationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir exame (soft delete)' })
  @ApiResponse({ status: 204, description: 'Exame excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 409, description: 'Exame está sendo usado em regras ativas' })
  remove(@Param('id') id: string) {
    return this.examinationsService.remove(id);
  }
}
