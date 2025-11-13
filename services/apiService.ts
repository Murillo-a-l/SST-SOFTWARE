/**
 * API Service - Cliente HTTP para comunicação com o backend
 * Substitui dbService.ts (localStorage) por chamadas HTTP reais
 */

const API_BASE_URL = 'http://localhost:3001/api';
const SESSION_KEY = 'occupational_health_session';

// Interface para respostas da API
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

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
 * Obtém o token JWT do sessionStorage
 */
function getToken(): string | null {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  } catch {
    return null;
  }
}

/**
 * Salva o token JWT no sessionStorage
 */
function saveToken(token: string, user: any): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
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

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Tenta parsear resposta JSON
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        'Resposta inválida do servidor',
        response.status
      );
    }

    // Verifica se houve erro HTTP
    if (!response.ok) {
      throw new ApiError(
        data.message || `Erro HTTP ${response.status}`,
        response.status,
        data
      );
    }

    // Verifica se a API retornou erro
    if (data.status === 'error') {
      throw new ApiError(
        data.message || 'Erro desconhecido',
        response.status,
        data
      );
    }

    return data.data as T;
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

export interface User {
  id: number;
  nome: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  /**
   * Faz login no sistema
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Salva token no sessionStorage
    saveToken(response.token, response.user);

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

// ==================== EMPRESAS ====================

export interface Empresa {
  id: number;
  matrizId: number | null;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  medicoNome: string;
  medicoCrm: string;
  inicioValidade: string;
  revisarAte: string;
  diaPadraoVencimento?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  _count?: {
    funcionarios: number;
    documentos: number;
  };
  filiais?: Empresa[];
}

export interface CreateEmpresaDto {
  matrizId?: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  medicoNome: string;
  medicoCrm: string;
  inicioValidade: string;
  revisarAte: string;
  diaPadraoVencimento?: number;
}

export const empresaApi = {
  /**
   * Lista todas as empresas
   */
  async getAll(): Promise<Empresa[]> {
    const response = await fetchApi<{ empresas: Empresa[] }>('/empresas');
    return response.empresas;  // fetchApi já retorna data.data, que contém { empresas: [] }
  },

  /**
   * Busca empresa por ID
   */
  async getById(id: number): Promise<Empresa> {
    return fetchApi<Empresa>(`/empresas/${id}`);
  },

  /**
   * Cria nova empresa
   */
  async create(data: CreateEmpresaDto): Promise<Empresa> {
    const response = await fetchApi<{ empresa: Empresa }>('/empresas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.empresa;
  },

  /**
   * Atualiza empresa existente
   */
  async update(id: number, data: Partial<CreateEmpresaDto>): Promise<Empresa> {
    const response = await fetchApi<{ empresa: Empresa }>(`/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.empresa;
  },

  /**
   * Remove empresa (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/empresas/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== FUNCIONÁRIOS ====================

export interface Funcionario {
  id: number;
  empresaId: number;
  nome: string;
  matricula?: string;
  cpf?: string;
  whatsapp?: string;
  cargo: string;
  setor?: string;
  dataAdmissao?: string;
  dataUltimoExame?: string;
  tipoUltimoExame?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  exames?: any[];
}

export interface CreateFuncionarioDto {
  empresaId: number;
  nome: string;
  matricula?: string;
  cpf?: string;
  whatsapp?: string;
  cargo: string;
  setor?: string;
  dataAdmissao?: string;
  ativo?: boolean;
}

export interface FuncionarioFilters {
  empresaId?: number;
  ativo?: boolean;
}

export const funcionarioApi = {
  /**
   * Lista todos os funcionários (com filtros opcionais)
   */
  async getAll(filters?: FuncionarioFilters): Promise<Funcionario[]> {
    const params = new URLSearchParams();
    if (filters?.empresaId) params.append('empresaId', filters.empresaId.toString());
    if (filters?.ativo !== undefined) params.append('ativo', filters.ativo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<{ funcionarios: Funcionario[] }>(`/funcionarios${query}`);
    return response.funcionarios;
  },

  /**
   * Busca funcionário por ID
   */
  async getById(id: number): Promise<Funcionario> {
    const response = await fetchApi<{ funcionario: Funcionario }>(`/funcionarios/${id}`);
    return response.funcionario;
  },

  /**
   * Cria novo funcionário
   */
  async create(data: CreateFuncionarioDto): Promise<Funcionario> {
    const response = await fetchApi<{ funcionario: Funcionario }>('/funcionarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.funcionario;
  },

  /**
   * Atualiza funcionário existente
   */
  async update(id: number, data: Partial<CreateFuncionarioDto>): Promise<Funcionario> {
    const response = await fetchApi<{ funcionario: Funcionario }>(`/funcionarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.funcionario;
  },

  /**
   * Remove funcionário (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/funcionarios/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== EXAME API ====================

interface CreateExameDto {
  funcionarioId: number;
  tipoExame: string;
  dataRealizacao: string;
  dataVencimento?: string;
  observacoes?: string;
}

export const exameApi = {
  /**
   * Busca todos os exames
   */
  async getAll(): Promise<any[]> {
    return await fetchApi<any[]>('/exames');
  },

  /**
   * Busca exame por ID
   */
  async getById(id: number): Promise<any> {
    return await fetchApi<any>(`/exames/${id}`);
  },

  /**
   * Cria novo exame
   */
  async create(data: CreateExameDto): Promise<any> {
    return await fetchApi<any>('/exames', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza exame existente
   */
  async update(id: number, data: Partial<CreateExameDto>): Promise<any> {
    return await fetchApi<any>(`/exames/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove exame (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/exames/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DOCUMENTO API ====================

interface CreateDocumentoDto {
  empresaId: number;
  pastaId?: number | null;
  tipo?: string; // Document type name (alternative to tipoId)
  tipoId?: number; // Document type ID
  nome: string;
  arquivoUrl?: string; // File URL
  arquivoBase64?: string; // Base64 encoded file (alternative to arquivoUrl)
  observacoes?: string;
  temValidade?: boolean;
  dataInicio?: string | null;
  dataFim?: string | null;
  status?: string;
  dadosSensiveis?: boolean;
  statusAssinatura?: string;
  requerAssinaturaDeId?: number | null;
  solicitadoPorId?: number | null;
  dataSolicitacaoAssinatura?: string;
}

export const documentoApi = {
  /**
   * Busca todos os documentos
   */
  async getAll(): Promise<any[]> {
    const docs = await fetchApi<any[]>('/documentos');
    // Map arquivoUrl to arquivoBase64 for frontend compatibility
    return docs.map(doc => ({
      ...doc,
      arquivoBase64: doc.arquivoUrl,
      arquivoAssinadoBase64: doc.arquivoAssinadoUrl || null,
      tipo: doc.tipo?.nome || doc.tipo, // Handle both nested and flat tipo
    }));
  },

  /**
   * Busca documento por ID
   */
  async getById(id: number): Promise<any> {
    const doc = await fetchApi<any>(`/documentos/${id}`);
    // Map arquivoUrl to arquivoBase64 for frontend compatibility
    return {
      ...doc,
      arquivoBase64: doc.arquivoUrl,
      arquivoAssinadoBase64: doc.arquivoAssinadoUrl || null,
      tipo: doc.tipo?.nome || doc.tipo,
    };
  },

  /**
   * Cria novo documento
   */
  async create(data: CreateDocumentoDto): Promise<any> {
    return await fetchApi<any>('/documentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza documento existente
   */
  async update(id: number, data: Partial<CreateDocumentoDto>): Promise<any> {
    return await fetchApi<any>(`/documentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove documento (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/documentos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PASTA API ====================

export interface Pasta {
  id: number;
  empresaId: number;
  nome: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  _count?: {
    subPastas: number;
    documentos: number;
  };
}

interface CreatePastaDto {
  empresaId: number;
  nome: string;
  parentId?: number | null;
}

export const pastaApi = {
  /**
   * Lista todas as pastas (com filtros opcionais)
   */
  async getAll(empresaId?: number): Promise<Pasta[]> {
    const params = new URLSearchParams();
    if (empresaId) params.append('empresaId', empresaId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<{ pastas: Pasta[] }>(`/pastas${query}`);
    return response.pastas;
  },

  /**
   * Busca pasta por ID
   */
  async getById(id: number): Promise<Pasta> {
    const response = await fetchApi<{ pasta: Pasta }>(`/pastas/${id}`);
    return response.pasta;
  },

  /**
   * Cria nova pasta
   */
  async create(data: CreatePastaDto): Promise<Pasta> {
    const response = await fetchApi<{ pasta: Pasta }>('/pastas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.pasta;
  },

  /**
   * Atualiza pasta existente
   */
  async update(id: number, data: Partial<CreatePastaDto>): Promise<Pasta> {
    const response = await fetchApi<{ pasta: Pasta }>(`/pastas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.pasta;
  },

  /**
   * Remove pasta (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/pastas/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DOCUMENTO TIPO API ====================

export interface DocumentoTipo {
  id: number;
  nome: string;
  validadeMesesPadrao: number | null;
  alertaDias: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documentos: number;
  };
}

interface CreateDocumentoTipoDto {
  nome: string;
  validadeMesesPadrao?: number | null;
  alertaDias?: number;
}

export const documentoTipoApi = {
  /**
   * Lista todos os tipos de documento
   */
  async getAll(): Promise<DocumentoTipo[]> {
    const response = await fetchApi<{ tipos: DocumentoTipo[] }>('/documento-tipos');
    return response.tipos;
  },

  /**
   * Busca tipo de documento por ID
   */
  async getById(id: number): Promise<DocumentoTipo> {
    const response = await fetchApi<{ tipo: DocumentoTipo }>(`/documento-tipos/${id}`);
    return response.tipo;
  },

  /**
   * Cria novo tipo de documento
   */
  async create(data: CreateDocumentoTipoDto): Promise<DocumentoTipo> {
    const response = await fetchApi<{ tipo: DocumentoTipo }>('/documento-tipos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.tipo;
  },

  /**
   * Atualiza tipo de documento existente
   */
  async update(id: number, data: Partial<CreateDocumentoTipoDto>): Promise<DocumentoTipo> {
    const response = await fetchApi<{ tipo: DocumentoTipo }>(`/documento-tipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.tipo;
  },

  /**
   * Remove tipo de documento
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/documento-tipos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CATÁLOGO DE SERVIÇOS API ====================

export interface CatalogoServico {
  id: number;
  codigoInterno: string;
  nome: string;
  tipo: string;
  precoPadrao: string; // Decimal como string
  descricao?: string;
  aliquotaISS?: string; // Decimal como string
  codigoServicoLC116?: string;
  cnae?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    servicosPrestados: number;
  };
}

interface CreateCatalogoServicoDto {
  codigoInterno: string;
  nome: string;
  tipo: string;
  precoPadrao: number | string;
  descricao?: string;
  aliquotaISS?: number | string;
  codigoServicoLC116?: string;
  cnae?: string;
}

export const catalogoServicoApi = {
  /**
   * Lista todos os serviços do catálogo
   */
  async getAll(): Promise<CatalogoServico[]> {
    const response = await fetchApi<{ servicos: CatalogoServico[] }>('/catalogo-servicos');
    return response.servicos;
  },

  /**
   * Busca serviço por ID
   */
  async getById(id: number): Promise<CatalogoServico> {
    const response = await fetchApi<{ servico: CatalogoServico }>(`/catalogo-servicos/${id}`);
    return response.servico;
  },

  /**
   * Cria novo serviço no catálogo
   */
  async create(data: CreateCatalogoServicoDto): Promise<CatalogoServico> {
    const response = await fetchApi<{ servico: CatalogoServico }>('/catalogo-servicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.servico;
  },

  /**
   * Atualiza serviço existente
   */
  async update(id: number, data: Partial<CreateCatalogoServicoDto>): Promise<CatalogoServico> {
    const response = await fetchApi<{ servico: CatalogoServico }>(`/catalogo-servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.servico;
  },

  /**
   * Remove serviço do catálogo
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/catalogo-servicos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SERVIÇO PRESTADO API ====================

export interface ServicoPrestado {
  id: number;
  empresaId: number;
  servicoId: number;
  funcionarioId?: number;
  dataRealizacao: string;
  valorCobrado: string; // Decimal como string
  quantidade: number;
  descricaoAdicional?: string;
  status: string;
  cobrancaId?: number;
  nfeId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  empresa?: any;
  servico?: any;
  funcionario?: any;
  cobranca?: any;
  nfe?: any;
}

interface CreateServicoPrestadoDto {
  empresaId: number;
  servicoId: number;
  funcionarioId?: number;
  dataRealizacao: string;
  valorCobrado: number | string;
  quantidade?: number;
  descricaoAdicional?: string;
  status?: string;
  cobrancaId?: number;
  nfeId?: number;
}

export const servicoPrestadoApi = {
  /**
   * Lista todos os serviços prestados (com filtros opcionais)
   */
  async getAll(filters?: { empresaId?: number; status?: string }): Promise<ServicoPrestado[]> {
    const params = new URLSearchParams();
    if (filters?.empresaId) params.append('empresaId', filters.empresaId.toString());
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<{ servicos: ServicoPrestado[] }>(`/servicos-prestados${query}`);
    return response.servicos;
  },

  /**
   * Busca serviço prestado por ID
   */
  async getById(id: number): Promise<ServicoPrestado> {
    const response = await fetchApi<{ servico: ServicoPrestado }>(`/servicos-prestados/${id}`);
    return response.servico;
  },

  /**
   * Cria novo serviço prestado
   */
  async create(data: CreateServicoPrestadoDto): Promise<ServicoPrestado> {
    const response = await fetchApi<{ servico: ServicoPrestado }>('/servicos-prestados', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.servico;
  },

  /**
   * Atualiza serviço prestado existente
   */
  async update(id: number, data: Partial<CreateServicoPrestadoDto>): Promise<ServicoPrestado> {
    const response = await fetchApi<{ servico: ServicoPrestado }>(`/servicos-prestados/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.servico;
  },

  /**
   * Remove serviço prestado (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/servicos-prestados/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== COBRANÇA API ====================

export interface Cobranca {
  id: number;
  empresaId: number;
  valorTotal: string; // Decimal como string
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: string;
  desconto?: string; // Decimal como string
  multa?: string; // Decimal como string
  juros?: string; // Decimal como string
  observacoes?: string;
  nfeId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  empresa?: any;
  servicosPrestados?: any[];
  nfe?: any;
  _count?: {
    servicosPrestados: number;
  };
}

interface CreateCobrancaDto {
  empresaId: number;
  valorTotal: number | string;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  status?: string;
  desconto?: number | string;
  multa?: number | string;
  juros?: number | string;
  observacoes?: string;
  nfeId?: number;
}

export const cobrancaApi = {
  /**
   * Lista todas as cobranças (com filtros opcionais)
   */
  async getAll(filters?: { empresaId?: number; status?: string }): Promise<Cobranca[]> {
    const params = new URLSearchParams();
    if (filters?.empresaId) params.append('empresaId', filters.empresaId.toString());
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<{ cobrancas: Cobranca[] }>(`/cobrancas${query}`);
    return response.cobrancas;
  },

  /**
   * Busca cobrança por ID
   */
  async getById(id: number): Promise<Cobranca> {
    const response = await fetchApi<{ cobranca: Cobranca }>(`/cobrancas/${id}`);
    return response.cobranca;
  },

  /**
   * Cria nova cobrança
   */
  async create(data: CreateCobrancaDto): Promise<Cobranca> {
    const response = await fetchApi<{ cobranca: Cobranca }>('/cobrancas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.cobranca;
  },

  /**
   * Atualiza cobrança existente
   */
  async update(id: number, data: Partial<CreateCobrancaDto>): Promise<Cobranca> {
    const response = await fetchApi<{ cobranca: Cobranca }>(`/cobrancas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.cobranca;
  },

  /**
   * Remove cobrança (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/cobrancas/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== NFE API ====================

export interface NFe {
  id: number;
  empresaId: number;
  numero?: string;
  dataEmissao: string;
  valor: string; // Decimal como string
  descricaoServicos: string;
  status: string;
  xml?: string;
  pdf?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  empresa?: any;
  servicosPrestados?: any[];
  cobrancas?: any[];
  _count?: {
    servicosPrestados: number;
    cobrancas: number;
  };
}

interface CreateNFeDto {
  empresaId: number;
  numero?: string;
  dataEmissao: string;
  valor: number | string;
  descricaoServicos: string;
  status?: string;
  xml?: string;
  pdf?: string;
}

// Interface para resposta de emissão de NFSe
export interface NFSeEmissaoResponse {
  message: string;
  nfe: NFe;
  response: {
    numero?: string;
    serie?: string;
    data?: string;
    hora?: string;
    link?: string;
    codigoVerificador?: string;
  };
}

// Interface para dados de emissão de NFSe
interface EmitirNFSeDto {
  empresaId: number;
  servicosPrestadosIds: number[];
  observacao?: string;
}

export const nfeApi = {
  /**
   * Lista todas as NFes (com filtros opcionais)
   */
  async getAll(filters?: { empresaId?: number; status?: string }): Promise<NFe[]> {
    const params = new URLSearchParams();
    if (filters?.empresaId) params.append('empresaId', filters.empresaId.toString());
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<{ nfes: NFe[] }>(`/nfes${query}`);
    return response.nfes;
  },

  /**
   * Busca NFe por ID
   */
  async getById(id: number): Promise<NFe> {
    const response = await fetchApi<{ nfe: NFe }>(`/nfes/${id}`);
    return response.nfe;
  },

  /**
   * Cria nova NFe
   */
  async create(data: CreateNFeDto): Promise<NFe> {
    const response = await fetchApi<{ nfe: NFe }>('/nfes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.nfe;
  },

  /**
   * Atualiza NFe existente
   */
  async update(id: number, data: Partial<CreateNFeDto>): Promise<NFe> {
    const response = await fetchApi<{ nfe: NFe }>(`/nfes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.nfe;
  },

  /**
   * Remove NFe (soft delete)
   */
  async delete(id: number): Promise<void> {
    await fetchApi(`/nfes/${id}`, {
      method: 'DELETE',
    });
  },

  // ========================================
  // INTEGRAÇÃO COM WEBSERVICE IPM
  // ========================================

  /**
   * Emite NFSe via webservice IPM (AtendeNet)
   */
  async emitir(data: EmitirNFSeDto): Promise<NFSeEmissaoResponse> {
    return await fetchApi<NFSeEmissaoResponse>('/nfes/emitir', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Consulta NFSe por número no webservice IPM
   */
  async consultarPorNumero(numero: string): Promise<any> {
    const response = await fetchApi<{ nfse: any }>(`/nfes/${numero}/consultar`);
    return response.nfse;
  },

  /**
   * Consulta NFSe por período no webservice IPM
   */
  async consultarPorPeriodo(dataInicial: string, dataFinal: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('dataInicial', dataInicial);
    params.append('dataFinal', dataFinal);

    const response = await fetchApi<{ nfses: any[] }>(`/nfes/consultar-periodo?${params.toString()}`);
    return response.nfses;
  },

  /**
   * Cancela NFSe no webservice IPM
   */
  async cancelar(id: number, motivoCancelamento: string): Promise<{ message: string; response: any }> {
    return await fetchApi<{ message: string; response: any }>(`/nfes/${id}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ motivoCancelamento }),
    });
  },
};

// ==================== EXPORTAÇÕES ====================

export const api = {
  auth: authApi,
  empresas: empresaApi,
  funcionarios: funcionarioApi,
  exames: exameApi,
  documentos: documentoApi,
  pastas: pastaApi,
  documentoTipos: documentoTipoApi,
  catalogoServicos: catalogoServicoApi,
  servicosPrestados: servicoPrestadoApi,
  cobrancas: cobrancaApi,
  nfes: nfeApi,
};

export default api;
