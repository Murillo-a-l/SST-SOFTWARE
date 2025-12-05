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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AddProceduresDto } from './dto/add-procedures.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus } from '@prisma/client';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabalhador, empresa ou sala não encontrado',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiQuery({
    name: 'workerId',
    required: false,
    type: String,
    description: 'Filtrar por trabalhador',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filtrar por empresa',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filtrar por status',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos' })
  findAll(
    @Query('workerId') workerId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentService.findAll(workerId, companyId, status);
  }

  @Get('waiting-room')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar pacientes na sala de espera (status WAITING)' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes aguardando' })
  getWaitingRoom() {
    return this.appointmentService.getWaitingRoom();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status/:newStatus')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary:
      'Atualizar status do agendamento (TO_COME -> WAITING -> IN_SERVICE -> DONE)',
  })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  updateStatus(@Param('id') id: string, @Param('newStatus') newStatus: AppointmentStatus) {
    return this.appointmentService.updateStatus(id, newStatus);
  }

  @Post(':id/procedures')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Adicionar procedimentos ao agendamento' })
  @ApiResponse({ status: 201, description: 'Procedimentos adicionados' })
  @ApiResponse({
    status: 400,
    description: 'Agendamento finalizado/cancelado ou procedimento inválido',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  addProcedures(@Param('id') id: string, @Body() addProceduresDto: AddProceduresDto) {
    return this.appointmentService.addProcedures(id, addProceduresDto);
  }

  @Delete(':appointmentId/procedures/:procedureId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Remover procedimento do agendamento' })
  @ApiResponse({ status: 200, description: 'Procedimento removido' })
  @ApiResponse({
    status: 400,
    description: 'Agendamento finalizado/cancelado ou procedimento não vinculado',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  removeProcedure(
    @Param('appointmentId') appointmentId: string,
    @Param('procedureId') procedureId: string,
  ) {
    return this.appointmentService.removeProcedure(appointmentId, procedureId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir agendamento (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Agendamento excluído' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir agendamento com procedimentos vinculados',
  })
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
