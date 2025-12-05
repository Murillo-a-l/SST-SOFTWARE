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
import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';
import { TerminateEmploymentDto } from './dto/terminate-employment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('employments')
@ApiBearerAuth()
@Controller('employments')
export class EmploymentController {
  constructor(private readonly employmentService: EmploymentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar novo vínculo empregatício' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso' })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos, trabalhador/cargo de empresas diferentes, ou vínculo já existe',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabalhador ou cargo não encontrado',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createEmploymentDto: CreateEmploymentDto) {
    return this.employmentService.create(createEmploymentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os vínculos empregatícios' })
  @ApiQuery({
    name: 'workerId',
    required: false,
    type: String,
    description: 'Filtrar por trabalhador',
  })
  @ApiQuery({
    name: 'jobId',
    required: false,
    type: String,
    description: 'Filtrar por cargo',
  })
  @ApiQuery({
    name: 'includeTerminated',
    required: false,
    type: Boolean,
    description: 'Incluir vínculos terminados',
  })
  @ApiResponse({ status: 200, description: 'Lista de vínculos empregatícios' })
  findAll(
    @Query('workerId') workerId?: string,
    @Query('jobId') jobId?: string,
    @Query('includeTerminated') includeTerminated?: string,
  ) {
    return this.employmentService.findAll(
      workerId,
      jobId,
      includeTerminated === 'true',
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar vínculo empregatício por ID' })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.employmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Atualizar vínculo empregatício' })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateEmploymentDto: UpdateEmploymentDto,
  ) {
    return this.employmentService.update(id, updateEmploymentDto);
  }

  @Patch(':id/terminate')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Terminar vínculo empregatício (demissão)' })
  @ApiResponse({ status: 200, description: 'Vínculo terminado com sucesso' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Vínculo já terminado ou data inválida',
  })
  terminate(
    @Param('id') id: string,
    @Body() terminateDto: TerminateEmploymentDto,
  ) {
    return this.employmentService.terminate(id, terminateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir vínculo empregatício' })
  @ApiResponse({ status: 200, description: 'Vínculo excluído' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir vínculo com documentos associados',
  })
  remove(@Param('id') id: string) {
    return this.employmentService.remove(id);
  }

  @Get(':id/check-terminated')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary:
      'Verificar se vínculo está terminado (lança exceção se estiver)',
  })
  @ApiResponse({ status: 200, description: 'Vínculo não está terminado' })
  @ApiResponse({
    status: 400,
    description: 'Vínculo terminado - não é possível criar documentos',
  })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  checkTerminated(@Param('id') id: string) {
    return this.employmentService.checkIfTerminated(id);
  }
}
