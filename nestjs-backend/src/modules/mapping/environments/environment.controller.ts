import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { EnvironmentResponseDto } from './dto/environment-response.dto';
import { AddEnvironmentRiskDto } from './dto/add-environment-risk.dto';

@ApiTags('Mapping - Environments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mapping/environments')
export class EnvironmentController {
  constructor(private readonly service: EnvironmentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo ambiente' })
  @ApiResponse({ status: 201, description: 'Ambiente criado', type: EnvironmentResponseDto })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 409, description: 'Já existe ambiente com este nome nesta empresa' })
  create(@Body() createDto: CreateEnvironmentDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ambientes com filtros opcionais' })
  @ApiQuery({ name: 'companyId', type: String, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Lista de ambientes', type: [EnvironmentResponseDto] })
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
  @ApiOperation({ summary: 'Buscar ambiente por ID' })
  @ApiResponse({ status: 200, description: 'Ambiente encontrado', type: EnvironmentResponseDto })
  @ApiResponse({ status: 404, description: 'Ambiente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ambiente' })
  @ApiResponse({ status: 200, description: 'Ambiente atualizado', type: EnvironmentResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateEnvironmentDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar ambiente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Ambiente desativado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Risk management endpoints

  @Post(':id/risks')
  @ApiOperation({ summary: 'Adicionar risco ao ambiente' })
  @ApiResponse({ status: 201, description: 'Risco adicionado' })
  @ApiResponse({ status: 404, description: 'Ambiente ou risco não encontrado' })
  @ApiResponse({ status: 409, description: 'Risco já vinculado ao ambiente' })
  addRisk(@Param('id') id: string, @Body() addRiskDto: AddEnvironmentRiskDto) {
    return this.service.addRisk(id, addRiskDto);
  }

  @Delete(':id/risks/:riskId')
  @ApiOperation({ summary: 'Remover risco do ambiente' })
  @ApiResponse({ status: 200, description: 'Risco removido' })
  @ApiResponse({ status: 404, description: 'Risco não vinculado a este ambiente' })
  removeRisk(@Param('id') id: string, @Param('riskId') riskId: string) {
    return this.service.removeRisk(id, riskId);
  }

  @Get(':id/risks')
  @ApiOperation({ summary: 'Listar riscos do ambiente' })
  @ApiResponse({ status: 200, description: 'Lista de riscos' })
  getRisks(@Param('id') id: string) {
    return this.service.getRisks(id);
  }
}



