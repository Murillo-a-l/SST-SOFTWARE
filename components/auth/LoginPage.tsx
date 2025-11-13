
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from '../../types';
import { authApi, ApiError } from '../../services/apiService';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user } = await authApi.login(username, password);
            toast.success(`Bem-vindo, ${user.nome}!`);
            onLoginSuccess(user);
        } catch (err) {
            if (err instanceof ApiError) {
                // Erros específicos da API
                if (err.statusCode === 401) {
                    toast.error('Usuário ou senha inválidos.');
                } else if (err.statusCode === 500) {
                    toast.error('Erro no servidor. Tente novamente mais tarde.');
                } else {
                    toast.error(err.message || 'Erro ao fazer login.');
                }
            } else {
                // Erros de rede ou outros
                toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        <span className="text-blue-600">🩺</span> Saúde Ocupacional
                    </h1>
                    <p className="mt-2 text-gray-500">Acesse o sistema de gerenciamento</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Nome de Usuário
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ex: admin"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                     <p className="text-xs text-center text-gray-500">
                        Use <span className="font-mono">admin</span> / <span className="font-mono">admin</span> para o primeiro acesso.
                    </p>
                </form>
            </div>
        </div>
    );
};
