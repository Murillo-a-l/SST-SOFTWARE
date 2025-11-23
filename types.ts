export interface Stats {
  totalFuncionarios: number;
  examesAtrasados: number;
  vencendo30Dias: number;
  emDia: number;
  // New stats for documents
  totalContratos: number;
  contratosAtivos: number;
  contratosVencendo: number;
  contratosVencidos: number;
  // New stats for signatures
  assinaturasPendentes: number;
}

export interface User {
  id: number;
  nome: string;
  username: string;
  password: string; // INSECURE: For demo only. In production, this should be a hash.
  role: 'admin' | 'user';
}

export interface Empresa {
  id: number;
  matrizId: number | null; // null for parent companies
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  // PCMSO Config integrated here (OPTIONAL)
  medicoNome?: string;
  medicoCrm?: string;
  inicioValidade?: string;
  revisarAte?: string;
  // Financeiro
  diaPadraoVencimento?: number;
}

export interface Pasta {
  id: number;
  empresaId: number;
  nome: string;
  parentId: number | null; // null for root folders
}

export interface DocumentoTipo {
  id: number;
  nome: string; // e.g., "Contrato", "ASO", "PCMSO"
  validadeMesesPadrao: number | null; // Default validity in months
  alertaDias: number; // Days before expiration to show 'VENCENDO'
}

export type DocumentoStatus = 'ATIVO' | 'VENCENDO' | 'VENCIDO' | 'ENCERRADO';
export type SignatureStatus = 'NAO_REQUER' | 'PENDENTE' | 'ASSINADO' | 'REJEITADO';

export interface DocumentoEmpresa {
  id: number;
  empresaId: number;
  pastaId: number | null;
  nome: string;
  tipo: string; // References DocumentoTipo.nome
  dataUpload: string;

  // ARQUIVO ORIGINAL (obrigatório - não pode ser substituído)
  arquivoBase64: string; // Mantido para compatibilidade, representa o arquivo original
  arquivoOriginalBase64?: string; // Novo campo explícito

  // ARQUIVO ASSINADO (opcional - pode ser enviado/modificado)
  arquivoAssinadoBase64?: string;

  observacoes?: string;

  // Fields for expiration management
  temValidade: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  status: DocumentoStatus;
  dadosSensiveis: boolean;

  // Signature workflow fields (FLUXO COMPLETO)
  statusAssinatura: SignatureStatus;
  requerAssinaturaDeId: number | null; // User ID of the designated signer
  solicitadoPorId: number | null; // User ID of the requester
  dataSolicitacaoAssinatura: string | null;
  dataConclusaoAssinatura: string | null;
  observacoesAssinatura?: string;
}


export interface Funcionario {
  id: number;
  empresaId: number; // Foreign key to Empresa
  nome: string;
  matricula: string | null;
  cpf: string | null;
  whatsapp?: string | null;
  cargo: string;
  setor: string | null;
  data_admissao: string | null;
  data_ultimo_exame: string | null;
  tipo_ultimo_exame: string | null;
  ativo: boolean;
  created_at: string;
}

export interface ExameRealizado {
  id: number;
  funcionario_id: number;
  tipo_exame: string;
  data_realizacao: string;
  data_vencimento: string | null;
  observacoes: string | null;
}

export interface Cargo {
  id: number;
  nome_padronizado: string;
  cbo_codigo: string | null;
  descricao_atividades: string | null;
}

export interface Ambiente {
  id: number;
  nome: string;
  ghe: string | null;
  descricao_detalhada: string | null;
}

export interface Risco {
  id: number;
  nome: string;
  tipo: 'Físico' | 'Químico' | 'Biológico' | 'Ergonômico' | 'Acidentes' | string;
  descricao_agente: string | null;
  danos_possiveis: string | null;
}

export interface MasterExame {
  id: number;
  nome_exame: string;
  codigo_esocial: string | null;
  categoria: 'clinico' | 'complementar' | 'especifico' | string;
}

export interface CargoAmbienteLink {
  id: number;
  cargo_id: number;
  ambiente_id: number;
}

export interface CargoRiscoLink {
  id: number;
  cargo_id: number;
  risco_id: number;
}

export interface ProtocoloExame {
  id: number;
  cargo_id: number;
  exame_id: number;
  fazer_admissional: boolean;
  fazer_periodico: boolean;
  fazer_demissional: boolean;
  retorno_trabalho: boolean;
  mudanca_risco: boolean;
  periodicidade_detalhe: string | null;
}

export interface PeriodicidadeCargo {
  id: number;
  cargo_nome: string;
  periodicidade_meses: number;
}

// This is deprecated in favor of fields inside Empresa interface
export interface PcmsoConfig {
    empresa_nome: string;
    cnpj: string;
    medico_nome: string;
    medico_crm: string;
    inicio_validade: string;
    revisar_ate: string;
}

// --- Módulo Financeiro ---
export interface CatalogoServico {
  id: number;
  codigoInterno: string;
  nome: string;
  tipo: string;
  precoPadrao: number;
  descricao?: string;
  aliquotaISS?: number;
  codigoServicoLC116?: string;
  cnae?: string;
}

export interface ServicoPrestado {
  id: number;
  empresaId: number;
  servicoId: number; // FK to CatalogoServico
  funcionarioId?: number; // Optional FK to Funcionario
  dataRealizacao: string;
  valorCobrado: number;
  quantidade: number;
  descricaoAdicional?: string;
  cobrancaId?: number | null;
  nfeId?: number | null;
  status: 'Pendente' | 'Faturado' | 'Cobrado';
}

export type CobrancaStatus = 'Emitida' | 'Paga' | 'Vencida' | 'Cancelada';
export interface Cobranca {
  id: number;
  empresaId: number;
  servicosPrestadosIds: number[];
  valorTotal: number;
  dataEmissao: string;
  dataVencimento: string;
  status: CobrancaStatus;
  desconto?: number;
  multa?: number;
  juros?: number;
  observacoes?: string;
  nfeId?: number | null;
}

export type NFeStatus = 'Em Elaboração' | 'Enviada' | 'Autorizada' | 'Cancelada';
export interface NFe {
    id: number;
    empresaId: number;
    cobrancaId?: number;
    servicosPrestadosIds: number[];
    numero?: string;
    dataEmissao: string;
    valor: number;
    descricaoServicos: string;
    status: NFeStatus;
    xml?: string; // Stored as string, maybe base64 in future
    pdf?: string; // Stored as base64
}

export interface DbData {
  users: User[];
  empresas: Empresa[];
  pastas: Pasta[];
  documentosEmpresa: DocumentoEmpresa[];
  documentoTipos: DocumentoTipo[];
  funcionarios: Funcionario[];
  examesRealizados: ExameRealizado[];
  cargos: Cargo[];
  ambientes: Ambiente[];
  riscos: Risco[];
  masterExames: MasterExame[];
  cargoAmbienteLinks: CargoAmbienteLink[];
  cargoRiscoLinks: CargoRiscoLink[];
  protocolosExames: ProtocoloExame[];
  periodicidadesCargos: PeriodicidadeCargo[];
  pcmsoConfig: PcmsoConfig | null; // Kept for migration
  // Financeiro
  catalogoServicos: CatalogoServico[];
  servicosPrestados: ServicoPrestado[];
  cobrancas: Cobranca[];
  nfes: NFe[];
}

export type ManagementModalType = 'cargos' | 'ambientes' | 'riscos' | 'exames' | 'periodicidade' | 'documentoTipos' | 'catalogoServicos' | 'usuarios';

export type View = 'dashboard' | 'empresas' | 'funcionarios' | 'pcmso' | 'relatorios' | 'configuracoes' | 'financeiro';


export interface ValidationIssue {
  funcionarioId: number;
  nome: string;
  matricula: string | null;
  issues: string[];
}

export interface Notification {
    id: string; // Composite key like 'duplicate-cpf-123' or 'signature-doc-456'
    message: string;
    type: 'warning' | 'info' | 'error' | 'success' | 'task';
    date: string;
    isRead: boolean;
    relatedId: number; // ID of the related entity (e.g., DocumentoEmpresa.id)
    notificationType: 'DUPLICATE_EMPLOYEE' | 'SIGNATURE_REQUEST';
}

export interface DuplicateGroup {
    key: string;
    type: 'CPF' | 'Nome Similar';
    identifier: string;
    funcionarios: Funcionario[];
}
