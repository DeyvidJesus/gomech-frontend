import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";

interface PartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function PartImportModal({ isOpen, onClose, onUpload }: PartImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validExtensions = [".csv", ".xlsx"];
    const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidExtension) {
      setError("Formato não suportado. Utilize arquivos CSV ou XLSX");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Selecione um arquivo para importar");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile);
      onClose();
    } catch (uploadError: any) {
      setError(uploadError?.response?.data?.message || "Não foi possível importar as peças");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar catálogo"
      description="Faça upload de um arquivo CSV ou XLSX com os dados das peças."
      size="md"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!selectedFile}
            leftIcon={!isUploading && "⬆️"}
          >
            {isUploading ? "Importando..." : "Importar"}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <input
            type="file"
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            id="parts-import-input"
            onChange={handleFileChange}
          />
          <label
            htmlFor="parts-import-input"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-orangeWheel-600 shadow-sm transition-colors hover:bg-orangeWheel-50"
          >
            📁 Selecionar arquivo
          </label>
          {selectedFile ? (
            <p className="mt-2 text-sm text-gray-600">
              Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Nenhum arquivo selecionado</p>
          )}
        </div>

        <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Utilize o modelo disponível no backend para manter o padrão de colunas e garanta que o cabeçalho esteja na primeira linha.
        </div>
      </div>
    </Modal>
  );
}
