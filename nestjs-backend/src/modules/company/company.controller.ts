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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar nova empresa (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou CNPJ já cadastrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar todas as empresas' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir empresas inativas',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.companyService.findAll(includeInactive === 'true');
  }

  @Get('delinquent')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar empresas inadimplentes' })
  @ApiResponse({ status: 200, description: 'Lista de empresas inadimplentes' })
  getDelinquent() {
    return this.companyService.getDelinquentCompanies();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 400, description: 'CNPJ já cadastrado por outra empresa' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa desativada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível desativar empresa com trabalhadores ativos',
  })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Patch(':id/toggle-delinquency')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Alternar status de inadimplência da empresa' })
  @ApiResponse({ status: 200, description: 'Status de inadimplência alterado' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  toggleDelinquency(@Param('id') id: string) {
    return this.companyService.toggleDelinquency(id);
  }

  @Get(':id/check-delinquency')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Verificar se empresa está inadimplente (lança exceção se estiver)',
  })
  @ApiResponse({ status: 200, description: 'Empresa não está inadimplente' })
  @ApiResponse({
    status: 400,
    description: 'Empresa inadimplente - operação pode ser restrita',
  })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  checkDelinquency(@Param('id') id: string) {
    return this.companyService.checkDelinquency(id);
  }
}
