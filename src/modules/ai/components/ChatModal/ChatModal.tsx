import { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/api';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatPromptWithSystemContext, getSystemContext } from '../../utils/systemContextDetector';
import DataManagementModal from '../DataManagementModal/DataManagementModal';

interface Message {
  content: string;
  status: boolean;
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loadingTime, setLoadingTime] = useState(0);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setInitialPosition = () => {
      setPosition({
        x: window.innerWidth - 620, 
        y: window.innerHeight - 580
      });
    };

    setInitialPosition();

    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 350),
        y: Math.min(prev.y, window.innerHeight - 300)
      }));
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const originalPrompt = inputValue.trim();
    const userMessage: Message = {
      content: originalPrompt,
      status: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsLoadingContext(true);
    setError(null);
    setLoadingTime(0);

    loadingTimerRef.current = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    try {
      const systemContext = await getSystemContext(originalPrompt);
      setIsLoadingContext(false);
      
      const finalPrompt = formatPromptWithSystemContext(originalPrompt, systemContext);
      
      if (systemContext.hasContext) {
        console.log('Contexto do sistema incluído:', systemContext);
      }

      const response = await aiService.chat({
        prompt: finalPrompt,
      });

      console.log(response);

      const botMessage: Message = {
        content: response.data.content || 'Desculpe, não consegui processar sua mensagem.',
        status: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      
      let errorText = 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
      let userErrorText = 'Erro ao comunicar com o chatbot. Tente novamente.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorText = 'O processamento está demorando mais que o esperado devido à quantidade de dados. A IA ainda está processando sua solicitação...';
        userErrorText = 'Timeout - Processamento demorado devido à quantidade de dados.';
      } else if (err.response?.status === 500) {
        errorText = 'Erro interno do servidor. Por favor, tente novamente.';
        userErrorText = 'Erro interno do servidor.';
      } else if (err.response?.status === 503) {
        errorText = 'Serviço temporariamente indisponível. Aguarde alguns momentos e tente novamente.';
        userErrorText = 'Serviço temporariamente indisponível.';
      }
      
      setError(userErrorText);

      const errorMessage: Message = {
        content: errorText,
        status: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsLoadingContext(false);
      setLoadingTime(0);
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const maxX = window.innerWidth - 350;
    const maxY = window.innerHeight - 300;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <div 
      ref={panelRef}
      className={`fixed w-[600px] h-[500px] min-w-[350px] min-h-[300px] max-w-[800px] max-h-[80vh] bg-white rounded-xl ${
        isOpen ? 'flex' : 'hidden'
      } flex-col animate-fadeIn shadow-[0_20px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.1)] z-[1001] resize overflow-hidden select-none
      md:left-[10px] md:right-[10px] md:w-auto md:max-w-none md:resize-y
      sm:left-[5px] sm:right-[5px] sm:h-[400px] sm:min-h-[250px]`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
        <div 
          onMouseDown={handleMouseDown}
          className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl flex-shrink-0 cursor-grab active:cursor-grabbing"
        >
          <h2 className="m-0 text-lg font-semibold">🤖 Assistente IA</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="bg-transparent border-none text-gray-200 cursor-pointer p-1 text-base hover:bg-white/20 rounded transition-colors"
              title="Gerenciar dados da IA"
            >
              📊
            </button>
            <button
              onClick={handleClearChat}
              className="bg-transparent border-none text-gray-400 cursor-pointer p-1 text-base hover:bg-white/20 rounded transition-colors"
              title="Limpar conversa"
            >
              🗑️
            </button>
            <button 
              onClick={onClose}
              className="bg-transparent border-none text-white text-xl cursor-pointer p-1 rounded transition-colors hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center py-10 px-5 text-gray-600">
                <h3 className="m-0 mb-4 text-gray-800 text-lg">👋 Bem-vindo ao Assistente IA!</h3>
                <p className="m-0 leading-relaxed">Como posso ajudá-lo hoje? Faça uma pergunta ou peça uma informação sobre o sistema.</p>
                <p className="text-sm text-gray-600 mt-2 m-0 leading-relaxed">
                  💡 <strong>Dica:</strong> Quando você perguntar sobre clientes, veículos ou ordens de serviço, 
                  buscarei automaticamente informações relevantes para dar respostas mais precisas!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={`${message.content.substring(0, 20)}-${index}`} className={`flex flex-col ${message.status ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 px-4 leading-relaxed word-wrap break-word ${
                  message.status 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-[18px_18px_4px_18px]' 
                    : 'bg-gray-100 text-gray-800 rounded-[18px_18px_18px_4px]'
                } prose prose-slate max-w-none`}>
                  <div className={`markdown-content ${message.status ? 'text-white' : 'text-gray-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-typingDots" style={{ animationDelay: '-0.32s' }}></span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-typingDots" style={{ animationDelay: '-0.16s' }}></span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-typingDots"></span>
                </div>
                <div className="flex flex-col gap-1">
                  {isLoadingContext ? (
                    <span>🔍 Buscando contexto do sistema...</span>
                  ) : (
                    <span>IA está processando...</span>
                  )}
                  {loadingTime > 10 && (
                    <span className="text-[11px] text-gray-600">
                      Processando há {loadingTime}s - Muitos dados podem demorar mais
                    </span>
                  )}
                  {loadingTime > 30 && (
                    <span className="text-[11px] text-gray-700">
                      💡 Para grandes volumes de dados, o processamento pode levar até 2 minutos
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3 p-5 border-t border-gray-200 bg-gray-50">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              maxLength={500}
              className="flex-1 border border-gray-300 rounded-[20px] py-3 px-4 text-sm resize-none min-h-[20px] max-h-[100px] font-inherit focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(102,126,234,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-full w-11 h-11 flex items-center justify-center cursor-pointer text-base transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_8px_rgba(102,126,234,0.3)] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>

        {/* Modal de Gerenciamento de Dados */}
        <DataManagementModal 
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
        />
    </div>
  );
}
