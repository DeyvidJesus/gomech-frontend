import { useState } from "react";

interface PartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function PartImportModal({ isOpen, onClose, onUpload }: PartImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Importar catálogo</h2>
            <p className="text-sm text-gray-500">Faça upload de um arquivo CSV ou XLSX com os dados das peças.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

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
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importando...
              </>
            ) : (
              <>⬆️ Importar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
