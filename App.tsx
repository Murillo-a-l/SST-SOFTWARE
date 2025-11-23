// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as dbService from './services/dbService';
import api from './services/apiService';
import type { DbData, Funcionario, ManagementModalType, DuplicateGroup, View, Empresa, Pasta, DocumentoEmpresa, ServicoPrestado, Cobranca, NFe, User, Notification } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmpresasTab } from './components/EmpresasTab';
import { FuncionariosTab } from './components/FuncionariosTab';
import { DesativadosTab } from './components/DesativadosTab';
import { ValidacaoTab } from './components/ValidacaoTab';
import { PcmsoTab } from './components/PcmsoTab';
import { RelatoriosTab } from './components/RelatoriosTab';
import { ConfiguracoesGeraisTab } from './components/ConfiguracoesGeraisTab';
import { FinanceiroGeralTab } from './components/financeiro/FinanceiroGeralTab';
import { ImportarPlanilhaModal } from './components/modals/ImportarPlanilhaModal';
import { CadastroManualModal } from './components/modals/CadastroManualModal';
import { RegistrarExameModal } from './components/modals/RegistrarExameModal';
import { EditFuncionarioModal } from './components/modals/EditFuncionarioModal';
import { FuncionarioDetailsModal } from './components/modals/FuncionarioDetailsModal';
import { GerarRelatorioModal } from './components/modals/GerarRelatorioModal';
import { GerarRelatorioDocumentosModal } from './components/modals/GerarRelatorioDocumentosModal';
import { ConfiguracoesModal } from './components/modals/ConfiguracoesModal';
import { CargoManagerModal } from './components/modals/CargoManagerModal';
import { AmbienteManagerModal } from './components/modals/AmbienteManagerModal';
import { RiscoManagerModal } from './components/modals/RiscoManagerModal';
import { ExameManagerModal } from './components/modals/ExameManagerModal';
import { PeriodicidadeManagerModal } from './components/modals/PeriodicidadeManagerModal';
import { BackupModal } from './components/modals/BackupModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { ResolveDuplicateModal } from './components/modals/ResolveDuplicateModal';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { EmpresaManagerModal } from './components/modals/EmpresaManagerModal';
import { DocumentoManagerModal } from './components/modals/DocumentoManagerModal';
import { PastaManagerModal } from './components/modals/PastaManagerModal';
import { DocumentoTipoManagerModal } from './components/modals/DocumentoTipoManagerModal';
import { CatalogoServicoManagerModal } from './components/modals/CatalogoServicoManagerModal';
import { ServicoPrestadoManagerModal } from './components/modals/ServicoPrestadoManagerModal';
import { CobrancaManagerModal } from './components/modals/CobrancaManagerModal';
import { NFeManagerModal } from './components/modals/NFeManagerModal';
import { LoginPage } from './components/auth/LoginPage';
import { UserManagerModal } from './components/modals/UserManagerModal';
import { AssinaturaDocumentoModal } from './components/modals/AssinaturaDocumentoModal';
import { ConfiguracaoNFSeModal } from './components/modals/ConfiguracaoNFSeModal';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { summarizeText, suggestExams } from "./services/geminiService";


type FuncionarioSubTab = 'ativos' | 'desativados' | 'validacao';

const App: React.FC = () => {
    const [data, setData] = useState<DbData>(dbService.getInitialDb());
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [activeFuncionarioTab, setActiveFuncionarioTab] = useState<FuncionarioSubTab>('ativos');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);

    // Auth state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Loading state
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Gemini Test states
    const [aiInput, setAiInput] = useState("");
    const [aiOutput, setAiOutput] = useState("");

    // Modal states
    const [modals, setModals] = useState({
        importar: false,
        cadastroManual: false,
        registrarExame: false,
        gerarRelatorio: false,
        gerarRelatorioDocumentos: false,
        configuracoes: false,
        backup: false,
        notifications: false,
        resolveDuplicate: false,
        empresaManager: false,
        documentoManager: false,
        pastaManager: false,
        servicoPrestadoManager: false,
        cobrancaManager: false,
        nfeManager: false,
        management: null as ManagementModalType | null,
    });
    const [showConfigNFSeModal, setShowConfigNFSeModal] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
        confirmText?: string;
        confirmButtonClass?: string;
        confirmButtonText?: string;
    } | null>(null);

    const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
    const [detailsFuncionario, setDetailsFuncionario] = useState<Funcionario | null>(null);
    const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
    const [editingDocumento, setEditingDocumento] = useState<DocumentoEmpresa | null>(null);
    const [documentoParaAssinar, setDocumentoParaAssinar] = useState<DocumentoEmpresa | null>(null);
    const [editingServicoPrestado, setEditingServicoPrestado] = useState<ServicoPrestado | null>(null);
    const [editingCobranca, setEditingCobranca] = useState<Cobranca | null>(null);
    const [editingNFe, setEditingNFe] = useState<NFe | null>(null);
    
    // Initial name states for quick-add modals
    const [catalogoInitialName, setCatalogoInitialName] = useState<string | null>(null);
    const [empresaInitialName, setEmpresaInitialName] = useState<string | null>(null);
    const [funcionarioInitialName, setFuncionarioInitialName] = useState<string | null>(null);
    
    const [documentModalContext, setDocumentModalContext] = useState<{ empresa: Empresa; pastaId: number | null } | null>(null);
    const [pastaModalContext, setPastaModalContext] = useState<{ empresaId: number; parentId: number | null; pasta?: Pasta; } | null>(null);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [groupToResolve, setGroupToResolve] = useState<DuplicateGroup | null>(null);

    const reloadData = useCallback(async () => {
        // Não carregar dados se não houver usuário autenticado
        if (!api.auth.getCurrentUser()) {
            setData(dbService.loadDb());
            setIsLoadingData(false);
            return;
        }

        setIsLoadingData(true);
        try {
            // Carregar dados do localStorage (temporário para outras entidades)
            const localData = dbService.loadDb();

            // Carregar 10 entidades da API em paralelo
            const [
                empresas,
                funcionarios,
                exames,
                documentos,
                pastas,
                documentoTipos,
                catalogoServicos,
                servicosPrestados,
                cobrancas,
                nfes
            ] = await Promise.all([
                api.empresas.getAll(),
                api.funcionarios.getAll(),
                api.exames.getAll(),
                api.documentos.getAll(),
                api.pastas.getAll(),
                api.documentoTipos.getAll(),
                api.catalogoServicos.getAll(),
                api.servicosPrestados.getAll(),
                api.cobrancas.getAll(),
                api.nfes.getAll(),
            ]);

            const normalizedExames = (Array.isArray(exames) ? exames : exames?.exames || []).map((e: any) => ({
                ...e,
                funcionario_id: e.funcionario_id ?? e.funcionarioId ?? e.funcionario?.id ?? null,
                data_realizacao: e.data_realizacao ?? e.dataRealizacao ?? null,
                data_vencimento: e.data_vencimento ?? e.dataVencimento ?? null,
                tipo_exame: e.tipo_exame ?? e.tipoExame ?? e.tipo ?? '',
            }));

            // Mesclar dados da API com dados locais
            setData({
                ...localData,
                empresas: empresas,
                funcionarios: funcionarios as any,
                examesRealizados: normalizedExames as any,
                documentosEmpresa: documentos,
                pastas: pastas,
                documentoTipos: documentoTipos,
                catalogoServicos: catalogoServicos,
                servicosPrestados: servicosPrestados,
                cobrancas: cobrancas,
                nfes: nfes,
            });
        } catch (error) {
            console.error('Erro ao carregar dados da API:', error);
            // Em caso de erro, carrega do localStorage como fallback
            setData(dbService.loadDb());
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialLoad) {
            dbService.initializeDb(); // This now includes migration
            dbService.limparExamesOrfaos();
            dbService.updateAllDocumentStatuses(); // "Cron job" for document status

            const user = api.auth.getCurrentUser();
            setCurrentUser(user);
            setAuthChecked(true);

            reloadData();
            setIsInitialLoad(false);
        }

        // Generate notifications from data
        const newNotifications: Notification[] = [];
        // 1. Duplicate employees
        const duplicates = dbService.detectarDuplicados(data.funcionarios);
        duplicates.forEach(group => {
            newNotifications.push({
                id: `duplicate-${group.key}`,
                message: `Possível duplicidade de funcionários encontrada para: ${group.identifier}`,
                type: 'warning',
                date: new Date().toISOString(),
                isRead: false,
                relatedId: group.funcionarios[0].id, // Just to have an ID
                notificationType: 'DUPLICATE_EMPLOYEE',
            });
        });
        
        // 2. Pending signatures for current user
        if (currentUser) {
            const pendingSignatures = (data.documentosEmpresa || []).filter(doc =>
                doc.requerAssinaturaDeId === currentUser.id &&
                doc.statusAssinatura === 'PENDENTE'
            );
            pendingSignatures.forEach(doc => {
                const requester = data.users.find(u => u.id === doc.solicitadoPorId);
                newNotifications.push({
                    id: `signature-${doc.id}`,
                    message: `Assinatura pendente para o documento "${doc.nome}", solicitado por ${requester?.nome || 'desconhecido'}.`,
                    type: 'task',
                    date: doc.dataSolicitacaoAssinatura || new Date().toISOString(),
                    isRead: false,
                    relatedId: doc.id,
                    notificationType: 'SIGNATURE_REQUEST',
                });
            });
        }

        setNotifications(newNotifications);


    }, [data, isInitialLoad, reloadData, currentUser]);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        reloadData(); // Reload data to get user-specific notifications
    };

    const handleLogout = async () => {
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Continua com logout local mesmo se falhar no servidor
        } finally {
            setCurrentUser(null);
        }
    };

    const getCompanyIdsForFilter = useCallback(() => {
        if (selectedEmpresaId === null) {
            return data.empresas.map(e => e.id); // All companies if null
        }
        const filiaisIds = data.empresas.filter(e => e.matrizId === selectedEmpresaId).map(e => e.id);
        return [selectedEmpresaId, ...filiaisIds];
    }, [data.empresas, selectedEmpresaId]);
    
    const filteredFuncionarios = useMemo(() => {
        const companyIdsToInclude = getCompanyIdsForFilter();
        return data.funcionarios.filter(f => companyIdsToInclude.includes(f.empresaId));
    }, [data.funcionarios, getCompanyIdsForFilter]);

    const filteredDocumentos = useMemo(() => {
        const companyIdsToInclude = getCompanyIdsForFilter();
        return (data.documentosEmpresa || []).filter(d => companyIdsToInclude.includes(d.empresaId));
    }, [data.documentosEmpresa, getCompanyIdsForFilter]);

    const filteredServicosPrestados = useMemo(() => {
        const companyIdsToInclude = getCompanyIdsForFilter();
        return (data.servicosPrestados || []).filter(s => companyIdsToInclude.includes(s.empresaId));
    }, [data.servicosPrestados, getCompanyIdsForFilter]);

    const filteredCobrancas = useMemo(() => {
        const companyIdsToInclude = getCompanyIdsForFilter();
        return (data.cobrancas || []).filter(c => companyIdsToInclude.includes(c.empresaId));
    }, [data.cobrancas, getCompanyIdsForFilter]);

    const stats = useMemo(() => {
        const activeFuncionarios = filteredFuncionarios.filter(f => f.ativo);

        // Calcular assinaturas pendentes dos documentos da API
        const assinaturasPendentes = currentUser
            ? filteredDocumentos.filter(doc =>
                doc.requerAssinaturaDeId === currentUser.id &&
                doc.statusAssinatura === 'PENDENTE'
              ).length
            : 0;

        const statsData = {
            totalFuncionarios: activeFuncionarios.length,
            examesAtrasados: 0,
            vencendo30Dias: 0,
            emDia: 0,
            totalContratos: 0,
            contratosAtivos: 0,
            contratosVencendo: 0,
            contratosVencidos: 0,
            assinaturasPendentes,
        };
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        activeFuncionarios.forEach(func => {
            const ultimoExame = (data.examesRealizados || [])
                .filter(e => e.funcionario_id === func.id)
                .sort((a, b) => new Date(b.data_realizacao).getTime() - new Date(a.data_realizacao).getTime())[0];

            if (ultimoExame?.data_vencimento) {
                const dataVenc = new Date(ultimoExame.data_vencimento + 'T00:00:00');
                const diffTime = dataVenc.getTime() - hoje.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0) statsData.examesAtrasados++;
                else if (diffDays <= 30) statsData.vencendo30Dias++;
                else statsData.emDia++;
            }
        });

        filteredDocumentos.forEach(doc => {
            if(doc.tipo === 'Contrato' && doc.status !== 'ENCERRADO') {
                statsData.totalContratos++;
                if(doc.status === 'VENCENDO') {
                    statsData.contratosVencendo++;
                } else if(doc.status === 'VENCIDO') {
                    statsData.contratosVencidos++;
                } else if(doc.status === 'ATIVO') {
                    statsData.contratosAtivos++;
                }
            }
        });

        return statsData;
    }, [filteredFuncionarios, data.examesRealizados, filteredDocumentos, currentUser]);

    const handleOpenModal = (modalName: keyof Omit<typeof modals, 'management'>, value: boolean = true) => {
        setModals(prev => ({ ...prev, [modalName]: value }));
    };

    const handleOpenManagementModal = (modal: ManagementModalType) => {
        setModals(prev => ({ ...prev, management: modal }));
    };

    const handleCloseManagementModal = () => {
        setModals(prev => ({ ...prev, management: null }));
        setCatalogoInitialName(null);
        reloadData(); // reload data in case something was changed in the management modal
    };
    
    const handleOpenCatalogoManager = (initialName?: string) => {
        setCatalogoInitialName(initialName || null);
        handleOpenManagementModal('catalogoServicos');
    };

    const handleOpenEmpresaManager = (initialName?: string) => {
        setEmpresaInitialName(initialName || null);
        setEditingEmpresa(null); // Ensure it's a new one, not editing
        handleOpenModal('empresaManager');
    };
    
    const handleOpenCadastroManual = useCallback((initialName?: string) => {
        setFuncionarioInitialName(initialName || null);
        handleOpenModal('cadastroManual');
    }, []);

    const handleOpenConfigNFSe = () => setShowConfigNFSeModal(true);

    const handleCloseAllModals = () => {
        setModals({
            importar: false,
            cadastroManual: false,
            registrarExame: false,
            gerarRelatorio: false,
            gerarRelatorioDocumentos: false,
            configuracoes: false,
            backup: false,
            notifications: false,
            resolveDuplicate: false,
            empresaManager: false,
            documentoManager: false,
            pastaManager: false,
            servicoPrestadoManager: false,
            cobrancaManager: false,
            nfeManager: false,
            management: null,
        });
        setEditingFuncionario(null);
        setDetailsFuncionario(null);
        setEditingEmpresa(null);
        setEditingDocumento(null);
        setDocumentoParaAssinar(null);
        setEditingServicoPrestado(null);
        setEditingCobranca(null);
        setEditingNFe(null);
        setDocumentModalContext(null);
        setPastaModalContext(null);
        setGroupToResolve(null);
        setConfirmation(null);
        setEmpresaInitialName(null);
        setFuncionarioInitialName(null);
    };

    const handleOpenResolveNotification = (notification: Notification) => {
        handleOpenModal('notifications', false); // Close notification center
        if (notification.notificationType === 'DUPLICATE_EMPLOYEE') {
            const duplicates = dbService.detectarDuplicados(data.funcionarios);
            const group = duplicates.find(g => g.funcionarios.some(f => f.id === notification.relatedId));
            if (group) {
                setGroupToResolve(group);
                handleOpenModal('resolveDuplicate');
            }
        } else if (notification.notificationType === 'SIGNATURE_REQUEST') {
            const doc = data.documentosEmpresa.find(d => d.id === notification.relatedId);
            if (doc) {
                setDocumentoParaAssinar(doc);
            }
        }
    };

    const handleMergeDuplicates = (primaryId: number, secondaryIds: number[]) => {
        dbService.mesclarFuncionarios(primaryId, secondaryIds);
        reloadData();
        handleCloseAllModals();
        toast.success("Funcionários mesclados com sucesso!");
    };

    const handleEditEmpresa = (empresa: Empresa) => {
        setEditingEmpresa(empresa);
        handleOpenModal('empresaManager');
    };

    const handleDeleteEmpresa = async (empresa: Empresa) => {
        setConfirmation({
            title: "Excluir Empresa",
            message: (
                <div>
                    <p className="mb-2">Tem certeza que deseja excluir a empresa <strong>{empresa.nomeFantasia}</strong>?</p>
                    <p className="text-sm text-red-600">Esta ação NÃO pode ser desfeita. Todos os funcionários, documentos e dados relacionados serão removidos.</p>
                </div>
            ),
            confirmText: empresa.nomeFantasia,
            confirmButtonClass: "bg-red-600 hover:bg-red-700",
            confirmButtonText: "Excluir Empresa",
            onConfirm: async () => {
                try {
                    await api.empresas.delete(empresa.id);
                    toast.success(`Empresa "${empresa.nomeFantasia}" excluída com sucesso!`);
                    await reloadData();
                } catch (error) {
                    console.error("Erro ao excluir empresa:", error);
                    toast.error("Erro ao excluir empresa. Verifique sua conexão e tente novamente.");
                }
            }
        });
    };

    const handleOpenDocumentManager = (empresa: Empresa, pastaId: number | null, documento?: DocumentoEmpresa) => {
        setDocumentModalContext({ empresa, pastaId });
        setEditingDocumento(documento || null);
        handleOpenModal('documentoManager');
    };
    
    const handleOpenPastaManager = (empresaId: number, parentId: number | null, pasta?: Pasta) => {
        setPastaModalContext({ empresaId, parentId, pasta });
        handleOpenModal('pastaManager');
    }

    const handleEditServicoPrestado = (servico: ServicoPrestado) => {
        setEditingServicoPrestado(servico);
        handleOpenModal('servicoPrestadoManager');
    }

    const handleEditCobranca = (cobranca: Cobranca) => {
        setEditingCobranca(cobranca);
        handleOpenModal('cobrancaManager');
    }

    const handleEditFuncionario = (func: Funcionario) => setEditingFuncionario(func);
    const handleDetailsFuncionario = (func: Funcionario) => setDetailsFuncionario(func);

    const handleDeactivate = (id: number) => {
        const func = data.funcionarios.find(f => f.id === id);
        if (!func) return;

        setConfirmation({
            title: "Confirmar Desativação",
            message: <p>Tem certeza que deseja desativar o funcionário <span className="font-bold">"{func.nome}"</span>? Ele será movido para a lista de desativados.</p>,
            confirmButtonText: "Sim, Desativar",
            confirmButtonClass: "bg-orange-600 hover:bg-orange-700",
            onConfirm: () => {
                api.funcionarios.update(id, { ativo: false })
                    .then(() => {
                        toast.success("Funcionário desativado com sucesso.");
                        reloadData();
                    })
                    .catch(() => toast.error("Erro ao desativar o funcionário."))
                    .finally(() => setConfirmation(null));
            }
        });
    };
    
    const handleDelete = (id: number, nome: string) => {
        setConfirmation({
            title: "Confirmar Exclusão Permanente",
            message: <p>Atenção! Esta ação é irreversível e excluirá permanentemente o funcionário <span className="font-bold">"{nome}"</span> e todo o seu histórico.</p>,
            confirmText: "EXCLUIR",
            confirmButtonText: "Excluir Permanentemente",
            confirmButtonClass: "bg-red-600 hover:bg-red-700",
            onConfirm: () => {
                api.funcionarios.delete(id)
                    .then(() => {
                        toast.success(`Funcionário "${nome}" excluído com sucesso.`);
                        reloadData();
                    })
                    .catch(() => toast.error("Erro ao excluir o funcionário."))
                    .finally(() => setConfirmation(null));
            }
        });
    };

    const handleReactivate = (id: number, nome: string) => {
        setConfirmation({
            title: "Confirmar Reativação",
            message: <p>Tem certeza que deseja reativar o funcionário <span className="font-bold">"{nome}"</span>? Ele será movido para a lista de ativos.</p>,
            confirmButtonText: "Sim, Reativar",
            confirmButtonClass: "bg-green-600 hover:bg-green-700",
            onConfirm: () => {
                api.funcionarios.update(id, { ativo: true })
                    .then(() => {
                        toast.success("Funcionário reativado com sucesso.");
                        reloadData();
                    })
                    .catch(() => toast.error("Erro ao reativar o funcionário."))
                    .finally(() => setConfirmation(null));
            }
        });
    };

    // Gemini Test Functions
    async function handleSummarize() {
        setAiOutput("Gerando resumo...");
        const r = await summarizeText(aiInput);
        setAiOutput(r);
    }

    async function handleSuggestExams() {
        setAiOutput("Gerando sugestão de exames...");
        const r = await suggestExams({
            nome: "Funcionário Exemplo",
            cargo: "Operador de Máquinas",
            riscos: ["ruído", "poeira"]
        });
        setAiOutput(r);
    }


    const renderContent = () => {
        const selectedEmpresaNome = selectedEmpresaId !== null
            ? data.empresas.find(e => e.id === selectedEmpresaId)?.nomeFantasia ?? 'Empresa'
            : 'Visão Geral (Todas as Empresas)';

        switch (activeView) {
            case 'dashboard':
                return <Dashboard 
                            stats={stats} 
                            documentos={filteredDocumentos}
                            documentoTipos={data.documentoTipos}
                            empresas={data.empresas}
                            selectedEmpresaNome={selectedEmpresaNome}
                            onImport={() => handleOpenModal('importar')}
                            onRegister={handleOpenCadastroManual}
                            onRegisterExame={() => handleOpenModal('registrarExame')}
                        />;
            case 'empresas':
                return <EmpresasTab
                            data={data}
                            currentUser={currentUser!}
                            onAdd={() => handleOpenEmpresaManager()}
                            onEdit={handleEditEmpresa}
                            onDelete={handleDeleteEmpresa}
                            onAddDocument={handleOpenDocumentManager}
                            onEditDocument={handleOpenDocumentManager}
                            onAddPasta={handleOpenPastaManager}
                            onDataChange={reloadData}
                            setConfirmation={setConfirmation}
                            onOpenSignature={(doc) => setDocumentoParaAssinar(doc)}
                        />;
            case 'funcionarios':
                return (
                    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                                <TabButton name="ativos" label="Funcionários Ativos" activeTab={activeFuncionarioTab} setActiveTab={setActiveFuncionarioTab} />
                                <TabButton name="desativados" label="Desativados" activeTab={activeFuncionarioTab} setActiveTab={setActiveFuncionarioTab} />
                                <TabButton name="validacao" label="Validação de Dados" activeTab={activeFuncionarioTab} setActiveTab={setActiveFuncionarioTab} />
                            </nav>
                        </div>
                        <div className="pt-5">
                            {activeFuncionarioTab === 'ativos' && <FuncionariosTab funcionarios={filteredFuncionarios} exames={data.examesRealizados} onRegister={() => handleOpenModal('cadastroManual')} onRegisterExame={() => handleOpenModal('registrarExame')} onEdit={handleEditFuncionario} onDetails={handleDetailsFuncionario} onDeactivate={handleDeactivate} onDelete={handleDelete} hasSelectedEmpresa={selectedEmpresaId !== null} />}
                            {activeFuncionarioTab === 'desativados' && <DesativadosTab funcionarios={filteredFuncionarios} onReactivate={handleReactivate} onDelete={handleDelete} />}
                            {activeFuncionarioTab === 'validacao' && <ValidacaoTab funcionarios={filteredFuncionarios} exames={data.examesRealizados} onDataChange={reloadData} onCorrect={handleEditFuncionario} />}
                        </div>
                    </div>
                );
            case 'financeiro':
                return <FinanceiroGeralTab
                            data={data}
                            servicosPrestados={filteredServicosPrestados}
                            cobrancas={filteredCobrancas}
                            onDataChange={reloadData}
                            onAddServico={() => { setEditingServicoPrestado(null); handleOpenModal('servicoPrestadoManager'); }}
                            onEditServico={handleEditServicoPrestado}
                            onAddCobranca={() => { setEditingCobranca(null); handleOpenModal('cobrancaManager'); }}
                            onEditCobranca={handleEditCobranca}
                            onAddNFe={() => { setEditingNFe(null); handleOpenModal('nfeManager'); }}
                            onOpenCatalogoManager={handleOpenCatalogoManager}
                        />;
            case 'pcmso':
                return <PcmsoTab 
                            empresas={data.empresas}
                            cargos={data.cargos}
                            ambientes={data.ambientes}
                            riscos={data.riscos}
                            masterExames={data.masterExames}
                            cargoAmbienteLinks={data.cargoAmbienteLinks}
                            cargoRiscoLinks={data.cargoRiscoLinks}
                            protocolosExames={data.protocolosExames}
                            onDataChange={reloadData}
                            onOpenManagementModal={handleOpenManagementModal}
                        />;
            case 'relatorios':
                return <RelatoriosTab 
                            onOpenGerarRelatorio={() => handleOpenModal('gerarRelatorio')} 
                            onOpenGerarRelatorioDocumentos={() => handleOpenModal('gerarRelatorioDocumentos')}
                        />;
            case 'configuracoes':
                return <ConfiguracoesGeraisTab
                            onOpenConfiguracoes={() => handleOpenModal('configuracoes')}
                            onOpenBackup={() => handleOpenModal('backup')}
                            onOpenConfigNFSe={handleOpenConfigNFSe}
                        />;
            default:
                return null;
        }
    }
    
    if (!authChecked) {
        return <div className="flex items-center justify-center h-screen bg-[#F4F6F8] text-slate-700 font-sans">Carregando...</div>;
    }

    if (!currentUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {isLoadingData && <LoadingSpinner message="Carregando dados..." />}
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header
                    onOpenNotifications={() => handleOpenModal('notifications')}
                    notificationCount={notifications.length}
                    empresas={data.empresas}
                    selectedEmpresaId={selectedEmpresaId}
                    onEmpresaChange={setSelectedEmpresaId}
                    user={currentUser}
                    onLogout={handleLogout}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full px-6 py-6 space-y-6">
                        {renderContent()}
                    </div>
                </main>
            </div>


            {/* Modals */}
            <ImportarPlanilhaModal isOpen={modals.importar} onClose={handleCloseAllModals} onImportSuccess={reloadData} empresas={data.empresas} />
            <CadastroManualModal 
                isOpen={modals.cadastroManual} 
                onClose={handleCloseAllModals} 
                onSaveSuccess={reloadData} 
                empresas={data.empresas} 
                initialName={funcionarioInitialName}
                onOpenEmpresaManager={handleOpenEmpresaManager}
            />
            <RegistrarExameModal isOpen={modals.registrarExame} onClose={handleCloseAllModals} onSaveSuccess={reloadData} funcionarios={data.funcionarios.filter(f => f.ativo)} />
            <GerarRelatorioModal isOpen={modals.gerarRelatorio} onClose={handleCloseAllModals} data={data} selectedEmpresaId={selectedEmpresaId} />
            <GerarRelatorioDocumentosModal 
                isOpen={modals.gerarRelatorioDocumentos} 
                onClose={handleCloseAllModals} 
                documentos={data.documentosEmpresa} 
                empresas={data.empresas}
                documentoTipos={data.documentoTipos}
            />
            <ConfiguracoesModal 
                isOpen={modals.configuracoes} 
                onClose={handleCloseAllModals}
                onOpenCargos={() => { handleCloseAllModals(); handleOpenManagementModal('cargos'); }}
                onOpenAmbientes={() => { handleCloseAllModals(); handleOpenManagementModal('ambientes'); }}
                onOpenRiscos={() => { handleCloseAllModals(); handleOpenManagementModal('riscos'); }}
                onOpenExames={() => { handleCloseAllModals(); handleOpenManagementModal('exames'); }}
                onOpenPeriodicidade={() => { handleCloseAllModals(); handleOpenManagementModal('periodicidade'); }}
                onOpenDocumentoTipos={() => { handleCloseAllModals(); handleOpenManagementModal('documentoTipos'); }}
                onOpenUsuarios={() => { handleCloseAllModals(); handleOpenManagementModal('usuarios'); }}
            />
            <BackupModal isOpen={modals.backup} onClose={handleCloseAllModals} onDataChange={reloadData} />
            <NotificationCenterModal isOpen={modals.notifications} onClose={handleCloseAllModals} notifications={notifications} onResolve={handleOpenResolveNotification}/>
            <ResolveDuplicateModal isOpen={modals.resolveDuplicate} onClose={handleCloseAllModals} duplicateGroup={groupToResolve} onMerge={handleMergeDuplicates} />
            <EmpresaManagerModal isOpen={modals.empresaManager} onClose={handleCloseAllModals} onSaveSuccess={reloadData} empresa={editingEmpresa} empresas={data.empresas} initialName={empresaInitialName} />
            <DocumentoManagerModal 
                isOpen={modals.documentoManager} 
                onClose={handleCloseAllModals} 
                onSaveSuccess={reloadData} 
                context={documentModalContext}
                documentoToEdit={editingDocumento}
                users={data.users}
                currentUser={currentUser}
             />
            <PastaManagerModal isOpen={modals.pastaManager} onClose={handleCloseAllModals} onSaveSuccess={reloadData} context={pastaModalContext} />
            <AssinaturaDocumentoModal 
                isOpen={!!documentoParaAssinar}
                onClose={handleCloseAllModals}
                onActionSuccess={reloadData}
                documento={documentoParaAssinar}
                solicitadoPor={data.users.find(u => u.id === documentoParaAssinar?.solicitadoPorId) || null}
            />
            
            <ServicoPrestadoManagerModal 
                isOpen={modals.servicoPrestadoManager} 
                onClose={handleCloseAllModals} 
                onSaveSuccess={reloadData} 
                servico={editingServicoPrestado}
                data={data}
                onOpenCatalogoManager={handleOpenCatalogoManager}
                onOpenEmpresaManager={handleOpenEmpresaManager}
                onOpenCadastroManual={handleOpenCadastroManual}
             />
            <CobrancaManagerModal isOpen={modals.cobrancaManager} onClose={handleCloseAllModals} onSaveSuccess={reloadData} cobranca={editingCobranca} data={data} />
            <NFeManagerModal isOpen={modals.nfeManager} onClose={handleCloseAllModals} onSaveSuccess={reloadData} nfe={editingNFe} data={data} />


            {/* Management Modals */}
            <CargoManagerModal isOpen={modals.management === 'cargos'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <AmbienteManagerModal isOpen={modals.management === 'ambientes'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <RiscoManagerModal isOpen={modals.management === 'riscos'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <ExameManagerModal isOpen={modals.management === 'exames'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <PeriodicidadeManagerModal isOpen={modals.management === 'periodicidade'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <DocumentoTipoManagerModal isOpen={modals.management === 'documentoTipos'} onClose={handleCloseManagementModal} onDataChange={reloadData} />
            <CatalogoServicoManagerModal 
                isOpen={modals.management === 'catalogoServicos'} 
                onClose={handleCloseManagementModal} 
                onDataChange={reloadData}
                initialName={catalogoInitialName}
            />
            <UserManagerModal
                isOpen={modals.management === 'usuarios'}
                onClose={handleCloseManagementModal}
                onDataChange={reloadData}
            />

            {/* Configuracao NFS-e Modal */}
            <ConfiguracaoNFSeModal
                isOpen={showConfigNFSeModal}
                onClose={() => setShowConfigNFSeModal(false)}
                onSaveSuccess={() => {
                    setShowConfigNFSeModal(false);
                    reloadData();
                }}
            />

            {/* Funcionario Modals */}
            <EditFuncionarioModal isOpen={!!editingFuncionario} onClose={() => setEditingFuncionario(null)} onSaveSuccess={reloadData} funcionario={editingFuncionario} empresas={data.empresas} />
            <FuncionarioDetailsModal isOpen={!!detailsFuncionario} onClose={() => setDetailsFuncionario(null)} funcionario={detailsFuncionario} exames={data.examesRealizados} />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                onConfirm={confirmation?.onConfirm || (() => {})}
                title={confirmation?.title || ''}
                confirmText={confirmation?.confirmText}
                confirmButtonClass={confirmation?.confirmButtonClass}
                confirmButtonText={confirmation?.confirmButtonText}
            >
                {confirmation?.message}
            </ConfirmationModal>
        </div>
    );
};

interface TabButtonProps {
    name: FuncionarioSubTab;
    label: string;
    activeTab: FuncionarioSubTab;
    setActiveTab: (tab: FuncionarioSubTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ name, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`${
            activeTab === name
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
        {label}
    </button>
);

export default App;

