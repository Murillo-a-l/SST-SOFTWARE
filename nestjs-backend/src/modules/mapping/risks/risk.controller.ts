import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RiskService } from './risk.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { RiskResponseDto } from './dto/risk-response.dto';
import { RiskType } from '../shared/enums';

@ApiTags('Mapping - Risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mapping/risks')
export class RiskController {
  constructor(private readonly service: RiskService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo risco' })
  @ApiResponse({ status: 201, description: 'Risco criado', type: RiskResponseDto })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Risco já existe' })
  create(@Body() createDto: CreateRiskDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar riscos com filtros opcionais' })
  @ApiQuery({ name: 'type', enum: RiskType, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'isGlobal', type: Boolean, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Busca por nome, descrição ou código' })
  @ApiResponse({ status: 200, description: 'Lista de riscos', type: [RiskResponseDto] })
  findAll(
    @Query('type') type?: RiskType,
    @Query('categoryId') categoryId?: string,
    @Query('isGlobal') isGlobal?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      type,
      categoryId,
      isGlobal: isGlobal === 'true' ? true : isGlobal === 'false' ? false : undefined,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar risco por ID' })
  @ApiResponse({ status: 200, description: 'Risco encontrado', type: RiskResponseDto })
  @ApiResponse({ status: 404, description: 'Risco não encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar risco' })
  @ApiResponse({ status: 200, description: 'Risco atualizado', type: RiskResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateRiskDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar risco (soft delete)' })
  @ApiResponse({ status: 200, description: 'Risco desativado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}



