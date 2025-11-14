/**
 * Serviço de Validação de CNPJ com Receita Federal
 * Integra com APIs públicas para verificar situação cadastral
 */

export interface CNPJValidationResult {
  valid: boolean;
  situacao: 'ATIVA' | 'SUSPENSA' | 'INAPTA' | 'BAIXADA' | 'NULA' | 'DESCONHECIDA';
  razaoSocial?: string;
  nomeFantasia?: string;
  dataAbertura?: string;
  capitalSocial?: string;
  naturezaJuridica?: string;
  atividadePrincipal?: {
    codigo: string;
    descricao: string;
  };
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefone?: string;
  email?: string;
  motivoSituacao?: string;
  dataSituacao?: string;
  error?: string;
}

/**
 * Valida formato do CNPJ (apenas dígitos e tamanho)
 */
export function validarFormatoCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.length === 14;
}

/**
 * Valida dígitos verificadores do CNPJ
 */
export function validarDigitosCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais (inválido)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let tamanho = cleaned.length - 2;
  let numeros = cleaned.substring(0, tamanho);
  const digitos = cleaned.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Calcula segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cleaned.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Consulta CNPJ na API Brasil API (gratuita e rápida)
 * API: https://brasilapi.com.br/docs#tag/CNPJ
 */
export async function consultarCNPJBrasilAPI(cnpj: string): Promise<CNPJValidationResult> {
  const cleaned = cnpj.replace(/\D/g, '');

  if (!validarDigitosCNPJ(cleaned)) {
    return {
      valid: false,
      situacao: 'NULA',
      error: 'CNPJ inválido - dígitos verificadores incorretos',
    };
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleaned}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          situacao: 'NULA',
          error: 'CNPJ não encontrado na base da Receita Federal',
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Mapear situação cadastral
    let situacao: CNPJValidationResult['situacao'] = 'DESCONHECIDA';
    if (data.descricao_situacao_cadastral) {
      const situacaoStr = data.descricao_situacao_cadastral.toUpperCase();
      if (situacaoStr.includes('ATIVA')) situacao = 'ATIVA';
      else if (situacaoStr.includes('SUSPENSA')) situacao = 'SUSPENSA';
      else if (situacaoStr.includes('INAPTA')) situacao = 'INAPTA';
      else if (situacaoStr.includes('BAIXADA')) situacao = 'BAIXADA';
      else if (situacaoStr.includes('NULA')) situacao = 'NULA';
    }

    return {
      valid: situacao === 'ATIVA',
      situacao,
      razaoSocial: data.razao_social || undefined,
      nomeFantasia: data.nome_fantasia || undefined,
      dataAbertura: data.data_inicio_atividade || undefined,
      capitalSocial: data.capital_social ? `R$ ${parseFloat(data.capital_social).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : undefined,
      naturezaJuridica: data.natureza_juridica || undefined,
      atividadePrincipal: data.cnae_fiscal ? {
        codigo: data.cnae_fiscal,
        descricao: data.cnae_fiscal_descricao || '',
      } : undefined,
      endereco: {
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || undefined,
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
      },
      telefone: data.ddd_telefone_1 || undefined,
      email: data.email || undefined,
      motivoSituacao: data.motivo_situacao_cadastral || undefined,
      dataSituacao: data.data_situacao_cadastral || undefined,
    };
  } catch (error) {
    console.error('Erro ao consultar CNPJ na Brasil API:', error);
    return {
      valid: false,
      situacao: 'DESCONHECIDA',
      error: error instanceof Error ? error.message : 'Erro ao consultar CNPJ',
    };
  }
}

/**
 * Consulta CNPJ na API ReceitaWS (alternativa, com rate limit)
 * API: https://receitaws.com.br/api
 */
export async function consultarCNPJReceitaWS(cnpj: string): Promise<CNPJValidationResult> {
  const cleaned = cnpj.replace(/\D/g, '');

  if (!validarDigitosCNPJ(cleaned)) {
    return {
      valid: false,
      situacao: 'NULA',
      error: 'CNPJ inválido - dígitos verificadores incorretos',
    };
  }

  try {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleaned}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'ERROR') {
      return {
        valid: false,
        situacao: 'NULA',
        error: data.message || 'Erro ao consultar CNPJ',
      };
    }

    // Mapear situação cadastral
    let situacao: CNPJValidationResult['situacao'] = 'DESCONHECIDA';
    if (data.situacao) {
      const situacaoStr = data.situacao.toUpperCase();
      if (situacaoStr.includes('ATIVA')) situacao = 'ATIVA';
      else if (situacaoStr.includes('SUSPENSA')) situacao = 'SUSPENSA';
      else if (situacaoStr.includes('INAPTA')) situacao = 'INAPTA';
      else if (situacaoStr.includes('BAIXADA')) situacao = 'BAIXADA';
      else if (situacaoStr.includes('NULA')) situacao = 'NULA';
    }

    return {
      valid: situacao === 'ATIVA',
      situacao,
      razaoSocial: data.nome || undefined,
      nomeFantasia: data.fantasia || undefined,
      dataAbertura: data.abertura || undefined,
      capitalSocial: data.capital_social || undefined,
      naturezaJuridica: data.natureza_juridica || undefined,
      atividadePrincipal: data.atividade_principal && data.atividade_principal.length > 0 ? {
        codigo: data.atividade_principal[0].code || '',
        descricao: data.atividade_principal[0].text || '',
      } : undefined,
      endereco: {
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || undefined,
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
      },
      telefone: data.telefone || undefined,
      email: data.email || undefined,
      motivoSituacao: data.motivo_situacao || undefined,
      dataSituacao: data.data_situacao || undefined,
    };
  } catch (error) {
    console.error('Erro ao consultar CNPJ na ReceitaWS:', error);
    return {
      valid: false,
      situacao: 'DESCONHECIDA',
      error: error instanceof Error ? error.message : 'Erro ao consultar CNPJ',
    };
  }
}

/**
 * Consulta CNPJ com fallback entre APIs
 * Tenta Brasil API primeiro, se falhar tenta ReceitaWS
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJValidationResult> {
  // Tenta Brasil API primeiro (mais rápida e sem rate limit)
  let result = await consultarCNPJBrasilAPI(cnpj);

  // Se falhou por erro de API (não por CNPJ inválido), tenta ReceitaWS
  if (result.error && !result.error.includes('inválido')) {
    console.warn('Brasil API falhou, tentando ReceitaWS...');
    result = await consultarCNPJReceitaWS(cnpj);
  }

  return result;
}

/**
 * Retorna mensagem amigável sobre a situação cadastral
 */
export function getSituacaoMessage(situacao: CNPJValidationResult['situacao']): { message: string; color: string; icon: string } {
  switch (situacao) {
    case 'ATIVA':
      return {
        message: 'Empresa ATIVA na Receita Federal',
        color: 'green',
        icon: '✅',
      };
    case 'SUSPENSA':
      return {
        message: 'Empresa SUSPENSA - Verifique pendências na Receita Federal',
        color: 'yellow',
        icon: '⚠️',
      };
    case 'INAPTA':
      return {
        message: 'Empresa INAPTA - Regularização necessária',
        color: 'orange',
        icon: '⚠️',
      };
    case 'BAIXADA':
      return {
        message: 'Empresa BAIXADA - CNPJ cancelado',
        color: 'red',
        icon: '❌',
      };
    case 'NULA':
      return {
        message: 'CNPJ NULO - Não encontrado na Receita Federal',
        color: 'red',
        icon: '❌',
      };
    case 'DESCONHECIDA':
    default:
      return {
        message: 'Situação cadastral desconhecida',
        color: 'gray',
        icon: '❓',
      };
  }
}
