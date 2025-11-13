/**
 * Tipos para integração NFSe padrão IPM (AtendeNet)
 * Baseado no manual_eletron.pdf
 */

export interface NFSeData {
  // Identificador único da nota
  identificador: string;

  // Dados da nota fiscal
  nf: {
    dataFatoGerador: string; // DD/MM/AAAA
    valorTotal: number;
    valorDesconto: number;
    observacao?: string;
  };

  // Dados do prestador (quem emite a nota)
  prestador: {
    cpfcnpj: string; // Apenas números
    cidade: string; // Código TOM
  };

  // Dados do tomador (cliente)
  tomador: {
    tipo: 'F' | 'J' | 'E'; // F=Física, J=Jurídica, E=Estrangeiro
    cpfcnpj: string; // Apenas números
    nomeRazaoSocial: string;
    sobrenomeNomeFantasia?: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string; // Código TOM
    uf?: string;
    cep?: string;
    email?: string;
    ddd?: string;
    telefone?: string;
  };

  // Itens/Serviços da nota
  itens: NFSeItem[];

  // Modo de teste (opcional)
  modoTeste?: boolean;
}

export interface NFSeItem {
  // 1=Tributa no município do prestador, 0=Tributa fora
  tributaMunicipioPrestador: 0 | 1;

  // Código do serviço conforme LC 116/2003
  codigoItemListaServico: string;

  // Descrição do serviço
  descritivo: string;

  // Alíquota do ISS (%)
  aliquotaItemListaServico: number;

  // Situação tributária:
  // 0=TI (Tributada Integralmente)
  // 1=TIRF (ISS Retido na Fonte)
  // 2=TIST (Substituição Tributária)
  // 3=TRBC (Redução Base de Cálculo)
  // 6=ISE (Isenta)
  // 7=IMU (Imune)
  situacaoTributaria: 0 | 1 | 2 | 3 | 6 | 7;

  // Valor tributável
  valorTributavel: number;

  // CNAE (opcional)
  cnae?: string;

  // Código de tributação do município (opcional)
  codigoTributacaoMunicipio?: string;

  // Dedução (opcional)
  deducao?: number;
}

export interface NFSeResponse {
  sucesso: boolean;
  mensagem: string;
  codigo?: string;
  numeroNfse?: string;
  serieNfse?: string;
  dataNfse?: string;
  horaNfse?: string;
  linkNfse?: string;
  codVerificadorAutenticidade?: string;
}

export interface NFSeConsultaParams {
  prestador: {
    cpfcnpj: string;
    cidade: string;
  };
  // Consulta por número da nota
  numeroNfse?: string;
  // Consulta por período
  dataInicial?: string; // DD/MM/AAAA
  dataFinal?: string; // DD/MM/AAAA
}

export interface NFSeCancelamentoParams {
  prestador: {
    cpfcnpj: string;
    cidade: string;
  };
  numeroNfse: string;
  motivoCancelamento: string;
}

export interface IPMAuthConfig {
  login: string; // CPF/CNPJ
  senha: string;
  cidade: string; // Código TOM
}

export interface IPMWebserviceConfig extends IPMAuthConfig {
  // URL do webservice (varia por município)
  urlWebservice: string;
  // Se true, adiciona ?eletron=1 para retorno XML
  retornoXml?: boolean;
}
