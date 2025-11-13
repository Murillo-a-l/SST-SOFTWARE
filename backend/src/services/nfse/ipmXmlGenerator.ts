/**
 * Gerador de XML para NFSe no padrão IPM (AtendeNet)
 * Baseado no manual_eletron.pdf
 */

import { NFSeData, NFSeItem, NFSeConsultaParams, NFSeCancelamentoParams } from './types';

/**
 * Escapa caracteres especiais para XML
 */
function escapeXml(text: string | undefined): string {
  if (!text) return '';

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formata valor numérico para o padrão IPM (2 casas decimais com ponto)
 */
function formatarValor(valor: number): string {
  return valor.toFixed(2);
}

/**
 * Remove todos os caracteres não numéricos
 */
function apenasNumeros(texto: string): string {
  return texto.replace(/\D/g, '');
}

/**
 * Valida dados obrigatórios da NFSe
 */
function validarDadosNFSe(data: NFSeData): void {
  const erros: string[] = [];

  if (!data.identificador) {
    erros.push('Identificador é obrigatório');
  }

  if (!data.nf.dataFatoGerador) {
    erros.push('Data do fato gerador é obrigatória');
  }

  if (data.nf.valorTotal <= 0) {
    erros.push('Valor total deve ser maior que zero');
  }

  if (!data.prestador.cpfcnpj) {
    erros.push('CPF/CNPJ do prestador é obrigatório');
  }

  if (!data.prestador.cidade) {
    erros.push('Código TOM da cidade do prestador é obrigatório');
  }

  if (!data.tomador.cpfcnpj) {
    erros.push('CPF/CNPJ do tomador é obrigatório');
  }

  if (!data.tomador.nomeRazaoSocial) {
    erros.push('Nome/Razão Social do tomador é obrigatório');
  }

  if (!data.tomador.cidade) {
    erros.push('Código TOM da cidade do tomador é obrigatório');
  }

  if (!data.itens || data.itens.length === 0) {
    erros.push('Deve haver pelo menos um item/serviço');
  }

  // Validação dos itens
  data.itens.forEach((item, index) => {
    if (!item.codigoItemListaServico) {
      erros.push(`Item ${index + 1}: Código do serviço (LC 116) é obrigatório`);
    }
    if (!item.descritivo) {
      erros.push(`Item ${index + 1}: Descrição do serviço é obrigatória`);
    }
    if (item.valorTributavel <= 0) {
      erros.push(`Item ${index + 1}: Valor tributável deve ser maior que zero`);
    }
  });

  if (erros.length > 0) {
    throw new Error('Erros na validação da NFSe:\n' + erros.join('\n'));
  }
}

/**
 * Gera XML de item/serviço
 */
function gerarXmlItem(item: NFSeItem): string {
  let xml = '    <lista>\n';

  xml += `      <tributa_municipio_prestador>${item.tributaMunicipioPrestador}</tributa_municipio_prestador>\n`;
  xml += `      <codigo_item_lista_servico>${escapeXml(item.codigoItemListaServico)}</codigo_item_lista_servico>\n`;
  xml += `      <descritivo>${escapeXml(item.descritivo)}</descritivo>\n`;
  xml += `      <aliquota_item_lista_servico>${formatarValor(item.aliquotaItemListaServico)}</aliquota_item_lista_servico>\n`;
  xml += `      <situacao_tributaria>${item.situacaoTributaria}</situacao_tributaria>\n`;
  xml += `      <valor_tributavel>${formatarValor(item.valorTributavel)}</valor_tributavel>\n`;

  // Campos opcionais
  if (item.cnae) {
    xml += `      <cnae>${escapeXml(item.cnae)}</cnae>\n`;
  }

  if (item.codigoTributacaoMunicipio) {
    xml += `      <codigo_tributacao_municipio>${escapeXml(item.codigoTributacaoMunicipio)}</codigo_tributacao_municipio>\n`;
  }

  if (item.deducao !== undefined && item.deducao > 0) {
    xml += `      <deducao>${formatarValor(item.deducao)}</deducao>\n`;
  }

  xml += '    </lista>\n';

  return xml;
}

/**
 * Gera XML completo para emissão de NFSe
 */
export function generateNFSeXML(data: NFSeData): string {
  // Validar dados antes de gerar XML
  validarDadosNFSe(data);

  let xml = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
  xml += '<nfse>\n';

  // Modo teste (opcional)
  if (data.modoTeste) {
    xml += '  <nfse_teste>1</nfse_teste>\n';
  }

  // Identificador único
  xml += `  <identificador>${escapeXml(data.identificador)}</identificador>\n`;

  // Dados da nota fiscal
  xml += '  <nf>\n';
  xml += `    <data_fato_gerador>${escapeXml(data.nf.dataFatoGerador)}</data_fato_gerador>\n`;
  xml += `    <valor_total>${formatarValor(data.nf.valorTotal)}</valor_total>\n`;
  xml += `    <valor_desconto>${formatarValor(data.nf.valorDesconto)}</valor_desconto>\n`;

  if (data.nf.observacao) {
    xml += `    <observacao>${escapeXml(data.nf.observacao)}</observacao>\n`;
  }

  xml += '  </nf>\n';

  // Dados do prestador
  xml += '  <prestador>\n';
  xml += `    <cpfcnpj>${apenasNumeros(data.prestador.cpfcnpj)}</cpfcnpj>\n`;
  xml += `    <cidade>${escapeXml(data.prestador.cidade)}</cidade>\n`;
  xml += '  </prestador>\n';

  // Dados do tomador
  xml += '  <tomador>\n';
  xml += `    <tipo>${data.tomador.tipo}</tipo>\n`;
  xml += `    <cpfcnpj>${apenasNumeros(data.tomador.cpfcnpj)}</cpfcnpj>\n`;
  xml += `    <nome_razao_social>${escapeXml(data.tomador.nomeRazaoSocial)}</nome_razao_social>\n`;

  // Campos opcionais do tomador
  if (data.tomador.sobrenomeNomeFantasia) {
    xml += `    <sobrenome_nome_fantasia>${escapeXml(data.tomador.sobrenomeNomeFantasia)}</sobrenome_nome_fantasia>\n`;
  }

  xml += `    <logradouro>${escapeXml(data.tomador.logradouro)}</logradouro>\n`;

  if (data.tomador.numero) {
    xml += `    <numero>${escapeXml(data.tomador.numero)}</numero>\n`;
  }

  if (data.tomador.complemento) {
    xml += `    <complemento>${escapeXml(data.tomador.complemento)}</complemento>\n`;
  }

  if (data.tomador.bairro) {
    xml += `    <bairro>${escapeXml(data.tomador.bairro)}</bairro>\n`;
  }

  xml += `    <cidade>${escapeXml(data.tomador.cidade)}</cidade>\n`;

  if (data.tomador.uf) {
    xml += `    <uf>${escapeXml(data.tomador.uf)}</uf>\n`;
  }

  if (data.tomador.cep) {
    xml += `    <cep>${apenasNumeros(data.tomador.cep)}</cep>\n`;
  }

  if (data.tomador.email) {
    xml += `    <email>${escapeXml(data.tomador.email)}</email>\n`;
  }

  if (data.tomador.ddd && data.tomador.telefone) {
    xml += `    <ddd>${apenasNumeros(data.tomador.ddd)}</ddd>\n`;
    xml += `    <telefone>${apenasNumeros(data.tomador.telefone)}</telefone>\n`;
  }

  xml += '  </tomador>\n';

  // Itens/Serviços
  xml += '  <itens>\n';
  data.itens.forEach(item => {
    xml += gerarXmlItem(item);
  });
  xml += '  </itens>\n';

  xml += '</nfse>\n';

  return xml;
}

/**
 * Gera XML para consulta de NFSe
 */
export function generateConsultaNFSeXML(params: NFSeConsultaParams): string {
  let xml = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
  xml += '<nfse>\n';

  // Dados do prestador
  xml += '  <prestador>\n';
  xml += `    <cpfcnpj>${apenasNumeros(params.prestador.cpfcnpj)}</cpfcnpj>\n`;
  xml += `    <cidade>${escapeXml(params.prestador.cidade)}</cidade>\n`;
  xml += '  </prestador>\n';

  // Consulta por número
  if (params.numeroNfse) {
    xml += `  <numero_nfse>${escapeXml(params.numeroNfse)}</numero_nfse>\n`;
  }

  // Consulta por período
  if (params.dataInicial && params.dataFinal) {
    xml += `  <data_inicial>${escapeXml(params.dataInicial)}</data_inicial>\n`;
    xml += `  <data_final>${escapeXml(params.dataFinal)}</data_final>\n`;
  }

  xml += '</nfse>\n';

  return xml;
}

/**
 * Gera XML para cancelamento de NFSe
 */
export function generateCancelamentoNFSeXML(params: NFSeCancelamentoParams): string {
  if (!params.numeroNfse) {
    throw new Error('Número da NFSe é obrigatório para cancelamento');
  }

  if (!params.motivoCancelamento) {
    throw new Error('Motivo do cancelamento é obrigatório');
  }

  let xml = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
  xml += '<nfse>\n';

  // Dados do prestador
  xml += '  <prestador>\n';
  xml += `    <cpfcnpj>${apenasNumeros(params.prestador.cpfcnpj)}</cpfcnpj>\n`;
  xml += `    <cidade>${escapeXml(params.prestador.cidade)}</cidade>\n`;
  xml += '  </prestador>\n';

  // Número da nota a cancelar
  xml += `  <numero_nfse>${escapeXml(params.numeroNfse)}</numero_nfse>\n`;

  // Motivo do cancelamento
  xml += `  <motivo_cancelamento>${escapeXml(params.motivoCancelamento)}</motivo_cancelamento>\n`;

  xml += '</nfse>\n';

  return xml;
}
