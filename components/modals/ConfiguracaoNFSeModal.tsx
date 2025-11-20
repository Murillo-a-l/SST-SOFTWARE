import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ConfiguracaoNFSe {
    id?: number;
    login: string;
    senha: string;
    cidade: string;
    url: string;
    modoTeste: boolean;
}

interface ConfiguracaoNFSeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
}

export const ConfiguracaoNFSeModal: React.FC<ConfiguracaoNFSeModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
    const [config, setConfig] = useState<ConfiguracaoNFSe>({
        login: '',
        senha: '',
        cidade: '',
        url: 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php',
        modoTeste: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [senhaAlterada, setSenhaAlterada] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('Token não encontrado');
                return;
            }

            const response = await fetch('http://localhost:3001/api/configuracao-nfse', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                toast.error('Sessão expirada. Por favor, faça login novamente.');
                window.location.href = '/';
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.data.configuracao) {
                    setConfig(data.data.configuracao);
                    setSenhaAlterada(false); // Resetar flag
                }
            } else {
                console.error('Erro ao carregar configuração:', response.status);
            }
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    };

    const handleSave = async () => {
        if (!config.login || !config.cidade) {
            toast.error('Preencha pelo menos o Login (CNPJ) e o Código da Cidade');
            return;
        }

        if (!senhaAlterada && config.id) {
            toast.error('Altere a senha para salvar ou mantenha a atual.');
            return;
        }

        setIsLoading(true);
        setTestResult(null);

        try {
            const token = localStorage.getItem('token');
            const url = config.id
                ? `http://localhost:3001/api/configuracao-nfse/${config.id}`
                : 'http://localhost:3001/api/configuracao-nfse';

            const method = config.id ? 'PUT' : 'POST';

            const body = { ...config };
            // Se a senha não foi alterada e é uma edição, não enviar
            if (!senhaAlterada && config.id) {
                delete body.senha;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.status === 401) {
                toast.error('Sessão expirada. Por favor, faça login novamente.');
                window.location.href = '/';
                return;
            }

            const data = await response.json();

            if (response.ok) {
                toast.error(data.message || 'Configuração salva com sucesso!');
                onSaveSuccess();
                onClose();
            } else {
                toast.error(`Erro: ${data.message}`);
            }
        } catch (error: any) {
            console.error('Erro ao salvar configuração:', error);
            toast.error(`Erro ao salvar configuração: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTest = async () => {
        if (!config.login || !config.senha || !config.cidade) {
            toast.error('Preencha Login, Senha e Código da Cidade para testar');
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/configuracao-nfse/testar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: config.login,
                    senha: config.senha,
                    cidade: config.cidade,
                    url: config.url
                })
            });

            if (response.status === 401) {
                toast.error('Sessão expirada. Por favor, faça login novamente.');
                window.location.href = '/';
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setTestResult({ success: true, message: data.message });
            } else {
                setTestResult({ success: false, message: data.message });
            }
        } catch (error: any) {
            console.error('Erro ao testar configuração:', error);
            setTestResult({ success: false, message: `Erro ao testar: ${error.message}` });
        } finally {
            setIsTesting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">⚙️ Configuração de NFS-e</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>ℹ️ Importante:</strong> Configure suas credenciais de acesso ao webservice de NFS-e da prefeitura.
                            Essas informações são fornecidas pela prefeitura ou pelo provedor de NFS-e (IPM/AtendeNet).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Login (CNPJ ou CPF) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={config.login}
                                onChange={(e) => setConfig({ ...config, login: e.target.value.replace(/\D/g, '') })}
                                placeholder="Ex: 12345678000199"
                                className="w-full p-2 border rounded-lg"
                                maxLength={14}
                            />
                            <p className="text-xs text-gray-500 mt-1">Apenas números, sem pontos ou traços</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Senha <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={config.senha}
                                onChange={(e) => {
                                    setConfig({ ...config, senha: e.target.value });
                                    setSenhaAlterada(true);
                                }}
                                placeholder={config.id ? "Digite para alterar a senha" : "Digite a senha"}
                                className="w-full p-2 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Senha fornecida pela prefeitura para acesso ao webservice</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código TOM da Cidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={config.cidade}
                                onChange={(e) => setConfig({ ...config, cidade: e.target.value.replace(/\D/g, '') })}
                                placeholder="Ex: 8055 (Barra Velha/SC)"
                                className="w-full p-2 border rounded-lg"
                                maxLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">Código TOM (Tabela de Órgãos e Municípios) da sua cidade</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL do Webservice
                            </label>
                            <input
                                type="text"
                                value={config.url}
                                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">URL padrão para IPM/AtendeNet. Altere apenas se necessário.</p>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <input
                                type="checkbox"
                                id="modoTeste"
                                checked={config.modoTeste}
                                onChange={(e) => setConfig({ ...config, modoTeste: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <label htmlFor="modoTeste" className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Modo Teste</span> - Emitir notas fictícias (recomendado para testes)
                            </label>
                        </div>

                        {testResult && (
                            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {testResult.success ? '✓' : '✗'} {testResult.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-b-lg flex justify-between gap-3">
                    <button
                        onClick={handleTest}
                        disabled={isTesting || isLoading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                        {isTesting ? '🔄 Testando...' : '🧪 Testar Conexão'}
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading || isTesting}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                            {isLoading ? 'Salvando...' : '💾 Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
