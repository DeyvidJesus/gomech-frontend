import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { blobToBase64, formatDuration } from '../../utils/audioUtils';
import { aiService } from '../../services/api';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscription, disabled }: VoiceButtonProps) {
  const { 
    isRecording, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    clearRecording,
    error: recordError 
  } = useVoiceRecorder();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Timer de gravação
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      setRecordingDuration(0);
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Processar áudio quando gravação termina
  useEffect(() => {
    if (audioBlob && !isRecording) {
      processAudio();
    }
  }, [audioBlob, isRecording]);

  const processAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Verificar tamanho do áudio
      const sizeInMB = audioBlob.size / (1024 * 1024);
      if (sizeInMB > 25) {
        setError('Áudio muito grande (máx 25MB)');
        return;
      }
      
      // Converter para base64 (otimizado)
      const base64Audio = await blobToBase64(audioBlob);
      
      // Transcrever com timeout
      const transcriptionPromise = aiService.voice.transcribe(
        base64Audio, 
        'whisper', 
        'pt'
      );
      
      // Timeout de 30 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: processamento demorou muito')), 30000)
      );
      
      const transcriptionResult = await Promise.race([
        transcriptionPromise, 
        timeoutPromise
      ]) as any;
      
      if (transcriptionResult.data.status === 'success' && transcriptionResult.data.transcription) {
        const transcription = transcriptionResult.data.transcription;
        
        // Passar transcrição para o callback
        onTranscription(transcription);
        
        // NÃO reproduzir confirmação se TTS estiver ativo
        // A resposta completa da IA será falada automaticamente
      } else {
        setError('Não foi possível transcrever o áudio');
      }
      
    } catch (err: any) {
      console.error('Erro ao processar áudio:', err);
      if (err.message.includes('Timeout')) {
        setError('Processamento demorou muito. Tente gravar um áudio mais curto.');
      } else {
        setError('Erro ao processar comando de voz');
      }
    } finally {
      setIsProcessing(false);
      clearRecording();
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const displayError = recordError || error;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          relative p-3 rounded-full transition-all duration-200
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
          text-white shadow-lg
        `}
        title={isRecording ? 'Clique para parar' : 'Clique para gravar'}
      >
        {isProcessing ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={24} />
        ) : (
          <Mic size={24} />
        )}
        
        {/* Indicador de gravação */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
        )}
      </button>
      
      {/* Duração da gravação */}
      {isRecording && (
        <span className="text-sm text-gray-600 font-mono">
          {formatDuration(recordingDuration)}
        </span>
      )}
      
      {/* Mensagem de processamento */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-blue-600 font-medium">
            Transcrevendo...
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
      
      {/* Erro */}
      {displayError && (
        <span className="text-xs text-red-500 max-w-[150px] text-center">
          {displayError}
        </span>
      )}
    </div>
  );
}

