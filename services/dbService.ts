import type { DbData, Funcionario, ExameRealizado, PeriodicidadeCargo, ValidationIssue, DuplicateGroup, Empresa, DocumentoEmpresa, Pasta, DocumentoTipo, DocumentoStatus, CatalogoServico, ServicoPrestado, Cobranca, NFe, User, SignatureStatus } from '../types';

const DB_KEY = 'occupationalHealthDB_v1';
const SESSION_KEY = 'sessionUser';

export const getInitialDb = (): DbData => ({
    users: [
        // INSECURE: Default admin user for demo purposes. Passwords should be hashed in a real application.
        { id: 1, nome: 'Administrador', username: 'admin', password: 'admin', role: 'admin' },
        { id: 2, nome: 'Dr. João Médico', username: 'joao.medico', password: '123', role: 'user' },
    ],
    empresas: [],
    pastas: [],
    documentosEmpresa: [],
    documentoTipos: [
        { id: 1, nome: 'Contrato', validadeMesesPadrao: 12, alertaDias: 30 },
        { id: 2, nome: 'ASO', validadeMesesPadrao: 12, alertaDias: 30 },
        { id: 3, nome: 'PCMSO', validadeMesesPadrao: 12, alertaDias: 45 },
        { id: 4, nome: 'PGR', validadeMesesPadrao: 24, alertaDias: 45 },
        { id: 5, nome: 'Alvará', validadeMesesPadrao: 12, alertaDias: 30 },
        { id: 6, nome: 'Outro', validadeMesesPadrao: null, alertaDias: 30 },
    ],
    funcionarios: [],
    examesRealizados: [],
    cargos: [],
    ambientes: [],
    riscos: [],
    masterExames: [],
    cargoAmbienteLinks: [],
    cargoRiscoLinks: [],
    protocolosExames: [],
    periodicidadesCargos: [
        { id: 1, cargo_nome: 'Default', periodicidade_meses: 12 }
    ],
    pcmsoConfig: null,
    // Financeiro
    catalogoServicos: [],
    servicosPrestados: [],
    cobrancas: [],
    nfes: [],
});

export const loadDb = (): DbData => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            const data = JSON.parse(dbString);
            // Ensure all keys exist to prevent runtime errors from old db versions
            return { ...getInitialDb(), ...data };
        }
    } catch (error) {
        console.error("Failed to load DB from localStorage", error);
    }
    return getInitialDb();
};

export const saveDb = (db: DbData) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save DB to localStorage", error);
        // This is where the circular reference error would be caught.
    }
};

// Data Migration for multi-company feature
const runMigration = () => {
    const db = loadDb();
    let dbWasModified = false;
    
    if (db.empresas.length === 0 && db.funcionarios.length > 0) {
        console.log("Running migration: Creating default company and associating employees...");
        
        const defaultConfig = db.pcmsoConfig || {
            empresa_nome: 'Empresa Padrão (Migrada)',
            cnpj: '00.000.000/0001-00',
            medico_nome: 'Dr. Responsável',
            medico_crm: '123456',
            inicio_validade: new Date().toISOString().split('T')[0],
            revisar_ate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        };

        const defaultCompany: Omit<Empresa, 'id'> = {
            matrizId: null,
            razaoSocial: defaultConfig.empresa_nome,
            nomeFantasia: defaultConfig.empresa_nome,
            cnpj: defaultConfig.cnpj,
            medicoNome: defaultConfig.medico_nome,
            medicoCrm: defaultConfig.medico_crm,
            inicioValidade: defaultConfig.inicio_validade,
            revisarAte: defaultConfig.revisar_ate,
        };

        const newCompany = createCrudService<Empresa>('empresas').add(defaultCompany);

        db.funcionarios.forEach(f => {
            f.empresaId = newCompany.id;
        });

        db.pcmsoConfig = null; // Deprecate old config
        dbWasModified = true;
        console.log(`Migration complete. Default company "${newCompany.nomeFantasia}" created and ${db.funcionarios.length} employees associated.`);
    }

    if (!db.users) {
        console.log("Running migration: Adding default user table...");
        db.users = getInitialDb().users;
        dbWasModified = true;
    }

    // Migration to add signature fields to existing documents
    let signatureMigrationCount = 0;
    db.documentosEmpresa.forEach(doc => {
        if (typeof doc.statusAssinatura === 'undefined') {
            doc.statusAssinatura = 'NAO_REQUER';
            doc.requerAssinaturaDeId = null;
            doc.solicitadoPorId = null;
            doc.dataSolicitacaoAssinatura = null;
            doc.dataConclusaoAssinatura = null;
            doc.observacoesAssinatura = '';
            signatureMigrationCount++;
        }
    });

    if (signatureMigrationCount > 0) {
        console.log(`Migration complete. Added signature fields to ${signatureMigrationCount} documents.`);
        dbWasModified = true;
    }

    if (dbWasModified) {
        saveDb(db);
    }
};


export const initializeDb = () => {
    if (!localStorage.getItem(DB_KEY)) {
        saveDb(getInitialDb());
    } else {
        runMigration();
    }
};

const createCrudService = <T extends { id: number }>(tableName: keyof DbData) => {
    return {
        getAll: (): T[] => {
            const db = loadDb();
            return (db[tableName] as unknown as T[]) || [];
        },
        get: (id: number): T | undefined => {
            const items = createCrudService<T>(tableName).getAll();
            return items.find(item => item.id === id);
        },
        add: (newItemData: Omit<T, 'id'>): T => {
            const db = loadDb();
            const items = (db[tableName] as unknown as T[]) || [];
            const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
            const newItem = { ...newItemData, id: newId } as T;
            (db[tableName] as unknown as T[]).push(newItem);
            saveDb(db);
            return newItem;
        },
        update: (id: number, updatedData: Partial<Omit<T, 'id'>>): T | undefined => {
            const db = loadDb();
            const items = (db[tableName] as unknown as T[]) || [];
            const itemIndex = items.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                const updatedItem = { ...items[itemIndex], ...updatedData };
                items[itemIndex] = updatedItem;
                saveDb(db);
                return updatedItem;
            }
            return undefined;
        },
        remove: (id: number): boolean => {
            const db = loadDb();
            const items = (db[tableName] as unknown as T[]) || [];
            const newItems = items.filter(item => item.id !== id);
            if (newItems.length < items.length) {
                (db[tableName] as any) = newItems;
                saveDb(db);
                return true;
            }
            return false;
        },
    };
};

// --- Authentication Service ---
export const login = (username: string, password: string): User | null => {
    const db = loadDb();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    }
    return null;
};

export const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const userString = sessionStorage.getItem(SESSION_KEY);
        if (userString) {
            return JSON.parse(userString);
        }
    } catch (error) {
        console.error("Failed to get current user from sessionStorage", error);
    }
    return null;
};

// --- CRUD Services ---
export const userService = createCrudService<User>('users');
export const empresaService = createCrudService<Empresa>('empresas');
export const documentoTipoService = createCrudService<DocumentoTipo>('documentoTipos');
export const pastaService = createCrudService<Pasta>('pastas');
// Financeiro Services
export const catalogoServicoService = createCrudService<CatalogoServico>('catalogoServicos');
export const servicoPrestadoService = createCrudService<ServicoPrestado>('servicosPrestados');
export const cobrancaService = createCrudService<Cobranca>('cobrancas');
export const nfeService = createCrudService<NFe>('nfes');


// --- Document Logic ---
export const calculateStatus = (dataFim: string | null, alertaDias: number): DocumentoStatus => {
    if (!dataFim) return 'ATIVO';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataVenc = new Date(dataFim + 'T00:00:00');
    
    if (dataVenc < hoje) {
        return 'VENCIDO';
    }

    const dataAlerta = new Date();
    dataAlerta.setHours(0,0,0,0);
    dataAlerta.setDate(hoje.getDate() + alertaDias);

    if (dataVenc <= dataAlerta) {
        return 'VENCENDO';
    }

    return 'ATIVO';
};

export const calculateDataFim = (dataInicio: string, validadeMeses: number): string => {
    const data = new Date(dataInicio + 'T00:00:00');
    data.setMonth(data.getMonth() + validadeMeses);
    return data.toISOString().split('T')[0];
};

export const updateAllDocumentStatuses = (): number => {
    const db = loadDb();
    let changes = 0;
    const tipos = db.documentoTipos;

    db.documentosEmpresa.forEach(doc => {
        if (doc.temValidade && doc.status !== 'ENCERRADO') {
            const tipo = tipos.find(t => t.nome === doc.tipo) || { alertaDias: 30 };
            const newStatus = calculateStatus(doc.dataFim, tipo.alertaDias);
            if(doc.status !== newStatus) {
                doc.status = newStatus;
                changes++;
            }
        }
    });

    if(changes > 0) {
        saveDb(db);
    }
    console.log(`[Document Status Job] Updated ${changes} document statuses.`);
    return changes;
}

export const documentoEmpresaService = {
    ...createCrudService<DocumentoEmpresa>('documentosEmpresa'),
    add: (newItemData: Omit<DocumentoEmpresa, 'id'>) => {
        const db = loadDb();
        const items = db.documentosEmpresa || [];
        const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
        
        const newItem: DocumentoEmpresa = {
            ...newItemData,
            id: newId,
        statusAssinatura: newItemData.requerAssinaturaDeId ? 'PENDENTE' : 'NAO_REQUER',
            dataSolicitacaoAssinatura: newItemData.requerAssinaturaDeId ? new Date().toISOString() : null,
            dataConclusaoAssinatura: null,
            observacoesAssinatura: '',
        };

        db.documentosEmpresa.push(newItem);
        saveDb(db);
        return newItem;
    },
    update: (id: number, updatedData: Partial<Omit<DocumentoEmpresa, 'id'>>) => {
        const db = loadDb();
        const items = db.documentosEmpresa || [];
        const itemIndex = items.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            const originalItem = items[itemIndex];
            const updatedItem = { ...originalItem, ...updatedData };

            // Logic to update signature status if assignee is changed
            if ('requerAssinaturaDeId' in updatedData) {
                if (updatedData.requerAssinaturaDeId) {
                    updatedItem.statusAssinatura = 'PENDENTE';
                    updatedItem.dataSolicitacaoAssinatura = new Date().toISOString();
                    updatedItem.dataConclusaoAssinatura = null;
                } else {
                    updatedItem.statusAssinatura = 'NAO_REQUER';
                    updatedItem.dataSolicitacaoAssinatura = null;
                }
            }

            items[itemIndex] = updatedItem;
            saveDb(db);
            return updatedItem;
        }
        return undefined;
    },
    remove: (id: number): boolean => {
        const db = loadDb();
        const docExists = db.documentosEmpresa.some(d => d.id === id);
        if(!docExists) return false;

        db.documentosEmpresa = db.documentosEmpresa.filter(d => d.id !== id);
        saveDb(db);
        return true;
    }
};

export const getAssinaturasPendentes = (userId: number): DocumentoEmpresa[] => {
    const db = loadDb();
    return db.documentosEmpresa.filter(doc => doc.requerAssinaturaDeId === userId && doc.statusAssinatura === 'PENDENTE');
}


export const funcionarioService = {
    ...createCrudService<Funcionario>('funcionarios'),
    remove: (id: number): boolean => { // Override to cascade delete
        const db = loadDb();
        const funcionarioExists = db.funcionarios.some(f => f.id === id);
        if(!funcionarioExists) return false;

        // Remove associated exams
        db.examesRealizados = db.examesRealizados.filter(e => e.funcionario_id !== id);
        // Remove funcionario
        db.funcionarios = db.funcionarios.filter(f => f.id !== id);
        
        saveDb(db);
        return true;
    }
};
export const cargoService = createCrudService<any>('cargos');
export const ambienteService = createCrudService<any>('ambientes');
export const riscoService = createCrudService<any>('riscos');
export const exameService = createCrudService<any>('masterExames');
export const cargoAmbienteLinkService = createCrudService<any>('cargoAmbienteLinks');
export const cargoRiscoLinkService = createCrudService<any>('cargoRiscoLinks');
export const protocoloExameService = createCrudService<any>('protocolosExames');
export const periodicidadeCargoService = createCrudService<PeriodicidadeCargo>('periodicidadesCargos');


// --- ExameRealizado Specific Logic ---
const getVencimento = (dataRealizacao: string, cargo: string, db: DbData): string => {
    const regra = db.periodicidadesCargos.find(p => p.cargo_nome.toLowerCase() === cargo.toLowerCase());
    const meses = regra ? regra.periodicidade_meses : 12; // Default 12 meses
    const data = new Date(dataRealizacao + 'T00:00:00');
    data.setMonth(data.getMonth() + meses);
    return data.toISOString().split('T')[0];
};

export const exameRealizadoService = {
    ...createCrudService<ExameRealizado>('examesRealizados'),
    add: (newExameData: Omit<ExameRealizado, 'id' | 'data_vencimento'>) => {
        const db = loadDb();
        const funcionario = db.funcionarios.find(f => f.id === newExameData.funcionario_id);
        if (!funcionario) throw new Error("Funcionário não encontrado");

        const data_vencimento = getVencimento(newExameData.data_realizacao, funcionario.cargo, db);
        
        const exameComVencimento = { ...newExameData, data_vencimento };
        
        const service = createCrudService<ExameRealizado>('examesRealizados');
        const newExame = service.add(exameComVencimento);

        // Update funcionario's last exam date
        funcionarioService.update(funcionario.id, { 
            data_ultimo_exame: newExame.data_realizacao,
            tipo_ultimo_exame: newExame.tipo_exame
        });

        return newExame;
    }
}

// --- Validation Logic ---
export const getValidationIssues = (funcionarios: Funcionario[], exames: ExameRealizado[]): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    funcionarios.filter(f => f.ativo).forEach(func => {
        const currentIssues: string[] = [];
        if (!func.cpf) currentIssues.push('Sem CPF');
        if (!func.cargo) currentIssues.push('Sem Cargo');
        const hasExams = exames.some(e => e.funcionario_id === func.id);
        if (!hasExams) currentIssues.push('Sem Exame');
        if (currentIssues.length > 0) {
            issues.push({
                funcionarioId: func.id,
                nome: func.nome,
                matricula: func.matricula,
                issues: currentIssues,
            });
        }
    });
    return issues;
};

// --- Recalculation Logic ---
export const recalculateAllVencimentos = () => {
    const db = loadDb();
    let updated = 0;
    db.examesRealizados = db.examesRealizados.map(exame => {
        const funcionario = db.funcionarios.find(f => f.id === exame.funcionario_id);
        if (funcionario) {
            const newVencimento = getVencimento(exame.data_realizacao, funcionario.cargo, db);
            if (newVencimento !== exame.data_vencimento) {
                updated++;
                return { ...exame, data_vencimento: newVencimento };
            }
        }
        return exame;
    });
    saveDb(db);
    return { updated };
}

// --- Backup/Restore ---
export const exportBackup = () => {
    const db = loadDb();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `backup_saude_ocupacional_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importBackup = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not readable text.");
                const dbData = JSON.parse(text);
                if (dbData && typeof dbData === 'object' && 'funcionarios' in dbData) {
                    saveDb(dbData as DbData);
                    resolve();
                } else {
                    reject(new Error("Arquivo de backup inválido ou corrompido."));
                }
            } catch (e) {
                reject(new Error("Erro ao processar o arquivo de backup."));
            }
        };
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
        reader.readAsText(file);
    });
};

// --- Data Cleanup ---
export const limparExamesOrfaos = (): number => {
    const db = loadDb();
    const funcionarioIds = new Set(db.funcionarios.map(f => f.id));
    const originalCount = db.examesRealizados.length;
    db.examesRealizados = db.examesRealizados.filter(exame => funcionarioIds.has(exame.funcionario_id));
    const cleanedCount = originalCount - db.examesRealizados.length;
    if (cleanedCount > 0) {
        saveDb(db);
    }
    return cleanedCount;
};


// --- Duplicate Detection & Merging ---
export const detectarDuplicados = (funcionarios: Funcionario[]): DuplicateGroup[] => {
    const activeFuncionarios = funcionarios.filter(f => f.ativo);
    const groups: { [key: string]: DuplicateGroup } = {};

    // 1. Group by CPF (most reliable)
    activeFuncionarios.forEach(f => {
        if (f.cpf) {
            const key = `cpf_${f.cpf}`;
            if (!groups[key]) {
                groups[key] = { key, type: 'CPF', identifier: f.cpf, funcionarios: [] };
            }
            groups[key].funcionarios.push(f);
        }
    });

    // 2. Group by similar name (for those without CPF)
    const withoutCpf = activeFuncionarios.filter(f => !f.cpf);
    // Simple grouping by exact lower-case name for this example
    withoutCpf.forEach(f1 => {
        withoutCpf.forEach(f2 => {
            if (f1.id < f2.id && f1.nome.toLowerCase() === f2.nome.toLowerCase()) {
                const key = `name_${f1.nome.toLowerCase()}`;
                if (!groups[key]) {
                    groups[key] = { key, type: 'Nome Similar', identifier: f1.nome, funcionarios: [f1] };
                }
                if (!groups[key].funcionarios.some(f => f.id === f2.id)) {
                    groups[key].funcionarios.push(f2);
                }
            }
        });
    });

    return Object.values(groups).filter(g => g.funcionarios.length > 1);
};

export const mesclarFuncionarios = (primaryId: number, secondaryIds: number[]): void => {
    const db = loadDb();
    const allIds = [primaryId, ...secondaryIds];
    const duplicates = db.funcionarios.filter(f => allIds.includes(f.id));
    
    const primaryFunc = duplicates.find(f => f.id === primaryId);
    if (!primaryFunc) throw new Error("Funcionário principal não encontrado.");

    const secondaryFuncs = duplicates.filter(f => f.id !== primaryId);

    // Merge logic: Combine best data into primaryFunc
    secondaryFuncs.forEach(sec => {
        primaryFunc.matricula = primaryFunc.matricula || sec.matricula;
        primaryFunc.cpf = primaryFunc.cpf || sec.cpf;
        primaryFunc.whatsapp = primaryFunc.whatsapp || sec.whatsapp;
        primaryFunc.setor = primaryFunc.setor || sec.setor;
        if (sec.data_admissao && (!primaryFunc.data_admissao || sec.data_admissao < primaryFunc.data_admissao)) {
            primaryFunc.data_admissao = sec.data_admissao;
        }
        // More sophisticated merging could be added here
    });

    // Transfer exams from secondary to primary
    db.examesRealizados = db.examesRealizados.map(exame => {
        if (secondaryIds.includes(exame.funcionario_id)) {
            return { ...exame, funcionario_id: primaryId };
        }
        return exame;
    });

    // Remove secondary funcs
    db.funcionarios = db.funcionarios.filter(f => !secondaryIds.includes(f.id));

    // Update primary func
    const index = db.funcionarios.findIndex(f => f.id === primaryId);
    db.funcionarios[index] = primaryFunc;

    saveDb(db);
};

// FIX: Define normalizeDate function to be used by processImportedData.
// Helper to normalize dates from various formats
const normalizeDate = (dateStr: string): string | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const cleanedStr = dateStr.split(' ')[0]; // Remove time part if present
    
    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedStr)) return cleanedStr;
    
    // Try DD/MM/YYYY or DD-MM-YYYY
    const parts = cleanedStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (parts) {
        const [_, day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    console.warn("Could not parse date:", dateStr);
    return null;
};

// This function is only called from the Import Modal.
// It directly manipulates the DB object and saves it.
export const processImportedData = (parsedData: any[], empresaId: number) => {
    const db = loadDb();
    let newFuncCount = 0;
    let updatedFuncCount = 0;
    let newExamsCount = 0;

    // Get the current max IDs to ensure new ones are unique integers
    let maxFuncId = db.funcionarios.reduce((max, p) => p.id > max ? p.id : max, 0);
    let maxExameId = db.examesRealizados.reduce((max, p) => p.id > max ? p.id : max, 0);

    parsedData.forEach(item => {
        if (!item.nome || !item.data_exame) return;

        const dataExamePlanilha = normalizeDate(item.data_exame);
        if(!dataExamePlanilha) return;

        let funcExistente = db.funcionarios.find(f => 
            f.empresaId === empresaId && (
                (item.cpf && f.cpf === item.cpf) || 
                (f.nome.toLowerCase() === item.nome.toLowerCase())
            )
        );

        if (funcExistente) { // Update existing employee
            const ultimoExameSistema = funcExistente.data_ultimo_exame;
            
            if (!ultimoExameSistema || dataExamePlanilha > ultimoExameSistema) {
                const updatedFunc = {
                    ...funcExistente,
                    cargo: item.cargo || funcExistente.cargo,
                    matricula: item.matricula || funcExistente.matricula,
                    data_admissao: normalizeDate(item.data_admissao) || funcExistente.data_admissao,
                    data_ultimo_exame: dataExamePlanilha,
                    tipo_ultimo_exame: item.tipo_exame || 'Periódico',
                };
                db.funcionarios = db.funcionarios.map(f => f.id === updatedFunc.id ? updatedFunc : f);
                updatedFuncCount++;
            }
            
            const exameJaExiste = db.examesRealizados.some(e => e.funcionario_id === funcExistente!.id && e.data_realizacao === dataExamePlanilha);
            if (!exameJaExiste) {
                maxExameId++;
                const data_vencimento = getVencimento(dataExamePlanilha, funcExistente.cargo, db);
                db.examesRealizados.push({
                    id: maxExameId,
                    funcionario_id: funcExistente.id,
                    data_realizacao: dataExamePlanilha,
                    tipo_exame: item.tipo_exame || 'Periódico',
                    data_vencimento: data_vencimento,
                    observacoes: 'Importado via planilha'
                });
                newExamsCount++;
            }
            
        } else { // Create new employee
             maxFuncId++;
             const newFunc: Funcionario = {
                id: maxFuncId,
                empresaId: empresaId,
                nome: item.nome,
                cargo: item.cargo || 'Não informado',
                cpf: item.cpf || null,
                matricula: item.matricula || null,
                data_admissao: normalizeDate(item.data_admissao) || null,
                data_ultimo_exame: dataExamePlanilha,
                tipo_ultimo_exame: item.tipo_exame || 'Periódico',
                setor: item.setor || null,
                ativo: true,
                created_at: new Date().toISOString()
            };
            db.funcionarios.push(newFunc);
            
            maxExameId++;
            const data_vencimento = getVencimento(dataExamePlanilha, newFunc.cargo, db);
            db.examesRealizados.push({
                id: maxExameId,
                funcionario_id: newFunc.id,
                data_realizacao: dataExamePlanilha,
                tipo_exame: item.tipo_exame || 'Periódico',
                data_vencimento: data_vencimento,
                observacoes: 'Importado via planilha'
            });
            newFuncCount++;
            newExamsCount++;
        }
    });

    saveDb(db); // Use the centralized save function
    return { newFuncCount, updatedFuncCount, newExamsCount };
};
