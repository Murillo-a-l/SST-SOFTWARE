import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FinalizeDocumentDto } from './dto/finalize-document.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';
import { DocumentType, DocumentStatus, AppointmentContext } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    // Verificar se o trabalhador existe
    const worker = await this.prisma.worker.findUnique({
      where: { id: createDocumentDto.workerId },
    });

    if (!worker) {
      throw new ResourceNotFoundException('Worker', createDocumentDto.workerId);
    }

    // Verificar se o vínculo empregatício existe e se está ativo
    const employment = await this.prisma.employment.findUnique({
      where: { id: createDocumentDto.employmentId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!employment) {
      throw new ResourceNotFoundException('Employment', createDocumentDto.employmentId);
    }

    // REGRA: Não permitir criação de documentos para vínculos terminados
    if (employment.employmentEndDate) {
      throw new BusinessException(
        BusinessErrorCode.EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED,
        'Não é possível criar documentos para vínculo empregatício já terminado',
        { employmentId: createDocumentDto.employmentId },
      );
    }

    // REGRA: Se for ASO demissional, verificar se já existe um
    if (createDocumentDto.type === DocumentType.ASO && createDocumentDto.dismissEmployee) {
      const existingDismissalAso = await this.prisma.document.findFirst({
        where: {
          employmentId: createDocumentDto.employmentId,
          type: DocumentType.ASO,
          dismissEmployee: true,
        },
      });

      if (existingDismissalAso) {
        throw new BusinessException(
          BusinessErrorCode.DISMISSAL_ASO_ALREADY_EXISTS,
          'Já existe um ASO demissional para este vínculo empregatício',
          { existingDocumentId: existingDismissalAso.id },
        );
      }
    }

    // Criar documento
    const document = await this.prisma.document.create({
      data: {
        type: createDocumentDto.type,
        workerId: createDocumentDto.workerId,
        employmentId: createDocumentDto.employmentId,
        issueDate: new Date(createDocumentDto.issueDate),
        expirationDate: createDocumentDto.expirationDate
          ? new Date(createDocumentDto.expirationDate)
          : null,
        status: DocumentStatus.DRAFT,
        asoConclusion: createDocumentDto.asoConclusion,
        dismissEmployee: createDocumentDto.dismissEmployee ?? false,
        notes: createDocumentDto.notes,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        employment: {
          select: {
            id: true,
            job: {
              select: {
                id: true,
                title: true,
                cbo: true,
                company: {
                  select: {
                    id: true,
                    corporateName: true,
                    tradeName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return document;
  }

  async findAll(workerId?: string, employmentId?: string, status?: DocumentStatus) {
    const documents = await this.prisma.document.findMany({
      where: {
        ...(workerId && { workerId }),
        ...(employmentId && { employmentId }),
        ...(status && { status }),
      },
      orderBy: {
        issueDate: 'desc',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        employment: {
          select: {
            id: true,
            job: {
              select: {
                id: true,
                title: true,
                cbo: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            uploadedAt: true,
          },
        },
      },
    });

    return documents;
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            phone: true,
          },
        },
        employment: {
          select: {
            id: true,
            employmentStartDate: true,
            employmentEndDate: true,
            job: {
              select: {
                id: true,
                title: true,
                cbo: true,
                description: true,
                company: {
                  select: {
                    id: true,
                    corporateName: true,
                    tradeName: true,
                    isDelinquent: true,
                  },
                },
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimetype: true,
            size: true,
            path: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new ResourceNotFoundException('Document', id);
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);

    // Verificar se documento está em status que permite edição
    if (document.status === DocumentStatus.FINALIZED) {
      throw new BusinessException(
        BusinessErrorCode.DOCUMENT_INCOMPLETE_FOR_FINALIZATION,
        'Não é possível editar documento já finalizado',
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        ...(updateDocumentDto.issueDate && {
          issueDate: new Date(updateDocumentDto.issueDate),
        }),
        ...(updateDocumentDto.expirationDate && {
          expirationDate: new Date(updateDocumentDto.expirationDate),
        }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        employment: {
          select: {
            id: true,
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return updatedDocument;
  }

  async finalize(id: string, finalizeDto: FinalizeDocumentDto) {
    const document = await this.findOne(id);

    // Verificar se documento já está finalizado
    if (document.status === DocumentStatus.FINALIZED) {
      throw new BusinessException(
        BusinessErrorCode.DOCUMENT_INCOMPLETE_FOR_FINALIZATION,
        'Documento já está finalizado',
      );
    }

    // REGRA: Validar se documento ASO possui conclusão
    if (document.type === DocumentType.ASO && !document.asoConclusion) {
      throw new BusinessException(
        BusinessErrorCode.DOCUMENT_INCOMPLETE_FOR_FINALIZATION,
        'ASO deve ter uma conclusão antes de ser finalizado (APTO, INAPTO, APTO_COM_RESTRICAO)',
      );
    }

    // REGRA: Se for ASO demissional, terminar o vínculo empregatício
    if (document.type === DocumentType.ASO && document.dismissEmployee) {
      const employment = await this.prisma.employment.findUnique({
        where: { id: document.employmentId },
      });

      if (!employment?.employmentEndDate) {
        // Terminar vínculo na data de emissão do ASO
        await this.prisma.employment.update({
          where: { id: document.employmentId },
          data: {
            employmentEndDate: document.issueDate,
            notes: `Vínculo encerrado por ASO demissional (Documento: ${document.id})`,
          },
        });
      }
    }

    // Finalizar documento
    const finalizedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.FINALIZED,
        ...(finalizeDto.notes && { notes: finalizeDto.notes }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        employment: {
          select: {
            id: true,
            employmentEndDate: true,
          },
        },
      },
    });

    return {
      message: 'Documento finalizado com sucesso',
      document: finalizedDocument,
    };
  }

  async remove(id: string) {
    const document = await this.findOne(id);

    // Verificar se documento está finalizado
    if (document.status === DocumentStatus.FINALIZED) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Não é possível excluir documento finalizado',
      );
    }

    // Verificar se tem arquivos associados
    const filesCount = await this.prisma.file.count({
      where: { documentId: id },
    });

    if (filesCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível excluir documento com ${filesCount} arquivo(s) associado(s). Remova os arquivos primeiro.`,
      );
    }

    // Deletar documento
    await this.prisma.document.delete({
      where: { id },
    });

    return { message: 'Documento excluído com sucesso' };
  }

  async getDismissalDocuments() {
    const dismissalDocuments = await this.prisma.document.findMany({
      where: {
        type: DocumentType.ASO,
        dismissEmployee: true,
      },
      orderBy: {
        issueDate: 'desc',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        employment: {
          select: {
            id: true,
            employmentEndDate: true,
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    corporateName: true,
                    tradeName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return dismissalDocuments;
  }
}
