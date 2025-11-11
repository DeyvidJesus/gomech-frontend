import { useState } from 'react';
import { Volume2, ChevronDown, Check } from 'lucide-react';

export type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface VoiceSelectorProps {
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  disabled?: boolean;
}

const VOICES: { value: VoiceOption; label: string; description: string }[] = [
  { value: 'nova', label: 'Nova', description: 'Feminina (recomendada)' },
  { value: 'shimmer', label: 'Shimmer', description: 'Feminina suave' },
  { value: 'alloy', label: 'Alloy', description: 'Neutro' },
  { value: 'echo', label: 'Echo', description: 'Masculina' },
  { value: 'onyx', label: 'Onyx', description: 'Masculina grave' },
  { value: 'fable', label: 'Fable', description: 'Britânico' },
];

export default function VoiceSelector({ selectedVoice, onVoiceChange, disabled }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVoiceData = VOICES.find(v => v.value === selectedVoice) || VOICES[0];

  const handleSelect = (voice: VoiceOption) => {
    onVoiceChange(voice);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-shrink-0">
      {/* Botão Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200
          bg-white border border-gray-300 hover:border-blue-400 whitespace-nowrap
          text-xs sm:text-sm sm:gap-2 sm:px-3 sm:py-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
        `}
        title="Selecionar voz"
      >
        <Volume2 size={16} className="text-blue-600 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
        <span className="text-xs font-medium text-gray-700 hidden xs:inline sm:text-sm">
          {selectedVoiceData.label}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform flex-shrink-0 sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Escolha a Voz da IA
              </p>
            </div>
            
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              {VOICES.map((voice) => (
                <button
                  key={voice.value}
                  onClick={() => handleSelect(voice.value)}
                  className={`
                    w-full px-3 py-2 sm:px-4 sm:py-3 text-left transition-colors
                    hover:bg-blue-50 flex items-center justify-between gap-2
                    ${selectedVoice === voice.value ? 'bg-blue-100' : ''}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">
                      {voice.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {voice.description}
                    </div>
                  </div>
                  
                  {selectedVoice === voice.value && (
                    <Check size={16} className="text-blue-600 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-tight">
                💡 Voz afeta apenas respostas em áudio
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

