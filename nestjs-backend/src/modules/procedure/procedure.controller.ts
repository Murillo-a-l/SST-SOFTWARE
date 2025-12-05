import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProcedureService } from './procedure.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('procedures')
@ApiBearerAuth()
@Controller('procedures')
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Criar novo procedimento' })
  @ApiResponse({ status: 201, description: 'Procedimento criado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou nome já existe',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createProcedureDto: CreateProcedureDto) {
    return this.procedureService.create(createProcedureDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os procedimentos' })
  @ApiResponse({ status: 200, description: 'Lista de procedimentos' })
  findAll() {
    return this.procedureService.findAll();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar procedimentos por nome, código ou descrição' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Termo de busca',
  })
  @ApiResponse({ status: 200, description: 'Lista de procedimentos encontrados' })
  search(@Query('q') query: string) {
    return this.procedureService.search(query);
  }

  @Get('code/:code')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar procedimento por código' })
  @ApiResponse({ status: 200, description: 'Procedimento encontrado' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  findByCode(@Param('code') code: string) {
    return this.procedureService.findByCode(code);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiResponse({ status: 200, description: 'Procedimento encontrado' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.procedureService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Atualizar procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento atualizado' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Nome já existe para outro procedimento',
  })
  update(
    @Param('id') id: string,
    @Body() updateProcedureDto: UpdateProcedureDto,
  ) {
    return this.procedureService.update(id, updateProcedureDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir procedimento' })
  @ApiResponse({ status: 200, description: 'Procedimento excluído' })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir procedimento com agendamentos associados',
  })
  remove(@Param('id') id: string) {
    return this.procedureService.remove(id);
  }
}
