import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Verificar se CNPJ já existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'CNPJ já cadastrado no sistema',
        { field: 'cnpj' },
      );
    }

    // Criar empresa
    const company = await this.prisma.company.create({
      data: {
        corporateName: createCompanyDto.corporateName,
        tradeName: createCompanyDto.tradeName,
        cnpj: createCompanyDto.cnpj,
        email: createCompanyDto.email,
        phone: createCompanyDto.phone,
        address: createCompanyDto.address,
        isDelinquent: createCompanyDto.isDelinquent ?? false,
        active: createCompanyDto.active ?? true,
      },
    });

    return company;
  }

  async findAll(includeInactive = false) {
    const companies = await this.prisma.company.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: {
        corporateName: 'asc',
      },
      include: {
        _count: {
          select: {
            workers: true,
            jobs: true,
            appointments: true,
          },
        },
      },
    });

    return companies;
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        workers: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
        jobs: {
          where: { active: true },
          orderBy: { title: 'asc' },
        },
        _count: {
          select: {
            workers: true,
            jobs: true,
            appointments: true,
          },
        },
      },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', id);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    // Verificar se empresa existe
    await this.findOne(id);

    // Se está mudando o CNPJ, verificar se já existe
    if (updateCompanyDto.cnpj) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCompany && existingCompany.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          'CNPJ já cadastrado por outra empresa',
          { field: 'cnpj' },
        );
      }
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    return company;
  }

  async remove(id: string) {
    // Verificar se empresa existe
    const company = await this.findOne(id);

    // Verificar se tem trabalhadores ativos
    const activeWorkersCount = await this.prisma.worker.count({
      where: {
        companyId: id,
        active: true,
      },
    });

    if (activeWorkersCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível desativar empresa com ${activeWorkersCount} trabalhador(es) ativo(s)`,
      );
    }

    // Soft delete - apenas desativa a empresa
    await this.prisma.company.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Empresa desativada com sucesso' };
  }

  async toggleDelinquency(id: string) {
    const company = await this.findOne(id);

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: { isDelinquent: !company.isDelinquent },
    });

    return {
      message: updatedCompany.isDelinquent
        ? 'Empresa marcada como inadimplente'
        : 'Empresa removida da inadimplência',
      company: updatedCompany,
    };
  }

  async checkDelinquency(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { isDelinquent: true, corporateName: true },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', companyId);
    }

    if (company.isDelinquent) {
      throw new BusinessException(
        BusinessErrorCode.COMPANY_DELINQUENT_WARNING,
        `ATENÇÃO: A empresa "${company.corporateName}" está inadimplente. Algumas operações podem ser restritas.`,
        { companyId },
      );
    }

    return { isDelinquent: false };
  }

  async getDelinquentCompanies() {
    const companies = await this.prisma.company.findMany({
      where: {
        isDelinquent: true,
        active: true,
      },
      orderBy: {
        corporateName: 'asc',
      },
    });

    return companies;
  }
}
