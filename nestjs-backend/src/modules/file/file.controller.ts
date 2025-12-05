import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  StreamableFile,
  Response,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { createReadStream } from 'fs';
import type { Response as ExpressResponse } from 'express';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Upload de arquivo para documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'ID do documento' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo a ser enviado',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou não enviado' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, callback) => {
        // Permitir apenas certos tipos de arquivo
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `Tipo de arquivo não permitido: ${file.mimetype}. Permitidos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.fileService.create(file, createFileDto.documentId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos os arquivos' })
  @ApiQuery({
    name: 'documentId',
    required: false,
    type: String,
    description: 'Filtrar por documento',
  })
  @ApiResponse({ status: 200, description: 'Lista de arquivos' })
  findAll(@Query('documentId') documentId?: string) {
    return this.fileService.findAll(documentId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Estatísticas de armazenamento de arquivos (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estatísticas de arquivos' })
  getStats() {
    return this.fileService.getFileStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Buscar informações do arquivo por ID' })
  @ApiResponse({ status: 200, description: 'Arquivo encontrado' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(id);
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Download do arquivo' })
  @ApiResponse({ status: 200, description: 'Arquivo retornado' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async downloadFile(
    @Param('id') id: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const fileRecord = await this.fileService.findOne(id);
    const filePath = await this.fileService.getFilePath(id);

    const file = createReadStream(filePath);

    res.set({
      'Content-Type': fileRecord.mimetype,
      'Content-Disposition': `attachment; filename="${fileRecord.originalName}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Excluir arquivo' })
  @ApiResponse({ status: 200, description: 'Arquivo excluído' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível excluir arquivo de documento finalizado',
  })
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
