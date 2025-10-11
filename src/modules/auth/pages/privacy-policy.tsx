import { Link } from "@tanstack/react-router";

function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
            <p className="text-gray-600">GoMech Tecnologia LTDA</p>
            <p className="text-sm text-gray-500 mt-2">Última atualização: 10 de outubro de 2025</p>
          </div>

          <div className="prose max-w-none space-y-6">
            {/* Informações Gerais */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-orange-800">
                <p><strong>Controlador:</strong> GoMech Tecnologia LTDA</p>
                <p><strong>Domínio oficial:</strong> <a href="https://go-mech.com" className="text-orange-600 underline">https://go-mech.com</a></p>
                <p><strong>Contato para assuntos de privacidade:</strong> <a href="mailto:privacidade@go-mech.com" className="text-orange-600 underline">privacidade@go-mech.com</a></p>
              </div>
            </div>

            {/* Seção 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Disposições Gerais</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A GoMech Tecnologia LTDA ("GoMech", "nós", "nosso" ou "empresa") adota o presente instrumento para informar de maneira transparente e objetiva como ocorre o tratamento de dados pessoais de seus usuários e clientes, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e demais regulamentações aplicáveis.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Esta Política se aplica a todos os usuários que acessam, cadastram-se ou utilizam a plataforma GoMech, disponível no endereço <a href="https://go-mech.com" className="text-orange-600 underline">https://go-mech.com</a>.
              </p>
            </section>

            {/* Seção 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Durante o uso da plataforma, a GoMech poderá coletar as seguintes categorias de dados:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">2.1. Dados de Cadastro</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Nome completo;</li>
                    <li>Endereço de e-mail;</li>
                    <li>Senha de acesso;</li>
                    <li>Telefone de contato;</li>
                    <li>CPF e endereço (quando aplicável).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">2.2. Dados Operacionais (inseridos pelo usuário)</h3>
                  <p className="text-gray-700 ml-4">
                    Informações de clientes, veículos e ordens de serviço, incluindo dados como CPF, endereço, placa, chassi e quilometragem.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">2.3. Dados de Navegação</h3>
                  <p className="text-gray-700 ml-4">
                    Endereço IP, data e hora de acesso, navegador utilizado, dispositivo e cookies de sessão.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">2.4. Dados de Terceiros</h3>
                  <p className="text-gray-700 ml-4">
                    Dados provenientes de integrações externas (como Google ou Facebook) mediante consentimento expresso do titular.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidades do Tratamento</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Os dados pessoais são tratados para as seguintes finalidades:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Permitir o acesso e uso das funcionalidades da plataforma;</li>
                <li>Executar contratos firmados entre a GoMech e seus clientes;</li>
                <li>Cumprir obrigações legais e regulatórias;</li>
                <li>Realizar comunicações relevantes sobre uso, atualizações e segurança;</li>
                <li>Assegurar integridade e rastreabilidade de registros operacionais;</li>
                <li>Garantir a segurança das informações e prevenir fraudes.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Nenhum dado será utilizado para fins distintos daqueles informados nesta Política, sem prévio consentimento do titular.
              </p>
            </section>

            {/* Seção 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal para Tratamento</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O tratamento de dados pessoais realizado pela GoMech se fundamenta nas seguintes bases legais da LGPD:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Execução de contrato (art. 7º, V);</li>
                <li>Cumprimento de obrigação legal ou regulatória (art. 7º, II);</li>
                <li>Consentimento do titular (art. 7º, I);</li>
                <li>Legítimo interesse do controlador, respeitados os direitos do titular (art. 7º, IX).</li>
              </ul>
            </section>

            {/* Seção 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Armazenamento e Segurança dos Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A GoMech utiliza servidores em nuvem de alta segurança e adota medidas técnicas e organizacionais adequadas, incluindo:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Criptografia AES-256 para campos sensíveis (como senha e CPF);</li>
                <li>Controle de acesso baseado em papéis;</li>
                <li>Logs de auditoria;</li>
                <li>Backups automáticos com verificação de integridade;</li>
                <li>Monitoramento e rastreabilidade de incidentes de segurança.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Os dados são armazenados pelo prazo necessário para o cumprimento das finalidades ou conforme obrigações legais e contratuais.
              </p>
            </section>

            {/* Seção 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Direitos do Titular dos Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nos termos da LGPD, o titular dos dados poderá, a qualquer momento e mediante solicitação, exercer os seguintes direitos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Confirmação da existência de tratamento;</li>
                <li>Acesso e portabilidade dos dados;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                <li>Revogação do consentimento;</li>
                <li>Eliminação dos dados pessoais tratados com base no consentimento;</li>
                <li>Reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Solicitações podem ser enviadas ao e-mail <a href="mailto:privacidade@go-mech.com" className="text-orange-600 underline">privacidade@go-mech.com</a>, mediante autenticação de identidade.
              </p>
            </section>

            {/* Seção 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Compartilhamento de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Os dados poderão ser compartilhados apenas quando:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Necessário à execução de serviços contratados;</li>
                <li>Exigido por autoridade judicial ou administrativa;</li>
                <li>Houver consentimento expresso do titular;</li>
                <li>For indispensável para o cumprimento de obrigações legais.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4 font-medium">
                A GoMech não comercializa dados pessoais sob nenhuma circunstância.
              </p>
            </section>

            {/* Seção 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Retenção e Exclusão de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Os dados serão mantidos apenas pelo período necessário ao cumprimento de suas finalidades.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Encerrado o relacionamento contratual ou mediante solicitação, o usuário poderá requerer a exclusão definitiva de seus dados, respeitados prazos legais de retenção e obrigações regulatórias.
              </p>
            </section>

            {/* Seção 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Encarregado de Dados (DPO)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O Encarregado pelo Tratamento de Dados Pessoais (DPO) da GoMech é o gestor responsável pelo projeto e pela conformidade com a LGPD.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Contato:</strong> <a href="mailto:privacidade@go-mech.com" className="text-orange-600 underline">privacidade@go-mech.com</a>
              </p>
            </section>

            {/* Seção 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações da Política</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A presente Política de Privacidade poderá ser atualizada periodicamente. Recomendamos que o usuário consulte esta página regularmente.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Alterações relevantes serão comunicadas por meio dos canais oficiais da plataforma.
              </p>
            </section>

            {/* Seção 11 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Foro e Legislação Aplicável</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Esta Política é regida pelas leis da República Federativa do Brasil.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Fica eleito o foro da Comarca de São Paulo/SP, com renúncia de qualquer outro, para dirimir eventuais controvérsias decorrentes desta Política.
              </p>
            </section>
          </div>

          {/* Footer da página */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
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
  );
}

export default PrivacyPolicy;
