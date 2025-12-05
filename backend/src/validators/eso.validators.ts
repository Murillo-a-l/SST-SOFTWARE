import { z } from 'zod';

// ============= COMPANY VALIDATORS =============

export const createCompanySchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  cnae: z.string().optional(),
  grauRisco: z.number().int().min(1).max(4).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  observacoes: z.string().optional(),
  matriz: z.boolean().default(true),
  empresaMatrizId: z.string().uuid().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

// ============= PERSON VALIDATORS =============

export const createPersonSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  dataNascimento: z.string().datetime().or(z.date()).optional(),
  sexo: z.enum(['M', 'F', 'Outro']).optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  observacoes: z.string().optional(),
});

export const updatePersonSchema = createPersonSchema.partial();

// ============= CARGO VALIDATORS =============

export const createCargoSchema = z.object({
  nome: z.string().min(1, 'Nome do cargo é obrigatório'),
  cbo: z.string().optional(),
  descricao: z.string().optional(),
  empresaId: z.string().uuid('ID da empresa inválido'),
});

export const updateCargoSchema = createCargoSchema.partial().omit({ empresaId: true });

// ============= AMBIENTE VALIDATORS =============

export const createAmbienteSchema = z.object({
  nome: z.string().min(1, 'Nome do ambiente é obrigatório'),
  descricao: z.string().optional(),
  empresaId: z.string().uuid('ID da empresa inválido'),
});

export const updateAmbienteSchema = createAmbienteSchema.partial().omit({ empresaId: true });

// ============= RISCO VALIDATORS =============

export const createRiscoSchema = z.object({
  nome: z.string().min(1, 'Nome do risco é obrigatório'),
  codigo: z.string().optional(),
  grupo: z.enum(['físico', 'químico', 'biológico', 'ergonômico', 'acidente']).optional(),
  descricao: z.string().optional(),
});

export const updateRiscoSchema = createRiscoSchema.partial();

// ============= EXAME VALIDATORS =============

export const createExameSchema = z.object({
  nome: z.string().min(1, 'Nome do exame é obrigatório'),
  codigo: z.string().optional(),
  tipo: z.string().optional(),
  descricao: z.string().optional(),
});

export const updateExameSchema = createExameSchema.partial();

// ============= VÍNCULO VALIDATORS =============

export const createVinculoSchema = z.object({
  personId: z.string().uuid('ID da pessoa inválido'),
  empresaId: z.string().uuid('ID da empresa inválido'),
  cargoId: z.string().uuid('ID do cargo inválido'),
  ativo: z.boolean().default(true),
  dataEntrada: z.string().datetime().or(z.date()).optional(),
  dataSaida: z.string().datetime().or(z.date()).optional(),
});

export const updateVinculoSchema = createVinculoSchema.partial().omit({
  personId: true,
  empresaId: true,
  cargoId: true
});

export const inativarVinculoSchema = z.object({
  dataSaida: z.string().datetime().or(z.date()).optional(),
});

// ============= RELAÇÕES CARGO VALIDATORS =============

export const linkCargoRiscoSchema = z.object({
  riscoId: z.string().uuid('ID do risco inválido'),
});

export const linkCargoExameSchema = z.object({
  exameId: z.string().uuid('ID do exame inválido'),
});

export const linkCargoAmbienteSchema = z.object({
  ambienteId: z.string().uuid('ID do ambiente inválido'),
});
