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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar nova sala (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou nome já existe na unidade',
  })
  @ApiResponse({ status: 404, description: 'Unidade clínica não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todas as salas' })
  @ApiQuery({
    name: 'clinicUnitId',
    required: false,
    type: String,
    description: 'Filtrar por unidade clínica',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir salas inativas',
  })
  @ApiResponse({ status: 200, description: 'Lista de salas' })
  findAll(
    @Query('clinicUnitId') clinicUnitId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.roomService.findAll(clinicUnitId, includeInactive === 'true');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar sala por ID' })
  @ApiResponse({ status: 200, description: 'Sala encontrada' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar sala' })
  @ApiResponse({ status: 200, description: 'Sala atualizada' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Nome já existe para outra sala na mesma unidade',
  })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar sala' })
  @ApiResponse({ status: 200, description: 'Sala desativada' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
