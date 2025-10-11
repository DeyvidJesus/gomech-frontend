import { Link } from "@tanstack/react-router";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="text-orange-600 hover:text-orange-700 flex items-center gap-2 font-medium"
              >
                ← Voltar ao cadastro
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-600">GoMech</h1>
              <p className="text-sm text-gray-600">Sistema de Gestão Automotiva</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
            <p className="text-gray-600">GoMech Tecnologia LTDA</p>
            <p className="text-sm text-gray-500 mt-2">Última atualização: 10 de outubro de 2025</p>
            <p className="text-sm text-gray-500">Domínio oficial: <a href="https://go-mech.com" className="text-orange-600 underline">https://go-mech.com</a></p>
          </div>

          <div className="prose max-w-none space-y-6">
            {/* Seção 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ao acessar e utilizar a plataforma GoMech, o usuário declara estar ciente e de acordo com os presentes Termos de Uso e com a Política de Privacidade, comprometendo-se a cumpri-los integralmente.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Caso não concorde com qualquer disposição, o usuário deve interromper imediatamente o uso da plataforma.
              </p>
            </section>

            {/* Seção 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Objeto</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A GoMech é uma plataforma SaaS (Software as a Service) voltada à gestão de oficinas mecânicas, permitindo o controle de clientes, veículos, ordens de serviço e aspectos financeiros relacionados.
              </p>
              <p className="text-gray-700 leading-relaxed">
                O acesso à plataforma é concedido mediante cadastro e autenticação segura, podendo estar vinculado a planos gratuitos ou pagos.
              </p>
            </section>

            {/* Seção 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Responsabilidade do Usuário</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>O usuário declara que todas as informações fornecidas são verdadeiras, completas e atualizadas.</li>
                <li>É de responsabilidade do usuário manter a confidencialidade de suas credenciais de acesso.</li>
                <li>O compartilhamento de login é expressamente proibido.</li>
                <li>Qualquer atividade realizada com o login do usuário será presumida como de sua autoria.</li>
                <li>A GoMech poderá suspender ou excluir contas que violem estes Termos, sem prejuízo de medidas legais cabíveis.</li>
              </ul>
            </section>

            {/* Seção 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Uso Autorizado da Plataforma</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O usuário se compromete a utilizar a plataforma exclusivamente para fins legítimos e de acordo com a legislação vigente, sendo expressamente proibido:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Tentar acessar áreas restritas sem autorização;</li>
                <li>Copiar, modificar, distribuir ou realizar engenharia reversa do sistema;</li>
                <li>Utilizar o serviço para atividades ilícitas ou contrárias à boa-fé;</li>
                <li>Inserir dados falsos ou de terceiros sem consentimento.</li>
              </ul>
            </section>

            {/* Seção 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Direitos de Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todo o conteúdo, layout, código-fonte, banco de dados, logotipos e design da plataforma são de propriedade exclusiva da GoMech Tecnologia LTDA, sendo vedada qualquer utilização sem autorização expressa.
              </p>
              <p className="text-gray-700 leading-relaxed">
                A violação de direitos de propriedade intelectual sujeitará o infrator às penalidades civis e criminais previstas em lei.
              </p>
            </section>

            {/* Seção 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Disponibilidade e Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A GoMech emprega os melhores esforços para manter a disponibilidade contínua da plataforma.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                No entanto, não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Interrupções decorrentes de manutenção programada;</li>
                <li>Falhas de conexão de internet ou de terceiros;</li>
                <li>Perdas indiretas, lucros cessantes ou danos emergentes.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                A GoMech não garante a ausência de erros ou falhas eventuais, mas compromete-se a corrigi-los prontamente ao serem identificados.
              </p>
            </section>

            {/* Seção 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Planos, Pagamentos e Cancelamento</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nos casos de assinatura de planos pagos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>O usuário será informado previamente sobre valores, periodicidade e condições;</li>
                <li>A falta de pagamento poderá resultar na suspensão do acesso;</li>
                <li>O cancelamento poderá ser solicitado a qualquer momento, respeitando o ciclo vigente de cobrança.</li>
              </ul>
            </section>

            {/* Seção 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Privacidade e Proteção de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O tratamento de dados pessoais segue rigorosamente os princípios e regras estabelecidos na Política de Privacidade da GoMech, que faz parte integrante destes Termos e pode ser acessada em:
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">
                  👉 <Link to="/privacy-policy" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </section>

            {/* Seção 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alterações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                A GoMech poderá revisar estes Termos de Uso a qualquer momento, mediante atualização em seu site. O uso contínuo da plataforma após a publicação das alterações implica concordância com a nova versão.
              </p>
            </section>

            {/* Seção 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Foro e Legislação Aplicável</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Os presentes Termos são regidos pela legislação brasileira.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Fica eleito o foro da Comarca de São Paulo/SP, com renúncia a qualquer outro, para dirimir controvérsias oriundas de sua interpretação ou execução.
              </p>
            </section>
          </div>

          {/* Footer da página */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/privacy-policy"
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                Ver Política de Privacidade
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                ← Voltar ao cadastro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
