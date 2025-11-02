import { useState } from "react";

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function ClientImportModal({ isOpen, onClose, onUpload }: ClientImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) {
    return null;
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Importar clientes</h2>
            <p className="text-sm text-gray-500">Faça upload do arquivo gerado a partir do modelo disponível no backend.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

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

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isUploading || !file}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importando...
              </>
            ) : (
              <>Importar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
