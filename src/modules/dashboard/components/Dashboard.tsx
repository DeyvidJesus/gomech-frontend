import ProtectedRoute from "../../auth/components/ProtectedRoute";
import { useAuth } from "../../auth/hooks/useAuth";
import { useRole } from "../../auth/hooks/useRole";

export default function Dashboard() {
  const { data } = useAuth();
  const { canCreate, canEdit, canDelete } = useRole();

  const { user } = data || {};

  return (
    // <ProtectedRoute>
      <div className="p-8 bg-gray-50 h-[80vh] rounded-lg">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-orange-600 text-3xl mb-2 font-bold">
            Bem-vindo ao GoMech, {user?.email}!
          </h1>
          <p className="text-gray-500 text-lg">
            Aqui você pode gerenciar seus clientes, veículos e ordens de serviço.
          </p>

          {/* Informações sobre o usuário e suas permissões */}
          <div className={`
          mt-5 p-4 rounded-lg border-2
          ${user?.role === 'ADMIN'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
            }
        `}>
            <h3 className="m-0 mb-2 text-gray-800 font-semibold">
              {user?.role === 'ADMIN' ? '🛡️ Administrador' : '👤 Usuário'}
            </h3>
            <p className="m-0 text-sm text-gray-600">
              {user?.role === 'ADMIN'
                ? 'Você tem acesso completo ao sistema com permissões de criação, edição e exclusão.'
                : 'Você tem acesso de visualização aos dados do sistema.'
              }
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0 mb-2">
              Total de Clientes
            </h3>
            <div className="text-orange-600 text-3xl font-bold m-0">
              0
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0 mb-2">
              Veículos Cadastrados
            </h3>
            <div className="text-orange-600 text-3xl font-bold m-0">
              0
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0 mb-2">
              Ordens de Serviço
            </h3>
            <div className="text-orange-600 text-3xl font-bold m-0">
              0
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0 mb-2">
              Serviços Concluídos
            </h3>
            <div className="text-orange-600 text-3xl font-bold m-0">
              0
            </div>
          </div>
        </div>

        {/* Painel de Permissões */}
        <div className="mt-8 p-5 bg-white rounded-lg shadow-sm">
          <h2 className="text-gray-800 mb-5 text-xl font-semibold">📋 Suas Permissões</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {canCreate ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canCreate ? 'text-green-500' : 'text-red-500'}`}>
                Criar
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {canEdit ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canEdit ? 'text-green-500' : 'text-red-500'}`}>
                Editar
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {canDelete ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canDelete ? 'text-green-500' : 'text-red-500'}`}>
                Excluir
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                ✅
              </div>
              <div className="text-sm text-green-500">
                Visualizar
              </div>
            </div>
          </div>
        </div>
      </div>
    // </ProtectedRoute>
  );
} 
