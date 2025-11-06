import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function ClientImportModal({ isOpen, onClose, onUpload }: ClientImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    const allowedExtensions = [".csv", ".xlsx"];
    if (!allowedExtensions.some(ext => selected.name.toLowerCase().endsWith(ext))) {
      setError("Escolha arquivos CSV ou XLSX para importação");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione um arquivo para importar");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (uploadError: any) {
      setError(uploadError?.response?.data?.message || "Não foi possível importar os clientes");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar clientes"
      description="Faça upload do arquivo gerado a partir do modelo disponível no backend."
      size="md"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!file}
            leftIcon={!isUploading && "⬆️"}
          >
            {isUploading ? "Importando..." : "Importar"}
          </Button>
        </div>
      }
    >
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Precisa de ajuda para importar clientes?
            </p>
            <p className="text-sm text-blue-700 mb-3">
              Acesse nossa página de ajuda para baixar templates e ver instruções detalhadas.
            </p>
            <a
              href="https://gomech.com/ajuda/importacao"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              📋 Ver instruções e baixar templates
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <input
          type="file"
          accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          id="client-import"
          onChange={handleFileChange}
        />
        <label
          htmlFor="client-import"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-orangeWheel-600 shadow-sm transition-colors hover:bg-orangeWheel-50"
        >
          📁 Selecionar arquivo
        </label>
        {file ? (
          <p className="mt-2 text-sm text-gray-600">
            Arquivo selecionado: <span className="font-medium">{file.name}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Nenhum arquivo selecionado</p>
        )}
      </div>
    </Modal>
  );
}
