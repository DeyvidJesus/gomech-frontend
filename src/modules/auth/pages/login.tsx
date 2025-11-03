import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { useLogin } from "../hooks/useLogin";
import { useAuth } from "../hooks/useAuth";
import type { LoginRequest } from "../types/user";

export default function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const { data }: any = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  if (data?.accessToken) {
    navigate({ to: "/" });
    return null;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (isMfaRequired && !mfaCode.trim()) {
      setError("Informe o código de verificação");
      return;
    }

    const payload: LoginRequest = {
      email,
      password,
      ...(isMfaRequired && mfaCode.trim() ? { mfaCode: mfaCode.trim() } : {}),
    };

    login.mutate(payload, {
      onSuccess: () => {
        setMfaCode("");
        setIsMfaRequired(false);
        navigate({ to: "/" });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.";
        setError(message);

        if (err?.response?.status === 401 && err?.response?.data?.mfaRequired) {
          setIsMfaRequired(true);
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem de fundo */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/login_bg.webp)' }}
      >
        {/* Overlay escuro para melhor contraste */}
        <div className="absolute inset-0 bg-[#242424cb]"></div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">GoMech</h1>
            <p className="text-xl text-gray-200 mb-8">
              Sistema de Gestão Automotiva
            </p>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-orange-400 text-xl">🔧</span>
                <span>Gestão completa de clientes e veículos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-400 text-xl">📊</span>
                <span>Controle de ordens de serviço</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-400 text-xl">⚡</span>
                <span>Interface moderna e intuitiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para telas menores */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">GoMech</h1>
            <p className="text-gray-600">Sistema de Gestão Automotiva</p>
          </div>

          {/* Cabeçalho do formulário */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600">Faça login para acessar sua conta</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exibição de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {/* Campo de senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {/* Campo MFA */}
            {isMfaRequired && (
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Código MFA
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="Informe o código do autenticador"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o código gerado pelo seu aplicativo autenticador.
                </p>
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {login.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <span>🔐</span>
                  Entrar
                </>
              )}
            </button>

            {/* Link para registro */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  to="/register"
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Problemas para acessar?{" "}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                  Fale conosco
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
