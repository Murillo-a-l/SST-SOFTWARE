/**
 * Parser de XML de retorno do webservice IPM (AtendeNet)
 * Baseado no manual_eletron.pdf
 */

import { parseString } from 'xml2js';
import { NFSeResponse } from './types';

/**
 * Promisifica o parseString do xml2js
 */
function parseXmlAsync(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false, trim: true }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Extrai valor de uma tag XML (pode vir como string ou objeto com _)
 */
function extrairValor(valor: any): string {
  if (typeof valor === 'string') {
    return valor;
  }
  if (valor && typeof valor === 'object' && valor._) {
    return String(valor._);
  }
  return '';
}

/**
 * Faz parse do XML de retorno do IPM
 *
 * Estrutura esperada:
 * <retorno>
 *   <mensagem>
 *     <codigo>[1] Sucesso</codigo>
 *   </mensagem>
 *   <numero_nfse>123</numero_nfse>
 *   <serie_nfse>1</serie_nfse>
 *   <data_nfse>01/01/2024</data_nfse>
 *   <hora_nfse>10:30:00</hora_nfse>
 *   <link_nfse>http://...</link_nfse>
 *   <cod_verificador_autenticidade>ABC123</cod_verificador_autenticidade>
 * </retorno>
 */
export async function parseNFSeResponse(xmlResponse: string): Promise<NFSeResponse> {
  try {
    // Parse do XML
    const parsed = await parseXmlAsync(xmlResponse);

    // Verificar se é um retorno válido
    if (!parsed.retorno) {
      throw new Error('XML de retorno inválido: tag <retorno> não encontrada');
    }

    const retorno = parsed.retorno;

    // Extrair mensagem e código
    let codigo = '';
    let mensagem = '';

    if (retorno.mensagem) {
      const msgCodigo = extrairValor(retorno.mensagem.codigo || retorno.mensagem);
      codigo = msgCodigo;
      mensagem = msgCodigo;
    }

    // Determinar sucesso baseado no código
    // [1] = Sucesso
    // [0], [2], etc. = Erro
    const sucesso = codigo.startsWith('[1]');

    // Construir resposta
    const response: NFSeResponse = {
      sucesso,
      mensagem,
      codigo
    };

    // Se sucesso, extrair dados da NFSe
    if (sucesso) {
      if (retorno.numero_nfse) {
        response.numeroNfse = extrairValor(retorno.numero_nfse);
      }

      if (retorno.serie_nfse) {
        response.serieNfse = extrairValor(retorno.serie_nfse);
      }

      if (retorno.data_nfse) {
        response.dataNfse = extrairValor(retorno.data_nfse);
      }

      if (retorno.hora_nfse) {
        response.horaNfse = extrairValor(retorno.hora_nfse);
      }

      if (retorno.link_nfse) {
        response.linkNfse = extrairValor(retorno.link_nfse);
      }

      if (retorno.cod_verificador_autenticidade) {
        response.codVerificadorAutenticidade = extrairValor(retorno.cod_verificador_autenticidade);
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer parse do XML de retorno: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao fazer parse do XML de retorno');
  }
}

/**
 * Faz parse de lista de NFSe (para consultas que retornam múltiplas notas)
 */
export async function parseNFSeList(xmlResponse: string): Promise<any[]> {
  try {
    const parsed = await parseXmlAsync(xmlResponse);

    if (!parsed.retorno) {
      throw new Error('XML de retorno inválido: tag <retorno> não encontrada');
    }

    const retorno = parsed.retorno;

    // Verificar se há lista de notas
    if (retorno.lista_nfse) {
      const lista = retorno.lista_nfse;

      // Se for array, retornar como está
      if (Array.isArray(lista)) {
        return lista;
      }

      // Se for objeto único, retornar em array
      return [lista];
    }

    // Verificar se há nota única
    if (retorno.nfse || retorno.numero_nfse) {
      return [retorno];
    }

    return [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer parse da lista de NFSe: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao fazer parse da lista de NFSe');
  }
}

/**
 * Verifica se o XML contém erro de autenticação
 */
export function isAuthenticationError(xmlResponse: string): boolean {
  const lowerResponse = xmlResponse.toLowerCase();
  return (
    lowerResponse.includes('login') ||
    lowerResponse.includes('senha') ||
    lowerResponse.includes('autenticação') ||
    lowerResponse.includes('autenticacao') ||
    lowerResponse.includes('não autorizado') ||
    lowerResponse.includes('nao autorizado')
  );
}

/**
 * Extrai mensagem de erro de forma simplificada
 */
export function extractErrorMessage(xmlResponse: string): string {
  try {
    // Tentar extrair da tag <mensagem> ou <codigo>
    const mensagemMatch = xmlResponse.match(/<(?:mensagem|codigo)>(.*?)<\/(?:mensagem|codigo)>/i);
    if (mensagemMatch && mensagemMatch[1]) {
      return mensagemMatch[1].trim();
    }

    // Tentar extrair de qualquer tag que pareça conter mensagem de erro
    const erroMatch = xmlResponse.match(/<erro>(.*?)<\/erro>/i);
    if (erroMatch && erroMatch[1]) {
      return erroMatch[1].trim();
    }

    return 'Erro desconhecido no processamento da NFSe';
  } catch {
    return 'Erro ao processar resposta do webservice';
  }
}
