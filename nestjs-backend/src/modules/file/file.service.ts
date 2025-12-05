import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File, documentId: string) {
    // Verificar se o documento existe
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      // Deletar arquivo se documento não existe
      await fs.unlink(file.path).catch(() => {});
      throw new ResourceNotFoundException('Document', documentId);
    }

    // Criar registro do arquivo
    const fileRecord = await this.prisma.file.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        documentId,
      },
      include: {
        document: {
          select: {
            id: true,
            type: true,
            worker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return fileRecord;
  }

  async findAll(documentId?: string) {
    const files = await this.prisma.file.findMany({
      where: documentId ? { documentId } : {},
      orderBy: {
        uploadedAt: 'desc',
      },
      include: {
        document: {
          select: {
            id: true,
            type: true,
            worker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return files;
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            type: true,
            status: true,
            worker: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new ResourceNotFoundException('File', id);
    }

    return file;
  }

  async getFilePath(id: string): Promise<string> {
    const file = await this.findOne(id);

    // Verificar se arquivo físico existe
    try {
      await fs.access(file.path);
      return file.path;
    } catch {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Arquivo físico não encontrado no sistema de arquivos',
        { fileId: id, path: file.path },
      );
    }
  }

  async remove(id: string) {
    const file = await this.findOne(id);

    // Verificar se documento está finalizado
    if (file.document.status === 'FINALIZED') {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Não é possível excluir arquivo de documento finalizado',
      );
    }

    // Deletar arquivo físico
    try {
      await fs.unlink(file.path);
    } catch (error) {
      // Log do erro mas não falha a operação se arquivo não existe
      console.warn(`Arquivo físico não encontrado: ${file.path}`, error);
    }

    // Deletar registro do banco
    await this.prisma.file.delete({
      where: { id },
    });

    return { message: 'Arquivo excluído com sucesso' };
  }

  async getFileStats() {
    const stats = await this.prisma.file.groupBy({
      by: ['mimetype'],
      _count: {
        id: true,
      },
      _sum: {
        size: true,
      },
    });

    const totalFiles = await this.prisma.file.count();
    const totalSize = await this.prisma.file.aggregate({
      _sum: {
        size: true,
      },
    });

    return {
      totalFiles,
      totalSizeBytes: totalSize._sum.size || 0,
      totalSizeMB: ((totalSize._sum.size || 0) / (1024 * 1024)).toFixed(2),
      byMimetype: stats.map((stat) => ({
        mimetype: stat.mimetype,
        count: stat._count.id,
        totalSizeBytes: stat._sum.size || 0,
        totalSizeMB: ((stat._sum.size || 0) / (1024 * 1024)).toFixed(2),
      })),
    };
  }
}
