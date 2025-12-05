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
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('workers')
@ApiBearerAuth()
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar novo trabalhador' })
  @ApiResponse({ status: 201, description: 'Trabalhador criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou CPF já cadastrado' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os trabalhadores' })
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
    description: 'Incluir trabalhadores inativos',
  })
  @ApiResponse({ status: 200, description: 'Lista de trabalhadores' })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.workerService.findAll(companyId, includeInactive === 'true');
  }

  @Get('cpf/:cpf')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar trabalhador por CPF' })
  @ApiResponse({ status: 200, description: 'Trabalhador encontrado' })
  @ApiResponse({ status: 404, description: 'Trabalhador não encontrado' })
  findByCpf(@Param('cpf') cpf: string) {
    return this.workerService.findByCpf(cpf);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar trabalhador por ID' })
  @ApiResponse({ status: 200, description: 'Trabalhador encontrado' })
  @ApiResponse({ status: 404, description: 'Trabalhador não encontrado' })
  findOne(@Param('id') id: string) {
    return this.workerService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar trabalhador' })
  @ApiResponse({ status: 200, description: 'Trabalhador atualizado' })
  @ApiResponse({ status: 404, description: 'Trabalhador não encontrado' })
  @ApiResponse({ status: 400, description: 'CPF já cadastrado por outro trabalhador' })
  update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.update(id, updateWorkerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Desativar trabalhador' })
  @ApiResponse({ status: 200, description: 'Trabalhador desativado' })
  @ApiResponse({ status: 404, description: 'Trabalhador não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível desativar trabalhador com vínculos ativos',
  })
  remove(@Param('id') id: string) {
    return this.workerService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Reativar trabalhador' })
  @ApiResponse({ status: 200, description: 'Trabalhador reativado' })
  @ApiResponse({ status: 404, description: 'Trabalhador não encontrado' })
  @ApiResponse({ status: 400, description: 'Trabalhador já está ativo' })
  reactivate(@Param('id') id: string) {
    return this.workerService.reactivate(id);
  }
}
