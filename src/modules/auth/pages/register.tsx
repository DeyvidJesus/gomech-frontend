import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { useRegister } from "../hooks/useRegister";
import { useAuth } from "../hooks/useAuth";
import type { RegisterRequest, UserRole } from "../types/user";

function Register() {
  const register = useRegister();
  const navigate = useNavigate();
  const { data }: any = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [allowAutoRedirect, setAllowAutoRedirect] = useState(true);

  if (data?.accessToken && allowAutoRedirect) {
    navigate({ to: "/" });
    return null;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Validações
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!acceptTerms) {
      setError("Você deve aceitar os Termos de Uso e Política de Privacidade para continuar");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const payload: RegisterRequest = {
      name,
      email,
      password,
      role,
      ...(mfaEnabled ? { mfaEnabled: true } : {}),
    };

    register.mutate(payload, {
      onSuccess: (response) => {
        if (payload.mfaEnabled && response.mfaSetupSecret) {
          setAllowAutoRedirect(false);
          setMfaSecret(response.mfaSetupSecret);
        } else {
          navigate({ to: "/" });
        }
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || "Erro ao criar conta. Tente novamente.");
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário de cadastro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="w-full max-w-md">
          {mfaSecret && (
            <div className="mb-6 bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-600 mb-2">Configuração MFA</h3>
              <p className="text-sm text-gray-600 mb-3">
                Escaneie o código abaixo no seu autenticador TOTP ou utilize a chave para concluir a configuração de múltiplos
                fatores.
              </p>
              <div className="bg-gray-100 rounded-md px-3 py-2 font-mono text-sm text-gray-800 break-all border border-gray-200">
                {mfaSecret}
              </div>
              <button
                type="button"
                onClick={() => {
                  setAllowAutoRedirect(true);
                  navigate({ to: "/" });
                }}
                className="mt-4 w-full bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Acessar painel
              </button>
            </div>
          )}

          {/* Logo para telas menores */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">GoMech</h1>
            <p className="text-gray-600">Sistema de Gestão Automotiva</p>
          </div>

          {/* Cabeçalho do formulário */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Comece sua jornada!</h2>
            <p className="text-gray-600">Crie sua conta e gerencie sua oficina</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Exibição de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Campo de nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                required
              />
            </div>

            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                required
              />
            </div>

            {/* Campos de senha em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Perfil de acesso
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 bg-white"
                >
                  <option value="USER">Usuário padrão</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex items-center md:items-end gap-3 p-4 border border-gray-200 rounded-lg bg-white">
                <input
                  id="mfaEnabled"
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(event) => setMfaEnabled(event.target.checked)}
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="mfaEnabled" className="text-sm text-gray-700 cursor-pointer">
                  Ativar MFA (recomendado para administradores)
                </label>
              </div>
            </div>

            {mfaEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Como funciona?</p>
                <p>
                  Ative esta opção para exigir um código temporário gerado por aplicativo autenticador (Google Authenticator,
                  Authy, etc.) em cada login.
                </p>
              </div>
            )}

            {/* Informações de segurança */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">🔒</span>
                <div className="text-sm text-orange-700">
                  <p className="font-medium mb-1">Sua conta será protegida com:</p>
                  <ul className="text-xs space-y-1 text-orange-600">
                    <li>• Criptografia de dados</li>
                    <li>• Autenticação segura</li>
                    <li>• Backup automático</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aceite dos Termos e Políticas */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="acceptTerms" className="font-medium text-gray-900 cursor-pointer">
                    Aceito os termos e políticas
                  </label>
                  <p className="text-gray-600 mt-1">
                    Li e concordo com os{" "}
                    <Link 
                      to={"/terms-of-service"} 
                      className="text-orange-600 hover:text-orange-700 font-semibold underline"
                      target="_blank"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link 
                      to={"/privacy-policy"} 
                      className="text-orange-600 hover:text-orange-700 font-semibold underline"
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de cadastro */}
            <button
              type="submit"
              disabled={register.isPending || !acceptTerms}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {register.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Criar conta
                </>
              )}
            </button>

            {/* Link para login */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Benefícios e imagem */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/login_bg.webp)' }}
      >
        {/* Overlay com gradiente laranja */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-800"></div>
        
        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Junte-se a GoMech</h1>
            <p className="text-xl text-orange-100 mb-8">
              Milhares de oficinas já confiam em nós
            </p>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-200">500+</div>
                <div className="text-sm text-orange-100">Oficinas ativas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-200">50k+</div>
                <div className="text-sm text-orange-100">Veículos gerenciados</div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-4 text-orange-100">
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">⚡</span>
                <span>Setup rápido em menos de 5 minutos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">🛡️</span>
                <span>Suporte técnico especializado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">📈</span>
                <span>Relatórios e análises avançadas</span>
              </div>
            </div>

            {/* Depoimento */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-white border-opacity-20">
              <p className="text-sm italic text-[#242424] mb-2">
                "A GoMech revolucionou nossa oficina. Agora conseguimos atender 3x mais clientes!"
              </p>
              <div className="text-xs text-[#242424]">
                — Carlos Silva, Oficina Silva & Cia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;