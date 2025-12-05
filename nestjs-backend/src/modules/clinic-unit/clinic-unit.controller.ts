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
import { ClinicUnitService } from './clinic-unit.service';
import { CreateClinicUnitDto } from './dto/create-clinic-unit.dto';
import { UpdateClinicUnitDto } from './dto/update-clinic-unit.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('clinic-units')
@ApiBearerAuth()
@Controller('clinic-units')
export class ClinicUnitController {
  constructor(private readonly clinicUnitService: ClinicUnitService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar nova unidade clínica (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Unidade criada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou nome já existe',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createClinicUnitDto: CreateClinicUnitDto) {
    return this.clinicUnitService.create(createClinicUnitDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todas as unidades clínicas' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir unidades inativas',
  })
  @ApiResponse({ status: 200, description: 'Lista de unidades' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.clinicUnitService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar unidade clínica por ID' })
  @ApiResponse({ status: 200, description: 'Unidade encontrada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  findOne(@Param('id') id: string) {
    return this.clinicUnitService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar unidade clínica' })
  @ApiResponse({ status: 200, description: 'Unidade atualizada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Nome já existe para outra unidade',
  })
  update(
    @Param('id') id: string,
    @Body() updateClinicUnitDto: UpdateClinicUnitDto,
  ) {
    return this.clinicUnitService.update(id, updateClinicUnitDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar unidade clínica' })
  @ApiResponse({ status: 200, description: 'Unidade desativada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível desativar unidade com salas ativas',
  })
  remove(@Param('id') id: string) {
    return this.clinicUnitService.remove(id);
  }
}
