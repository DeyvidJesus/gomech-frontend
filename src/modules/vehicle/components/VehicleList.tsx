import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";
import { useState } from "react";
import { EditVehicleModal } from "./EditVehicleModal";
import { VehicleDetailsModal } from "./VehicleDetailsModal";
import { AddVehicleModal } from "./AddVehicleModal";
import { useNavigate } from "@tanstack/react-router";

export function VehicleList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const handleAdd = () => {
    setShowAdd(true);
  };

  const handleCloseAdd = () => {
    setShowAdd(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEdit(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetails(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (window.confirm(`Deseja realmente deletar o veículo ${vehicle.plate}?`)) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedVehicle(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedVehicle(null);
  };


  if (isLoading) return <div className="text-center text-lg text-primary mt-8">Carregando veículos...</div>;
  if (error) return <div className="text-center text-lg text-red-600 mt-8">Erro ao carregar veículos.</div>;
  if (!data || data.length === 0) return <div className="text-center text-lg text-gray-500 mt-8">Nenhum veículo encontrado.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-onyx-100 dark:text-onyx-900">Lista de Veículos</h2>
        <button
          onClick={handleAdd}
          className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
        >
          Adicionar Veículo
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-onyx-200">
          <thead>
            <tr className="bg-onyx-100 dark:bg-onyx-400 text-white">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Placa</th>
              <th className="px-4 py-2 text-left">Marca</th>
              <th className="px-4 py-2 text-left">Modelo</th>
              <th className="px-4 py-2 text-left">Ano</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((vehicle: Vehicle) => (
              <tr key={vehicle.id} className="border-b border-onyx-200 hover:bg-orangeWheel-100/30 transition text-white">
                <td className="px-4 py-2">{vehicle.id}</td>
                <td className="px-4 py-2">{vehicle.plate}</td>
                <td className="px-4 py-2">{vehicle.brand}</td>
                <td className="px-4 py-2">{vehicle.model}</td>
                <td className="px-4 py-2">{vehicle.year}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleView(vehicle)}
                    className="bg-primary hover:bg-orangeWheel-500 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Ver</button>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="bg-onyx-400 hover:bg-onyx-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Editar</button>
                  <button
                    onClick={() => handleDelete(vehicle)}
                    className="bg-persimmon-500 hover:bg-persimmon-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modais de edição e detalhes */}
      {showAdd && (
        <AddVehicleModal onClose={handleCloseAdd} />
      )}
      {showDetails && selectedVehicle && (
        <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseDetails} />
      )}
      {showEdit && selectedVehicle && (
        <EditVehicleModal vehicle={selectedVehicle} onClose={handleCloseEdit} />
      )}
    </div>
  );
}
