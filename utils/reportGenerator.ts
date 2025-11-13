import { Funcionario, ExameRealizado, DbData, Cargo, Risco, MasterExame, CargoRiscoLink, ProtocoloExame, PcmsoConfig, DocumentoEmpresa } from '../types';

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr + 'T00:00:00'); // Ensure timezone consistency
        return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch {
        // Fallback for already formatted dates or other formats
        const parts = dateStr.split('-');
        if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }
};

// --- CSV Generation ---
export const generateCsv = (data: (Funcionario & { ultimoExame?: ExameRealizado })[], title: string) => {
    const headers = [
        'Matrícula', 'Nome', 'CPF', 'Cargo', 'Setor', 'Admissão', 
        'Último Exame (Tipo)', 'Último Exame (Data)', 'Próximo Vencimento', 'Status'
    ];

    const getStatus = (vencimento: string | null | undefined): string => {
        if (!vencimento) return 'Sem Exame';
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVenc = new Date(vencimento + 'T00:00:00');
        const diffTime = dataVenc.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Atrasado';
        if (diffDays <= 30) return 'Vencendo';
        return 'Em Dia';
    };

    const rows = data.map(func => [
        func.matricula || `ID:${func.id}`,
        `"${func.nome}"`,
        func.cpf || '',
        `"${func.cargo}"`,
        `"${func.setor || ''}"`,
        formatDate(func.data_admissao),
        func.ultimoExame?.tipo_exame || 'N/A',
        formatDate(func.ultimoExame?.data_realizacao),
        formatDate(func.ultimoExame?.data_vencimento),
        getStatus(func.ultimoExame?.data_vencimento)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_exames.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Printable HTML Generation ---
export const generatePrintableHtml = (data: (Funcionario & { ultimoExame?: ExameRealizado })[], title: string, filterSummary: string) => {
    const today = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

    const getStatus = (vencimento: string | null | undefined): { text: string, className: string } => {
        if (!vencimento) return { text: 'Sem Exame', className: 'bg-gray-100 text-gray-800' };
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVenc = new Date(vencimento + 'T00:00:00');
        const diffTime = dataVenc.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Atrasado', className: 'bg-red-100 text-red-800 font-semibold' };
        if (diffDays <= 30) return { text: 'Vencendo', className: 'bg-yellow-100 text-yellow-800 font-semibold' };
        return { text: 'Em Dia', className: 'bg-green-100 text-green-800' };
    };

    const stats = data.reduce((acc, func) => {
        const status = getStatus(func.ultimoExame?.data_vencimento).text;
        if (status === 'Atrasado') acc.atrasados++;
        else if (status === 'Vencendo') acc.vencendo++;
        else if (status === 'Em Dia') acc.emDia++;
        return acc;
    }, { atrasados: 0, vencendo: 0, emDia: 0 });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                 body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
            </style>
        </head>
        <body class="bg-gray-100 p-8">
            <div class="max-w-6xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                <div class="no-print mb-8 text-right">
                    <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Imprimir / Salvar PDF</button>
                </div>
                <header class="mb-8 border-b pb-4">
                    <h1 class="text-3xl font-bold text-gray-800">${title}</h1>
                    <p class="text-sm text-gray-500 mt-2">Gerado em: ${today}</p>
                    <p class="text-xs text-gray-500 mt-1">Filtros aplicados: ${filterSummary}</p>
                </header>

                <main>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Funcionário</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Cargo</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Último Exame</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Vencimento</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.map(func => {
                                const status = getStatus(func.ultimoExame?.data_vencimento);
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <div class="font-medium text-gray-900">${func.nome}</div>
                                            <div class="text-gray-500">Mat: ${func.matricula || 'N/A'}</div>
                                        </td>
                                        <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${func.cargo}</td>
                                        <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${func.ultimoExame ? `${func.ultimoExame.tipo_exame} em ${formatDate(func.ultimoExame.data_realizacao)}` : 'N/A'}</td>
                                        <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">${formatDate(func.ultimoExame?.data_vencimento)}</td>
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}">
                                                ${status.text}
                                            </span>
                                        </td>
                                    </tr>
                                `}).join('')}
                        </tbody>
                    </table>
                </main>
                
                <footer class="mt-8 pt-4 border-t">
                    <h3 class="text-lg font-semibold text-gray-700">Resumo do Relatório</h3>
                    <div class="mt-2 grid grid-cols-4 gap-4 text-center">
                        <div class="bg-gray-100 p-3 rounded-lg">
                            <div class="text-2xl font-bold">${data.length}</div>
                            <div class="text-sm text-gray-600">Total</div>
                        </div>
                         <div class="bg-red-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-red-700">${stats.atrasados}</div>
                            <div class="text-sm text-red-600">Atrasados</div>
                        </div>
                         <div class="bg-yellow-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-yellow-700">${stats.vencendo}</div>
                            <div class="text-sm text-yellow-600">Vencendo</div>
                        </div>
                         <div class="bg-green-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-green-700">${stats.emDia}</div>
                            <div class="text-sm text-green-600">Em Dia</div>
                        </div>
                    </div>
                </footer>
            </div>
        </body>
        </html>
    `;
    const newWindow = window.open();
    newWindow?.document.write(htmlContent);
    newWindow?.document.close();
};


// --- PCMSO HTML Generation ---
export const generatePcmsoHtml = (data: {
    cargos: Cargo[];
    riscos: Risco[];
    masterExames: MasterExame[];
    cargoRiscoLinks: CargoRiscoLink[];
    protocolosExames: ProtocoloExame[];
    pcmsoConfig: PcmsoConfig | null;
}) => {
    const { cargos, riscos, masterExames, cargoRiscoLinks, protocolosExames, pcmsoConfig } = data;

    const getRiscosForCargo = (cargoId: number) => {
        return cargoRiscoLinks
            .filter(link => link.cargo_id === cargoId)
            .map(link => riscos.find(r => r.id === link.risco_id))
            .filter(Boolean) as Risco[];
    };
    
    const getProtocoloForCargo = (cargoId: number) => {
        return protocolosExames
            .filter(link => link.cargo_id === cargoId)
            .map(link => ({
                ...link,
                exame: masterExames.find(e => e.id === link.exame_id)
            }))
            .filter(p => p.exame);
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>PCMSO - ${pcmsoConfig?.empresa_nome || 'Empresa'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                    @page {
                        size: A4;
                        margin: 1in;
                    }
                }
                body { font-family: ui-sans-serif, system-ui, sans-serif; }
                h2 {
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 8px;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                    font-weight: bold;
                    page-break-after: avoid;
                }
                h3 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #2d3748;
                    page-break-after: avoid;
                }
                 .page-break-inside-avoid {
                    page-break-inside: avoid;
                }
            </style>
        </head>
        <body class="bg-gray-100 p-8">
            <div class="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                 <div class="no-print mb-8 text-right">
                    <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Imprimir / Salvar PDF</button>
                 </div>

                 <!-- CAPA -->
                <div class="text-center h-screen flex flex-col justify-center items-center">
                    <h1 class="text-5xl font-bold text-gray-800 tracking-wider">PCMSO</h1>
                    <p class="text-2xl text-gray-600 mt-2">Programa de Controle Médico de Saúde Ocupacional</p>
                    <div class="mt-24 text-lg">
                        <p class="font-bold text-2xl">${pcmsoConfig?.empresa_nome || 'Nome da Empresa'}</p>
                        <p class="text-gray-700">${pcmsoConfig?.cnpj || 'CNPJ da Empresa'}</p>
                    </div>
                     <div class="absolute bottom-12 text-center text-gray-500 text-sm">
                        <p>Médico Responsável: ${pcmsoConfig?.medico_nome || 'Não definido'} (CRM: ${pcmsoConfig?.medico_crm || 'N/A'})</p>
                        <p>Vigência: ${formatDate(pcmsoConfig?.inicio_validade)} a ${formatDate(pcmsoConfig?.revisar_ate)}</p>
                    </div>
                </div>

                <!-- CONTEÚDO -->
                <div class="page-break"></div>
                <h2>Detalhamento por Cargo</h2>

                ${cargos.map(cargo => `
                    <div class="mb-12 page-break-inside-avoid">
                        <h3>${cargo.nome_padronizado} (CBO: ${cargo.cbo_codigo || 'N/I'})</h3>
                        
                        <div class="mt-4">
                            <h4 class="font-semibold text-gray-700">Descrição das Atividades:</h4>
                            <p class="text-sm text-gray-600 italic mt-1">${cargo.descricao_atividades || 'Nenhuma descrição fornecida.'}</p>
                        </div>

                        <div class="mt-4">
                            <h4 class="font-semibold text-gray-700">Riscos Ocupacionais:</h4>
                            ${getRiscosForCargo(cargo.id).length > 0 ? `
                                <ul class="list-disc pl-5 text-sm mt-2 space-y-1">
                                    ${getRiscosForCargo(cargo.id).map(risco => `<li><span class="font-semibold">${risco.tipo}:</span> ${risco.nome}</li>`).join('')}
                                </ul>
                            ` : '<p class="text-sm text-gray-500 mt-1">Nenhum risco vinculado.</p>'}
                        </div>

                        <div class="mt-4">
                            <h4 class="font-semibold text-gray-700">Protocolo de Exames:</h4>
                            ${getProtocoloForCargo(cargo.id).length > 0 ? `
                            <table class="min-w-full mt-2 text-sm border">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-2 py-2 border text-left font-semibold">Exame</th>
                                        <th class="px-2 py-2 border font-semibold" title="Admissional">Adm</th>
                                        <th class="px-2 py-2 border font-semibold" title="Periódico">Per</th>
                                        <th class="px-2 py-2 border font-semibold" title="Demissional">Dem</th>
                                        <th class="px-2 py-2 border font-semibold" title="Retorno ao Trabalho">Ret</th>
                                        <th class="px-2 py-2 border font-semibold" title="Mudança de Risco">MR</th>
                                        <th class="px-2 py-2 border text-left font-semibold">Periodicidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${getProtocoloForCargo(cargo.id).map(p => `
                                    <tr class="border-t">
                                        <td class="px-2 py-1.5 border">${p.exame!.nome_exame}</td>
                                        <td class="px-2 py-1.5 border text-center">${p.fazer_admissional ? '✔️' : '—'}</td>
                                        <td class="px-2 py-1.5 border text-center">${p.fazer_periodico ? '✔️' : '—'}</td>
                                        <td class="px-2 py-1.5 border text-center">${p.fazer_demissional ? '✔️' : '—'}</td>
                                        <td class="px-2 py-1.5 border text-center">${p.retorno_trabalho ? '✔️' : '—'}</td>
                                        <td class="px-2 py-1.5 border text-center">${p.mudanca_risco ? '✔️' : '—'}</td>
                                        <td class="px-2 py-1.5 border">${p.periodicidade_detalhe || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                                </tbody>
                            </table>
                            ` : '<p class="text-sm text-gray-500 mt-1">Nenhum exame no protocolo.</p>'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;

    const newWindow = window.open();
    newWindow?.document.write(htmlContent);
    newWindow?.document.close();
};


// --- Document Report Generation (NEW) ---
type DocumentoComEmpresa = DocumentoEmpresa & { empresaNome: string };

export const generateDocumentosCsv = (data: DocumentoComEmpresa[], title: string) => {
    const headers = ['Empresa', 'Nome do Documento', 'Tipo', 'Data de Upload', 'Data de Início', 'Data de Vencimento', 'Status'];

    const rows = data.map(doc => [
        `"${doc.empresaNome}"`,
        `"${doc.nome}"`,
        doc.tipo,
        formatDate(doc.dataUpload),
        formatDate(doc.dataInicio),
        formatDate(doc.dataFim),
        doc.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_documentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const generateDocumentosPrintableHtml = (data: DocumentoComEmpresa[], title: string, filterSummary: string) => {
    const today = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const statusStyles: { [key in DocumentoEmpresa['status']]: string } = {
        ATIVO: 'bg-green-100 text-green-800',
        VENCENDO: 'bg-yellow-100 text-yellow-800',
        VENCIDO: 'bg-red-100 text-red-800',
        ENCERRADO: 'bg-gray-200 text-gray-800',
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                 body { font-family: ui-sans-serif, system-ui, sans-serif; }
            </style>
        </head>
        <body class="bg-gray-100 p-8">
            <div class="max-w-6xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                <div class="no-print mb-8 text-right">
                    <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Imprimir / Salvar PDF</button>
                </div>
                <header class="mb-8 border-b pb-4">
                    <h1 class="text-3xl font-bold text-gray-800">${title}</h1>
                    <p class="text-sm text-gray-500 mt-2">Gerado em: ${today}</p>
                    <p class="text-xs text-gray-500 mt-1">Filtros aplicados: ${filterSummary}</p>
                </header>
                <main>
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Empresa</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Vencimento</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.map(doc => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-800">${doc.empresaNome}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-gray-900">${doc.nome}</td>
                                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${doc.tipo}</td>
                                    <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">${formatDate(doc.dataFim)}</td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[doc.status]}">
                                            ${doc.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </main>
            </div>
        </body>
        </html>
    `;
    const newWindow = window.open();
    newWindow?.document.write(htmlContent);
    newWindow?.document.close();
};