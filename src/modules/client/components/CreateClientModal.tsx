import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";

interface CreateClientModalProps {
  onClose: () => void;
}

export function CreateClientModal({ onClose }: CreateClientModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    document: '',
    birthDate: '',
    observations: ''
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data as Client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || "Erro ao criar cliente. Tente novamente.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!form.name?.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!form.email?.trim()) {
      setError("Email é obrigatório");
      return;
    }
    
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orangeWheel-500 to-orangeWheel-600 p-4 sm:p-6 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-white">👤</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Novo Cliente</h2>
                <p className="text-orange-100 text-sm">Cadastrar novo cliente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              title="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
              placeholder="Digite o nome completo do cliente"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
              placeholder="exemplo@email.com"
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              name="address"
              value={form.address || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Endereço completo do cliente"
            />
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Documento (CPF/CNPJ)
            </label>
            <input
              type="text"
              name="document"
              value={form.document || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
              placeholder="000.000.000-00"
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observations"
              value={form.observations || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Observações adicionais sobre o cliente"
            />
          </div>

          {/* Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">💡</span>
              <div className="text-orange-800 text-sm">
                <p className="font-medium mb-1">Dica:</p>
                <p>Preencha pelo menos o nome e email. Os demais campos (telefone, endereço, documento, data de nascimento e observações) são opcionais e podem ser adicionados posteriormente.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors order-2 sm:order-1"
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando...
                </div>
              ) : (
                'Criar Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
