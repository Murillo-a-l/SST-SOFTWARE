/**
 * Cliente HTTP para webservice IPM (AtendeNet)
 * Baseado no manual_eletron.pdf
 */

import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import {
  NFSeData,
  NFSeConsultaParams,
  NFSeCancelamentoParams,
  NFSeResponse,
  IPMWebserviceConfig
} from './types';
import {
  generateNFSeXML,
  generateConsultaNFSeXML,
  generateCancelamentoNFSeXML
} from './ipmXmlGenerator';
import {
  parseNFSeResponse,
  parseNFSeList,
  isAuthenticationError,
  extractErrorMessage
} from './ipmXmlParser';

/**
 * Cliente para comunicação com webservice IPM
 */
export class IPMWebserviceClient {
  private config: IPMWebserviceConfig;

  constructor(config: IPMWebserviceConfig) {
    this.config = {
      retornoXml: true, // Por padrão, sempre pedir retorno XML
      ...config
    };
  }

  /**
   * Monta URL com parâmetro ?eletron=1 se retornoXml=true
   */
  private getUrl(): string {
    const baseUrl = this.config.urlWebservice;
    if (this.config.retornoXml) {
      return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}eletron=1`;
    }
    return baseUrl;
  }

  /**
   * Cria FormData com autenticação e XML
   */
  private createFormData(xmlContent: string): FormData {
    const form = new FormData();

    // Adicionar autenticação
    form.append('login', this.config.login);
    form.append('senha', this.config.senha);
    form.append('cidade', this.config.cidade);

    // Adicionar arquivo XML
    // O IPM espera o parâmetro 'f1' com o conteúdo do arquivo
    form.append('f1', Buffer.from(xmlContent, 'utf-8'), {
      filename: 'nfse.xml',
      contentType: 'text/xml; charset=ISO-8859-1'
    });

    return form;
  }

  /**
   * Envia requisição para o webservice
   */
  private async enviarRequisicao(xmlContent: string): Promise<string> {
    const form = this.createFormData(xmlContent);
    const url = this.getUrl();

    try {
      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 60000, // 60 segundos
        maxRedirects: 5,
        validateStatus: () => true // Aceitar qualquer status HTTP
      });

      // Verificar se retornou XML
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('xml') && !contentType.includes('text')) {
        throw new Error(
          `Resposta inesperada do webservice. Content-Type: ${contentType}`
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout na comunicação com o webservice IPM');
        }

        if (error.response) {
          throw new Error(
            `Erro HTTP ${error.response.status}: ${error.response.statusText}`
          );
        }

        if (error.request) {
          throw new Error('Sem resposta do webservice IPM. Verifique a conexão.');
        }

        throw new Error(`Erro na requisição: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Emite uma NFSe
   */
  async emitirNFSe(data: NFSeData): Promise<NFSeResponse> {
    // Gerar XML
    const xml = generateNFSeXML(data);

    // Enviar para webservice
    const xmlResponse = await this.enviarRequisicao(xml);

    // Verificar erro de autenticação
    if (isAuthenticationError(xmlResponse)) {
      throw new Error('Erro de autenticação. Verifique login, senha e código da cidade.');
    }

    // Parse da resposta
    const response = await parseNFSeResponse(xmlResponse);

    // Se não teve sucesso, lançar erro
    if (!response.sucesso) {
      throw new Error(response.mensagem || extractErrorMessage(xmlResponse));
    }

    return response;
  }

  /**
   * Consulta NFSe por número
   */
  async consultarNFSePorNumero(numeroNfse: string): Promise<any> {
    const params: NFSeConsultaParams = {
      prestador: {
        cpfcnpj: this.config.login,
        cidade: this.config.cidade
      },
      numeroNfse
    };

    // Gerar XML de consulta
    const xml = generateConsultaNFSeXML(params);

    // Enviar para webservice
    const xmlResponse = await this.enviarRequisicao(xml);

    // Parse da lista
    const lista = await parseNFSeList(xmlResponse);

    if (lista.length === 0) {
      throw new Error(`NFSe ${numeroNfse} não encontrada`);
    }

    return lista[0];
  }

  /**
   * Consulta NFSe por período
   */
  async consultarNFSePorPeriodo(
    dataInicial: string,
    dataFinal: string
  ): Promise<any[]> {
    const params: NFSeConsultaParams = {
      prestador: {
        cpfcnpj: this.config.login,
        cidade: this.config.cidade
      },
      dataInicial,
      dataFinal
    };

    // Gerar XML de consulta
    const xml = generateConsultaNFSeXML(params);

    // Enviar para webservice
    const xmlResponse = await this.enviarRequisicao(xml);

    // Parse da lista
    return await parseNFSeList(xmlResponse);
  }

  /**
   * Cancela uma NFSe
   */
  async cancelarNFSe(
    numeroNfse: string,
    motivoCancelamento: string
  ): Promise<NFSeResponse> {
    const params: NFSeCancelamentoParams = {
      prestador: {
        cpfcnpj: this.config.login,
        cidade: this.config.cidade
      },
      numeroNfse,
      motivoCancelamento
    };

    // Gerar XML de cancelamento
    const xml = generateCancelamentoNFSeXML(params);

    // Enviar para webservice
    const xmlResponse = await this.enviarRequisicao(xml);

    // Verificar erro de autenticação
    if (isAuthenticationError(xmlResponse)) {
      throw new Error('Erro de autenticação. Verifique login, senha e código da cidade.');
    }

    // Parse da resposta
    const response = await parseNFSeResponse(xmlResponse);

    // Se não teve sucesso, lançar erro
    if (!response.sucesso) {
      throw new Error(response.mensagem || extractErrorMessage(xmlResponse));
    }

    return response;
  }
}

/**
 * Factory function para criar cliente configurado para Barra Velha/SC
 */
export function createBarraVelhaClient(login: string, senha: string): IPMWebserviceClient {
  return new IPMWebserviceClient({
    login,
    senha,
    cidade: '8055', // Código TOM de Barra Velha/SC
    urlWebservice: 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php',
    retornoXml: true
  });
}
