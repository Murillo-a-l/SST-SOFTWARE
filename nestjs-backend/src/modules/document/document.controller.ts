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
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FinalizeDocumentDto } from './dto/finalize-document.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, DocumentStatus } from '@prisma/client';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Criar novo documento' })
  @ApiResponse({ status: 201, description: 'Documento criado com sucesso' })
  @ApiResponse({
    status: 400,
    description:
      'Vínculo terminado, ASO demissional já existe, ou dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabalhador ou vínculo não encontrado',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os documentos' })
  @ApiQuery({
    name: 'workerId',
    required: false,
    type: String,
    description: 'Filtrar por trabalhador',
  })
  @ApiQuery({
    name: 'employmentId',
    required: false,
    type: String,
    description: 'Filtrar por vínculo empregatício',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DocumentStatus,
    description: 'Filtrar por status',
  })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  findAll(
    @Query('workerId') workerId?: string,
    @Query('employmentId') employmentId?: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.documentService.findAll(workerId, employmentId, status);
  }

  @Get('dismissal')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Listar todos os ASOs demissionais' })
  @ApiResponse({ status: 200, description: 'Lista de ASOs demissionais' })
  getDismissalDocuments() {
    return this.documentService.getDismissalDocuments();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar documento por ID' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Atualizar documento' })
  @ApiResponse({ status: 200, description: 'Documento atualizado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível editar documento finalizado',
  })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Post(':id/finalize')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary:
      'Finalizar documento (ASO deve ter conclusão; ASO demissional encerra vínculo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento finalizado e vínculo encerrado (se ASO demissional)',
  })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Documento incompleto ou já finalizado',
  })
  finalize(
    @Param('id') id: string,
    @Body() finalizeDto: FinalizeDocumentDto,
  ) {
    return this.documentService.finalize(id, finalizeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir documento (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Documento excluído' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  @ApiResponse({
    status: 400,
    description:
      'Não é possível excluir documento finalizado ou com arquivos associados',
  })
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
