import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RiskCategoryService } from './risk-category.service';
import { CreateRiskCategoryDto } from './dto/create-risk-category.dto';
import { UpdateRiskCategoryDto } from './dto/update-risk-category.dto';
import { RiskCategoryResponseDto } from './dto/risk-category-response.dto';

@ApiTags('Mapping - Risk Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mapping/risk-categories')
export class RiskCategoryController {
  constructor(private readonly service: RiskCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria de risco' })
  @ApiResponse({ status: 201, description: 'Categoria criada', type: RiskCategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Categoria já existe' })
  create(@Body() createDto: CreateRiskCategoryDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias de risco' })
  @ApiResponse({ status: 200, description: 'Lista de categorias', type: [RiskCategoryResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada', type: RiskCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada', type: RiskCategoryResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateRiskCategoryDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída' })
  @ApiResponse({ status: 400, description: 'Não é possível excluir categoria com riscos vinculados' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}



