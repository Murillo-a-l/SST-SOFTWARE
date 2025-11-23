// @ts-nocheck

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from '../../types';
import { authApi, ApiError } from '../../services/apiService';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

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
        if (err.statusCode === 401) {
          toast.error('Usuário ou senha inválidos.');
        } else if (err.statusCode === 500) {
          toast.error('Erro no servidor. Tente novamente mais tarde.');
        } else {
          toast.error(err.message || 'Erro ao fazer login.');
        }
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F4C5C]/8 via-[#F2F0EB]/70 to-[#C07954]/10 text-[#1F2A3D]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_20%,rgba(192,121,84,0.18),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(15,76,92,0.16),transparent_34%),radial-gradient(circle_at_40%_80%,rgba(15,76,92,0.12),transparent_36%)]" />
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(60deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      <div className="relative w-full max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/55 backdrop-blur-2xl shadow-[0_28px_70px_rgba(12,26,45,0.16)] p-8 sm:p-10 flex flex-col justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(192,121,84,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(15,76,92,0.12),transparent_36%)]" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C07954]/70 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#C07954] p-[2px] shadow-[0_18px_40px_rgba(12,59,73,0.35)]">
                <div className="flex h-full w-full items-center justify-center rounded-[16px] bg-white/90 text-[#0F4C5C]">
                  <AppIcon name="dashboard" className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B7A92]">Plataforma premium</p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F4C5C]">Ocupalli</h1>
                <p className="text-sm text-[#4B5568]">Saúde ocupacional com estética retrô-chique e performance clínica.</p>
              </div>
            </div>

            <div className="relative mt-10 space-y-4 text-sm text-[#1F2A3D]">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-white/60 shadow-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE3D5] text-[#8A5B2F] shadow-sm">
                  <AppIcon name="reports" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Painel clínico</p>
                  <p className="text-[#6B7A92]">Alertas e indicadores com narrativa health-tech.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-white/60 shadow-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF2ED] text-[#0F4C5C] shadow-sm">
                  <AppIcon name="users" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Fluxos confiáveis</p>
                  <p className="text-[#6B7A92]">Cadastros, exames e documentos sem alterar seus processos.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-white/60 shadow-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F0FF] text-[#0F4C5C] shadow-sm">
                  <AppIcon name="settings" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Estilo consistente</p>
                  <p className="text-[#6B7A92]">Todos os formulários com microinterações premium.</p>
                </div>
              </div>
            </div>

            <div className="relative mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#6B7A92]">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C07954]/60 to-transparent" />
              <span>Health Tech</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#147D8C]/60 to-transparent" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 backdrop-blur-2xl shadow-[0_24px_60px_rgba(12,26,45,0.14)] p-8 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(192,121,84,0.1),transparent_34%),radial-gradient(circle_at_85%_0%,rgba(15,76,92,0.12),transparent_32%)]" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#0F4C5C]/50 to-transparent" />
            <div className="relative space-y-2 text-center">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B7A92]">Acesso seguro</p>
              <h2 className="text-2xl font-semibold text-[#0F4C5C]">Entrar no Ocupalli</h2>
              <p className="text-sm text-[#4B5568]">Continue de onde parou, com fluxos preservados e visual premium.</p>
            </div>

            <form className="relative mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="text-left">
                  <label htmlFor="username" className="block text-sm font-semibold text-[#1F2A3D]">Nome de Usuário</label>
                  <p className="text-xs text-[#6B7A92]">Mantenha as mesmas credenciais, agora com um toque retrô-chique.</p>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2"
                    placeholder="ex: admin"
                  />
                </div>
                <div className="text-left">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1F2A3D]">Senha</label>
                  <p className="text-xs text-[#6B7A92]">Fluxos intactos, apenas a experiência foi elevada.</p>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 shadow-[0_18px_36px_rgba(12,59,73,0.18)]"
                >
                  {isLoading ? 'Entrando...' : 'Entrar no painel'}
                </Button>
                <p className="text-xs text-center text-[#6B7A92]">
                  Use <span className="font-mono">admin</span> / <span className="font-mono">admin</span> para o primeiro acesso.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
