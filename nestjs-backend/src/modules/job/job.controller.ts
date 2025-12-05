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
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Criar novo cargo' })
  @ApiResponse({ status: 201, description: 'Cargo criado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou cargo já existe na empresa',
  })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os cargos' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filtrar por empresa',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir cargos inativos',
  })
  @ApiResponse({ status: 200, description: 'Lista de cargos' })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.jobService.findAll(companyId, includeInactive === 'true');
  }

  @Get('cbo/:cbo')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar cargos por código CBO' })
  @ApiResponse({ status: 200, description: 'Lista de cargos com esse CBO' })
  findByCbo(@Param('cbo') cbo: string) {
    return this.jobService.findByCbo(cbo);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar cargo por ID' })
  @ApiResponse({ status: 200, description: 'Cargo encontrado' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Atualizar cargo' })
  @ApiResponse({ status: 200, description: 'Cargo atualizado' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Título já existe para outro cargo na mesma empresa',
  })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Desativar cargo' })
  @ApiResponse({ status: 200, description: 'Cargo desativado' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível desativar cargo com vínculos ativos',
  })
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}
