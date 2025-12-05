/**
 * API Service - Cliente HTTP para comunicação com o backend NestJS
 * Backend: NestJS rodando em http://localhost:3000/api/v1
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, '');
const SESSION_KEY = 'occupational_health_session';

// Interface para erros da API
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==================== UTILITÁRIOS ====================

/**
 * Obtém o token JWT (accessToken) do sessionStorage
 */
function getToken(): string | null {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return parsed.accessToken || parsed.token || null;
  } catch {
    return null;
  }
}

/**
 * Salva o token JWT no sessionStorage
 */
function saveToken(accessToken: string, refreshToken: string, user: any): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken, refreshToken, user }));
}

/**
 * Remove o token JWT do sessionStorage
 */
function clearToken(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Função auxiliar para fazer requisições HTTP
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adiciona token JWT se disponível
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Tenta parsear resposta JSON
    let payload: any;
    try {
      payload = await response.json();
    } catch {
      // Se não conseguir parsear, verifica se foi bem-sucedido
      if (!response.ok) {
        throw new ApiError(`Erro HTTP ${response.status}`, response.status);
      }
      return undefined as T;
    }

    // Verifica se houve erro HTTP
    if (!response.ok) {
      // NestJS retorna erros no formato: { success: false, error: { code, message } }
      const errorMessage = payload?.error?.message || payload?.message || `Erro HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status, payload);
    }

    // Retorna o payload direto (NestJS não envelopa com "data")
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Erros de rede ou outros
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro de conexão com o servidor'
    );
  }
}

// ==================== AUTENTICAÇÃO ====================

/**
 * Roles do NestJS (expandido do backend Express)
 */
export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'TECHNICIAN' | 'USER';

export interface User {
  id: string; // NestJS usa CUID (string) em vez de number
  name: string; // "nome" → "name"
  email: string; // NestJS usa email em vez de username
  role: UserRole;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string; // "token" → "accessToken"
  refreshToken: string; // Novo campo do NestJS
  user: User;
}

export const authApi = {
  /**
   * Faz login no sistema
   * @param email Email do usuário (em vez de username)
   * @param password Senha do usuário
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Salva tokens no sessionStorage
    saveToken(response.accessToken, response.refreshToken, response.user);

    return response;
  },

  /**
   * Faz logout do sistema
   */
  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearToken();
    }
  },

  /**
   * Obtém informações do usuário atual
   */
  async me(): Promise<User> {
    return fetchApi<User>('/auth/me');
  },

  /**
   * Atualiza o access token usando o refresh token
   */
  async refresh(): Promise<LoginResponse> {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) {
      throw new ApiError('Sessão expirada');
    }

    try {
      const parsed = JSON.parse(session);
      const refreshToken = parsed.refreshToken;

      const response = await fetchApi<LoginResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      saveToken(response.accessToken, response.refreshToken, response.user);
      return response;
    } catch {
      clearToken();
      throw new ApiError('Sessão expirada');
    }
  },

  /**
   * Obtém o usuário atual do sessionStorage (sem fazer requisição)
   */
  getCurrentUser(): User | null {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;

    try {
      const parsed = JSON.parse(session);
      return parsed.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return getToken() !== null;
  },
};

// ==================== EMPRESAS (COMPANIES) ====================

export interface Empresa {
  id: string; // CUID (string)
  corporateName: string; // "razaoSocial" → "corporateName"
  tradeName?: string; // "nomeFantasia" → "tradeName"
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string; // "endereco" → "address"
  active: boolean; // "ativo" → "active"
  isDelinquent: boolean; // Inadimplente
  createdAt: string;
  updatedAt: string;
  _count?: {
    workers: number; // "funcionarios" → "workers"
    jobs: number; // "cargos"
    appointments: number; // "agendamentos"
    documents: number; // "documentos"
  };
}

export interface CreateEmpresaDto {
  corporateName: string;
  tradeName?: string;
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  isDelinquent?: boolean;
}

export const empresaApi = {
  /**
   * Lista todas as empresas
   */
  async getAll(): Promise<Empresa[]> {
    return fetchApi<Empresa[]>('/companies');
  },

  /**
   * Busca empresa por ID
   */
  async getById(id: string): Promise<Empresa> {
    return fetchApi<Empresa>(`/companies/${id}`);
  },

  /**
   * Cria nova empresa
   */
  async create(data: CreateEmpresaDto): Promise<Empresa> {
    return fetchApi<Empresa>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza empresa existente
   */
  async update(id: string, data: Partial<CreateEmpresaDto>): Promise<Empresa> {
    return fetchApi<Empresa>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove empresa (soft delete)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/companies/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lista empresas inadimplentes
   */
  async getDelinquent(): Promise<Empresa[]> {
    return fetchApi<Empresa[]>('/companies/delinquent');
  },

  /**
   * Alterna status de inadimplência
   */
  async toggleDelinquency(id: string): Promise<Empresa> {
    return fetchApi<Empresa>(`/companies/${id}/toggle-delinquency`, {
      method: 'PATCH',
    });
  },
};

// ==================== FUNCIONÁRIOS (WORKERS) ====================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Funcionario {
  id: string; // CUID
  companyId: string; // "empresaId" → "companyId"
  name: string; // "nome" → "name"
  cpf: string;
  birthDate?: string; // Novo campo
  gender?: Gender; // Novo campo
  phone?: string; // "whatsapp" → "phone"
  email?: string; // Novo campo
  address?: string; // Novo campo
  active: boolean; // "ativo" → "active"
  createdAt: string;
  updatedAt: string;
  _count?: {
    employments: number; // "vinculos"
    appointments: number; // "agendamentos"
    documents: number; // "documentos"
  };
}

export interface CreateFuncionarioDto {
  companyId: string;
  name: string;
  cpf: string;
  birthDate?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  active?: boolean;
}

export interface FuncionarioFilters {
  companyId?: string;
  active?: boolean;
}

export const funcionarioApi = {
  /**
   * Lista todos os funcionários (com filtros opcionais)
   */
  async getAll(filters?: FuncionarioFilters): Promise<Funcionario[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Funcionario[]>(`/workers${query}`);
  },

  /**
   * Busca funcionário por ID
   */
  async getById(id: string): Promise<Funcionario> {
    return fetchApi<Funcionario>(`/workers/${id}`);
  },

  /**
   * Busca funcionário por CPF
   */
  async getByCpf(cpf: string): Promise<Funcionario> {
    return fetchApi<Funcionario>(`/workers/cpf/${cpf}`);
  },

  /**
   * Cria novo funcionário
   */
  async create(data: CreateFuncionarioDto): Promise<Funcionario> {
    return fetchApi<Funcionario>('/workers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza funcionário existente
   */
  async update(id: string, data: Partial<CreateFuncionarioDto>): Promise<Funcionario> {
    return fetchApi<Funcionario>(`/workers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove funcionário (soft delete)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/workers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reativa funcionário
   */
  async reactivate(id: string): Promise<Funcionario> {
    return fetchApi<Funcionario>(`/workers/${id}/reactivate`, {
      method: 'PATCH',
    });
  },
};

// ==================== EXAMES (EXAMINATIONS) ====================

export type ExamCategory =
  | 'ADMISSION'
  | 'PERIODIC'
  | 'RETURN_TO_WORK'
  | 'CHANGE_OF_FUNCTION'
  | 'DISMISSAL'
  | 'COMPLEMENTARY';

export interface Examination {
  id: string;
  name: string;
  description?: string;
  category: ExamCategory;
  table27Codes: string[];
  insertIntoASO: boolean;
  requiresJustification: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExaminationDto {
  name: string;
  description?: string;
  category: ExamCategory;
  table27Codes?: string[];
  insertIntoASO?: boolean;
  requiresJustification?: boolean;
  active?: boolean;
}

export const exameApi = {
  /**
   * Lista todos os exames
   */
  async getAll(filters?: { category?: ExamCategory; active?: boolean }): Promise<Examination[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Examination[]>(`/examinations${query}`);
  },

  /**
   * Busca exame por ID
   */
  async getById(id: string): Promise<Examination> {
    return fetchApi<Examination>(`/examinations/${id}`);
  },

  /**
   * Cria novo exame
   */
  async create(data: CreateExaminationDto): Promise<Examination> {
    return fetchApi<Examination>('/examinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza exame existente
   */
  async update(id: string, data: Partial<CreateExaminationDto>): Promise<Examination> {
    return fetchApi<Examination>(`/examinations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove exame (soft delete)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/examinations/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reativa exame
   */
  async reactivate(id: string): Promise<Examination> {
    return fetchApi<Examination>(`/examinations/${id}/reactivate`, {
      method: 'PATCH',
    });
  },
};

// ==================== REGRAS DE EXAMES (EXAM RULES) ====================

export type ExamRulePeriodicity = 'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL' | 'BIENNIAL';

export interface ExamRuleByRisk {
  id: string;
  riskId: string;
  examinationId: string;
  mandatory: boolean;
  admissionPeriodicity: ExamRulePeriodicity;
  periodicPeriodicity: ExamRulePeriodicity;
  dismissalRequired: boolean;
  returnToWorkRequired: boolean;
  changeOfFunctionRequired: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  risk?: any;
  examination?: Examination;
}

export interface CreateExamRuleByRiskDto {
  riskId: string;
  examinationId: string;
  mandatory?: boolean;
  admissionPeriodicity?: ExamRulePeriodicity;
  periodicPeriodicity?: ExamRulePeriodicity;
  dismissalRequired?: boolean;
  returnToWorkRequired?: boolean;
  changeOfFunctionRequired?: boolean;
  active?: boolean;
}

export interface ExamRuleByJob {
  id: string;
  jobId: string;
  examinationId: string;
  mandatory: boolean;
  admissionPeriodicity: ExamRulePeriodicity;
  periodicPeriodicity: ExamRulePeriodicity;
  dismissalRequired: boolean;
  returnToWorkRequired: boolean;
  changeOfFunctionRequired: boolean;
  active: boolean;
  overrideReason?: string;
  createdAt: string;
  updatedAt: string;
  job?: any;
  examination?: Examination;
}

export interface CreateExamRuleByJobDto {
  jobId: string;
  examinationId: string;
  mandatory?: boolean;
  admissionPeriodicity?: ExamRulePeriodicity;
  periodicPeriodicity?: ExamRulePeriodicity;
  dismissalRequired?: boolean;
  returnToWorkRequired?: boolean;
  changeOfFunctionRequired?: boolean;
  active?: boolean;
  overrideReason?: string;
}

export const riscosExameApi = {
  /**
   * Lista todas as regras de exames por risco
   */
  async getAll(filters?: { riskId?: string; examinationId?: string }): Promise<ExamRuleByRisk[]> {
    const params = new URLSearchParams();
    if (filters?.riskId) params.append('riskId', filters.riskId);
    if (filters?.examinationId) params.append('examinationId', filters.examinationId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<ExamRuleByRisk[]>(`/exam-rules/by-risk${query}`);
  },

  /**
   * Busca regra por ID
   */
  async getById(id: string): Promise<ExamRuleByRisk> {
    return fetchApi<ExamRuleByRisk>(`/exam-rules/by-risk/${id}`);
  },

  /**
   * Cria nova regra de exame por risco
   */
  async create(data: CreateExamRuleByRiskDto): Promise<ExamRuleByRisk> {
    return fetchApi<ExamRuleByRisk>('/exam-rules/by-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza regra existente
   */
  async update(id: string, data: Partial<CreateExamRuleByRiskDto>): Promise<ExamRuleByRisk> {
    return fetchApi<ExamRuleByRisk>(`/exam-rules/by-risk/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove regra (soft delete)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/exam-rules/by-risk/${id}`, {
      method: 'DELETE',
    });
  },
};

export const cargosExameApi = {
  /**
   * Lista todas as regras de exames por cargo
   */
  async getAll(filters?: { jobId?: string; examinationId?: string }): Promise<ExamRuleByJob[]> {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.examinationId) params.append('examinationId', filters.examinationId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<ExamRuleByJob[]>(`/exam-rules/by-job${query}`);
  },

  /**
   * Busca regra por ID
   */
  async getById(id: string): Promise<ExamRuleByJob> {
    return fetchApi<ExamRuleByJob>(`/exam-rules/by-job/${id}`);
  },

  /**
   * Busca regras consolidadas por cargo
   */
  async getConsolidatedByJob(jobId: string): Promise<any> {
    return fetchApi(`/exam-rules/by-job/consolidated/${jobId}`);
  },

  /**
   * Cria nova regra de exame por cargo
   */
  async create(data: CreateExamRuleByJobDto): Promise<ExamRuleByJob> {
    return fetchApi<ExamRuleByJob>('/exam-rules/by-job', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza regra existente
   */
  async update(id: string, data: Partial<CreateExamRuleByJobDto>): Promise<ExamRuleByJob> {
    return fetchApi<ExamRuleByJob>(`/exam-rules/by-job/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove regra (soft delete)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/exam-rules/by-job/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PCMSO ====================

export type PCMSOStatus = 'DRAFT' | 'SIGNED' | 'ARCHIVED';

export interface PCMSOVersion {
  id: string;
  companyId: string;
  version: number;
  status: PCMSOStatus;
  validFrom: string;
  validUntil: string;
  signedAt?: string;
  signedBy?: string;
  archivedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  company?: Empresa;
  examRequirements?: PCMSOExamRequirement[];
}

export interface PCMSOExamRequirement {
  id: string;
  pcmsoVersionId: string;
  examinationId: string;
  periodicity: ExamRulePeriodicity;
  targetJobs: string[];
  riskBased: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  examination?: Examination;
  pcmsoVersion?: PCMSOVersion;
}

export interface CreatePCMSOVersionDto {
  companyId: string;
  validFrom: string;
  validUntil: string;
  notes?: string;
}

export interface SignPCMSODto {
  signedBy: string;
}

export interface CreatePCMSOExamRequirementDto {
  pcmsoVersionId: string;
  examinationId: string;
  periodicity: ExamRulePeriodicity;
  targetJobs?: string[];
  riskBased?: boolean;
  notes?: string;
}

export const pcmsoApi = {
  /**
   * Lista todas as versões PCMSO
   */
  async getAll(filters?: { companyId?: string; status?: PCMSOStatus }): Promise<PCMSOVersion[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<PCMSOVersion[]>(`/pcmso${query}`);
  },

  /**
   * Busca versão PCMSO por ID
   */
  async getById(id: string): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>(`/pcmso/${id}`);
  },

  /**
   * Gera nova versão PCMSO automaticamente
   */
  async generate(data: CreatePCMSOVersionDto): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>('/pcmso/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cria nova versão PCMSO manualmente
   */
  async create(data: CreatePCMSOVersionDto): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>('/pcmso', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza versão PCMSO existente (apenas DRAFT)
   */
  async update(id: string, data: Partial<CreatePCMSOVersionDto>): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>(`/pcmso/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove versão PCMSO (apenas DRAFT)
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/pcmso/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Assina versão PCMSO (DRAFT → SIGNED)
   */
  async sign(id: string, data: SignPCMSODto): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>(`/pcmso/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Arquiva versão PCMSO (SIGNED → ARCHIVED)
   */
  async archive(id: string): Promise<PCMSOVersion> {
    return fetchApi<PCMSOVersion>(`/pcmso/${id}/archive`, {
      method: 'POST',
    });
  },

  /**
   * Valida conformidade NR-7 de uma versão PCMSO
   */
  async validateCompliance(id: string): Promise<{
    isCompliant: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    return fetchApi(`/pcmso/${id}/validate`);
  },

  // ==================== EXAM REQUIREMENTS ====================

  /**
   * Lista requisitos de exames de um PCMSO
   */
  async getExamRequirements(pcmsoVersionId: string): Promise<PCMSOExamRequirement[]> {
    return fetchApi<PCMSOExamRequirement[]>(`/pcmso/${pcmsoVersionId}/exam-requirements`);
  },

  /**
   * Adiciona requisito de exame ao PCMSO
   */
  async addExamRequirement(data: CreatePCMSOExamRequirementDto): Promise<PCMSOExamRequirement> {
    return fetchApi<PCMSOExamRequirement>('/pcmso/exam-requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza requisito de exame
   */
  async updateExamRequirement(
    id: string,
    data: Partial<CreatePCMSOExamRequirementDto>
  ): Promise<PCMSOExamRequirement> {
    return fetchApi<PCMSOExamRequirement>(`/pcmso/exam-requirements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove requisito de exame
   */
  async deleteExamRequirement(id: string): Promise<void> {
    await fetchApi(`/pcmso/exam-requirements/${id}`, {
      method: 'DELETE',
    });
  },
};

export const documentoApi = {
  async getAll() { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
  async assinar(id: string, data: any) { throw new ApiError('API não migrada'); },
  async uploadAssinado(id: string, data: any) { throw new ApiError('API não migrada'); },
  async invalidarAssinatura(id: string, obs: string) { throw new ApiError('API não migrada'); },
  async resetAssinado(id: string) { throw new ApiError('API não migrada'); },
};

export const pastaApi = {
  async getAll(empresaId?: string) { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
};

export const documentoTipoApi = {
  async getAll() { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
};

export const servicoPrestadoApi = {
  async getAll(filters?: any) { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
};

export const cobrancaApi = {
  async getAll(filters?: any) { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
};

export const nfeApi = {
  async getAll(filters?: any) { return []; },
  async getById(id: string) { throw new ApiError('API não migrada'); },
  async create(data: any) { throw new ApiError('API não migrada'); },
  async update(id: string, data: any) { throw new ApiError('API não migrada'); },
  async delete(id: string) { throw new ApiError('API não migrada'); },
  async emitir(data: any) { throw new ApiError('API não migrada'); },
  async consultarPorNumero(numero: string) { throw new ApiError('API não migrada'); },
  async consultarPorPeriodo(dataInicial: string, dataFinal: string) { throw new ApiError('API não migrada'); },
  async cancelar(id: string, motivo: string) { throw new ApiError('API não migrada'); },
};

// Interfaces de compatibilidade
export interface Pasta {
  id: string;
  empresaId: string;
  nome: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subPastas: number;
    documentos: number;
  };
}

// ==================== EXPORTAÇÕES ====================

export const api = {
  auth: authApi,
  empresas: empresaApi,
  funcionarios: funcionarioApi,
  exames: exameApi,
  riscosExame: riscosExameApi,
  cargosExame: cargosExameApi,
  pcmso: pcmsoApi,
  documentos: documentoApi,
  pastas: pastaApi,
  documentoTipos: documentoTipoApi,
  servicosPrestados: servicoPrestadoApi,
  cobrancas: cobrancaApi,
  nfes: nfeApi,
};

export default api;
