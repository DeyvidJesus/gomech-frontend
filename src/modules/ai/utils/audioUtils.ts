/**
 * Utilitários para manipulação de áudio
 */

/**
 * Converte Blob de áudio para Base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converte Base64 para Blob de áudio
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Reproduz áudio a partir de Base64
 */
export function playAudioFromBase64(base64: string, mimeType: string = 'audio/mpeg'): Promise<void> {
  return new Promise((resolve, reject) => {
    const blob = base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    
    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    
    audio.play().catch(reject);
  });
}

/**
 * Formata duração em segundos para MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

