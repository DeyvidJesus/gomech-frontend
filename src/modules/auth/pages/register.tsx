import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { organizationApi } from "../../organization/services/api";
import type { OrganizationCreateRequest } from "../../organization/types/organization";

const STEPS = [
  { id: 1, title: "Informações Básicas", icon: "🏢" },
  { id: 2, title: "Contato", icon: "📞" },
  { id: 3, title: "Documentação", icon: "📄" },
  { id: 4, title: "Revisão", icon: "✓" },
] as const;

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrganization, setCreatedOrganization] = useState<any>(null);

  const [formData, setFormData] = useState<OrganizationCreateRequest>({
    name: "",
    slug: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    document: "",
  });

  const createOrganization = useMutation({
    mutationFn: (data: OrganizationCreateRequest) =>
      organizationApi.create(data),
    onSuccess: (response) => {
      setCreatedOrganization(response.data);
      setIsSuccess(true);
      setCurrentStep(4);
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
          "Erro ao cadastrar organização. Tente novamente."
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("O nome da organização é obrigatório");
          return false;
        }
        return true;

      case 2:
        if (!formData.contactEmail?.trim()) {
          setError("O email de contato é obrigatório");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
          setError("Por favor, insira um email válido");
          return false;
        }
        return true;

      case 3:
        // Documentação é opcional, mas se preenchida, deve ser válida
        if (formData.document && formData.document.trim().length < 11) {
          setError("O documento deve ter pelo menos 11 caracteres");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      createOrganization.mutate(formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nome da Organização <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ex: Oficina Silva & Cia"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Slug (URL amigável)
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="oficina-silva-cia"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Gerado automaticamente a partir do nome. Usado para identificar
                sua organização na URL.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Descreva sua organização, serviços oferecidos, etc."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email de Contato <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="contato@oficina.com"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Telefone de Contato
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Endereço
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Rua, número, bairro, cidade - Estado"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="document"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                CNPJ/CPF
              </label>
              <input
                id="document"
                name="document"
                type="text"
                placeholder="00.000.000/0000-00 ou 000.000.000-00"
                value={formData.document}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Documento é opcional, mas recomendado para identificação
                oficial.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">ℹ️</span>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Próximos passos</p>
                  <p>
                    Após o cadastro, um administrador precisará aprovar sua
                    organização. Você receberá um email quando isso acontecer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        if (isSuccess && createdOrganization) {
          return (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Organização cadastrada com sucesso!
                </h3>
                <p className="text-gray-600 mb-4">
                  Sua organização <strong>{createdOrganization.name}</strong>{" "}
                  foi cadastrada e está aguardando aprovação.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-700">
                  <p className="font-medium mb-1">📧 O que acontece agora?</p>
                  <p>
                    Você receberá um email quando sua organização for aprovada
                    por um administrador. Após a aprovação, você poderá fazer
                    login e começar a usar o sistema.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login" })}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Ir para Login
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-5">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Revisão dos Dados
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Nome:</span>
                  <p className="text-gray-600">{formData.name || "-"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Slug:</span>
                  <p className="text-gray-600">{formData.slug || "-"}</p>
                </div>
                {formData.description && (
                  <div>
                    <span className="font-semibold text-gray-700">
                      Descrição:
                    </span>
                    <p className="text-gray-600">{formData.description}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-600">
                    {formData.contactEmail || "-"}
                  </p>
                </div>
                {formData.contactPhone && (
                  <div>
                    <span className="font-semibold text-gray-700">Telefone:</span>
                    <p className="text-gray-600">{formData.contactPhone}</p>
                  </div>
                )}
                {formData.address && (
                  <div>
                    <span className="font-semibold text-gray-700">Endereço:</span>
                    <p className="text-gray-600">{formData.address}</p>
                  </div>
                )}
                {formData.document && (
                  <div>
                    <span className="font-semibold text-gray-700">Documento:</span>
                    <p className="text-gray-600">{formData.document}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-orange-600 text-xl">🔒</span>
                <div className="text-sm text-orange-700">
                  <p className="font-medium mb-1">Seus dados estão seguros</p>
                  <p>
                    Todas as informações fornecidas serão tratadas com
                    confidencialidade e segurança.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="w-full max-w-2xl">
          {/* Logo para telas menores */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">GoMech</h1>
            <p className="text-gray-600">Sistema de Gestão Automotiva</p>
          </div>

          {/* Indicador de etapas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step.id
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? "✓" : step.icon}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        currentStep >= step.id
                          ? "text-orange-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${
                        currentStep > step.id
                          ? "bg-orange-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cabeçalho do formulário */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">
                {STEPS[currentStep - 1]?.icon || "🏢"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {STEPS[currentStep - 1]?.title || "Cadastro de Organização"}
            </h2>
            <p className="text-gray-600">
              {currentStep === 1 && "Vamos começar com as informações básicas"}
              {currentStep === 2 && "Como podemos entrar em contato?"}
              {currentStep === 3 && "Informações de documentação"}
              {currentStep === 4 && "Revise os dados antes de finalizar"}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exibição de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-red-700 text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Conteúdo da etapa */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              {renderStepContent()}
            </div>

            {/* Botões de navegação */}
            {!isSuccess && (
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Voltar
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    Próximo
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createOrganization.isPending}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {createOrganization.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Finalizar Cadastro
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Link para login */}
            {!isSuccess && (
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Já tem uma organização cadastrada?{" "}
                  <Link
                    to="/login"
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Lado direito - Benefícios e imagem */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url(/login_bg.webp)" }}
      >
        {/* Overlay com gradiente laranja */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-800"></div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏢</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Cadastre sua Organização</h1>
            <p className="text-xl text-orange-100 mb-8">
              Gerencie sua oficina de forma profissional
            </p>

            {/* Benefícios */}
            <div className="space-y-4 text-orange-100 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">⚡</span>
                <span>Cadastro rápido e simples</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">🔧</span>
                <span>Gestão completa de clientes e veículos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">📊</span>
                <span>Controle de ordens de serviço</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-xl">📈</span>
                <span>Relatórios e análises avançadas</span>
              </div>
            </div>

            {/* Depoimento */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-white border-opacity-20">
              <p className="text-sm italic text-[#242424] mb-2">
                "O cadastro foi super simples e em poucos minutos já estávamos
                usando o sistema!"
              </p>
              <div className="text-xs text-[#242424]">
                — Maria Santos, Oficina Santos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
