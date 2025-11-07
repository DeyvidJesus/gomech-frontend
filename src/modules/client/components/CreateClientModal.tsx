import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import type { Client } from "../types/client";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
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
      // Invalidar todas as queries relacionadas a clientes
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      queryClient.invalidateQueries({ queryKey: ["clients-stats"] });
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Cliente"
      description="Cadastrar novo cliente no sistema."
      size="md"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} type="button" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-client-form"
            isLoading={mutation.isPending}
            leftIcon={!mutation.isPending && "✅"}
          >
            {mutation.isPending ? "Criando..." : "Criar Cliente"}
          </Button>
        </div>
      }
    >
      <form id="create-client-form" onSubmit={handleSubmit} className="space-y-4">
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
          <div className="bg-orangeWheel-50 border border-orangeWheel-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-orangeWheel-600 mt-0.5">💡</span>
              <div className="text-orangeWheel-800 text-sm">
                <p className="font-medium mb-1">Dica:</p>
                <p>Preencha pelo menos o nome e email. Os demais campos (telefone, endereço, documento, data de nascimento e observações) são opcionais e podem ser adicionados posteriormente.</p>
              </div>
            </div>
          </div>
        </form>
      </Modal>
  );
}
