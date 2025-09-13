import { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/api';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from '../../../auth/hooks/useAuth';
import type { Message, Conversation } from '../../types/conversation';
import { conversationStorage } from '../../services/conversationStorage';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { data: authData } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loadingTime, setLoadingTime] = useState(0);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [showConversationTabs, setShowConversationTabs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar conversas do armazenamento
  const loadConversations = () => {
    const allConversations = conversationStorage.getAllConversations();
    setConversations(allConversations);
    
    const activeId = conversationStorage.getActiveConversationId();
    if (activeId) {
      const active = conversationStorage.getConversationById(activeId);
      setActiveConversation(active);
    } else if (allConversations.length > 0) {
      // Se não há conversa ativa, usar a mais recente
      setActiveConversation(allConversations[0]);
      conversationStorage.setActiveConversation(allConversations[0].id);
    }
  };

  // Criar nova conversa
  const createNewConversation = () => {
    const newConv = conversationStorage.createNewConversation();
    conversationStorage.saveConversation(newConv);
    conversationStorage.setActiveConversation(newConv.id);
    setActiveConversation(newConv);
    loadConversations();
  };

  // Selecionar conversa
  const selectConversation = (conversationId: string) => {
    const conversation = conversationStorage.getConversationById(conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      conversationStorage.setActiveConversation(conversationId);
    }
  };

  // Deletar conversa
  const deleteConversation = (conversationId: string) => {
    conversationStorage.deleteConversation(conversationId);
    loadConversations();
    
    // Se deletou a conversa ativa, criar uma nova
    if (activeConversation?.id === conversationId) {
      createNewConversation();
    }
  };

  // Salvar mensagem na conversa ativa
  const saveMessageToActiveConversation = (message: Message) => {
    if (activeConversation) {
      conversationStorage.addMessageToConversation(activeConversation.id, message);
      // Atualizar o estado local
      const updatedConv = conversationStorage.getConversationById(activeConversation.id);
      if (updatedConv) {
        setActiveConversation(updatedConv);
        loadConversations();
      }
    }
  };

  const downloadChart = (base64Data: string, filename: string = 'grafico') => {
    try {
      // Remove o prefixo data:image/[tipo];base64, se existir
      const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Detecta o tipo de imagem (padrão PNG)
      let mimeType = 'image/png';
      let extension = 'png';
      
      if (base64Data.includes('data:image/jpeg') || base64Data.includes('data:image/jpg')) {
        mimeType = 'image/jpeg';
        extension = 'jpg';
      } else if (base64Data.includes('data:image/svg')) {
        mimeType = 'image/svg+xml';
        extension = 'svg';
      }
      
      // Converte base64 para blob
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Cria link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Feedback visual de sucesso
      setSuccessMessage('Gráfico baixado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Erro ao fazer download do gráfico:', error);
      setError('❌ Erro ao fazer download do gráfico');
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Carregar conversas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    const setInitialPosition = () => {
      // Só define posição para desktop (lg+)
      if (window.innerWidth >= 1024) {
        setPosition({
          x: window.innerWidth - 620, 
          y: window.innerHeight - 580
        });
      }
    };

    setInitialPosition();

    const handleResize = () => {
      // Só ajusta posição para desktop
      if (window.innerWidth >= 1024) {
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - 350),
          y: Math.min(prev.y, window.innerHeight - 300)
        }));
      }
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

    const prompt = inputValue.trim();

    // Se não há conversa ativa, criar uma nova
    if (!activeConversation) {
      createNewConversation();
      return; // A função será chamada novamente após criar a conversa
    }

    const userMessage: Message = {
      content: prompt,
      status: "user",
      timestamp: new Date(),
    };

    // Salvar mensagem do usuário
    saveMessageToActiveConversation(userMessage);
    
    setInputValue('');
    setIsLoading(true);
    setIsLoadingContext(true);
    setError(null);
    setLoadingTime(0);

    loadingTimerRef.current = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    try {
      setIsLoadingContext(false);
      const response = await aiService.chat({
        prompt: prompt,
        userId: authData?.id,
      });

      const botMessage: Message = {
        content: response.data.content || 'Desculpe, não consegui processar sua mensagem.',
        status: "bot",
        timestamp: new Date(),
        chart: response.data.chart || undefined,
      };

      // Salvar mensagem do bot
      saveMessageToActiveConversation(botMessage);
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
        status: "error",
        timestamp: new Date(),
      };

      // Salvar mensagem de erro
      saveMessageToActiveConversation(errorMessage);
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
    createNewConversation();
    setError(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Só permite drag em desktop (lg+)
    if (window.innerWidth >= 1024) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
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
      className={`fixed bg-white rounded-xl ${
        isOpen ? 'flex' : 'hidden'
      } flex-col animate-fadeIn shadow-[0_20px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(156,163,175,0.3)] z-[1001] overflow-hidden select-none border border-gray-200
      w-[calc(100vw-20px)] h-[calc(100vh-120px)] max-w-none max-h-none left-[10px] top-2
      md:w-[500px] md:h-[600px] md:max-w-[90vw] md:max-h-[90vh] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
      lg:w-[600px] lg:h-[500px] lg:max-w-[800px] lg:max-h-[80vh] lg:translate-x-0 lg:translate-y-0 lg:resize`}
      style={{
        left: window.innerWidth >= 1024 ? `${position.x}px` : '',
        top: window.innerWidth >= 1024 ? `${position.y}px` : '',
      }}
    >
        <div 
          onMouseDown={handleMouseDown}
          className="flex justify-between items-center border-b border-gray-300 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-xl flex-shrink-0 cursor-default lg:cursor-grab lg:active:cursor-grabbing px-3 py-3 md:px-5 md:py-4"
        >
          <h2 className="m-0 font-semibold flex items-center gap-2 text-sm md:text-base">
            <span className="text-base md:text-lg">🤖</span>
            <span className="hidden xs:inline">Mech Assistant</span>
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setShowConversationTabs(!showConversationTabs)}
              className={`bg-transparent border-none text-white cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/20 p-1.5 text-xs md:p-2 md:text-sm ${showConversationTabs ? 'bg-white/20' : ''}`}
              title="Histórico de conversas"
            >
              📋
            </button>
            <button
              onClick={createNewConversation}
              className="bg-transparent border-none text-white cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/20 p-1.5 text-xs md:p-2 md:text-sm"
              title="Nova conversa"
            >
              ➕
            </button>
            <button
              onClick={handleClearChat}
              className="bg-transparent border-none text-white/80 cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/20 p-1.5 text-xs md:p-2 md:text-sm"
              title="Limpar conversa"
            >
              🗑️
            </button>
            <button 
              onClick={onClose}
              className="bg-transparent border-none text-white cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/20 hover:rotate-90 p-1.5 text-sm md:p-2 md:text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Abas de Conversas */}
        {showConversationTabs && (
          <div className="bg-gray-50 border-b border-gray-200 overflow-y-auto p-2 max-h-24 md:p-3 md:max-h-32">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center cursor-pointer transition-all duration-200 rounded-lg gap-1 px-2 py-1 text-xs md:gap-2 md:px-3 md:py-2 md:text-xs ${
                    activeConversation?.id === conv.id
                      ? 'bg-orangeWheel-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                  }`}
                >
                  <span
                    onClick={() => selectConversation(conv.id)}
                    className="truncate font-medium max-w-[80px] md:max-w-[100px] lg:max-w-[120px]"
                    title={conv.title}
                  >
                    {conv.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className={`transition-colors text-xs md:text-xs ${
                      activeConversation?.id === conv.id
                        ? 'text-white/80 hover:text-white'
                        : 'text-red-500 hover:text-red-700'
                    }`}
                    title="Deletar conversa"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {conversations.length === 0 && (
              <p className="text-gray-600 text-center font-medium text-xs py-1 md:text-xs md:py-2">
                Nenhuma conversa salva ainda
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3 md:p-5">
            {(!activeConversation || activeConversation.messages.length === 0) && (
              <div className="text-center text-gray-600 py-6 px-3 md:py-10 md:px-5">
                <h3 className="m-0 mb-4 text-gray-800 text-base md:text-lg">👋 Bem-vindo ao Mech Assistant!</h3>
                <p className="m-0 leading-relaxed text-sm md:text-base">Como posso ajudá-lo hoje? Faça uma pergunta ou peça uma informação sobre o sistema.</p>
                <p className="text-gray-600 mt-2 m-0 leading-relaxed text-xs md:text-sm">
                  💡 <strong>Dica:</strong> Quando você perguntar sobre clientes, veículos ou ordens de serviço, 
                  buscarei automaticamente informações relevantes para dar respostas mais precisas!
                </p>
              </div>
            )}

            {activeConversation?.messages.map((message, index) => (
              <div key={`${message.content.substring(0, 20)}-${index}`} className={`flex flex-col ${message.status === "user" ? 'items-end' : 'items-start'}`}>
                <div className={`leading-relaxed word-wrap break-word prose prose-slate max-w-[95%] p-2 px-3 text-xs prose-xs md:max-w-[85%] md:p-3 md:px-4 md:text-sm md:prose-sm lg:max-w-[80%] lg:p-3 lg:px-4 lg:text-sm lg:prose-sm ${
                  message.status === "user" 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-[18px_18px_4px_18px] shadow-md' 
                    : 'bg-gray-50 text-gray-800 rounded-[18px_18px_18px_4px] border border-gray-200'
                }`}>
                  <div className={`markdown-content ${message.status === "user" ? 'text-white' : 'text-gray-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Exibir gráfico se disponível */}
                  {message.chart && message.status !== "user" && (
                    <div className="border-t border-gray-300 mt-2 pt-2 md:mt-3 md:pt-3">
                      <div className="relative group">
                        <img 
                          src={`data:image/png;base64,${message.chart}`}
                          alt="Gráfico gerado pela IA"
                          className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-300"
                          onClick={() => downloadChart(message.chart!, 'grafico_ia')}
                          title="Clique para fazer download"
                        />
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 top-1 right-1 md:top-2 md:right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadChart(message.chart!, 'grafico_ia');
                            }}
                            className="bg-orangeWheel-500 text-white rounded-full hover:bg-orangeWheel-600 transition-all duration-200 shadow-lg hover:shadow-xl p-1.5 text-sm md:p-2 md:text-base"
                            title="Fazer download do gráfico"
                          >
                            📥
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2 italic font-medium text-xs md:text-xs">
                        💡 Clique na imagem ou no botão para fazer download
                      </p>
                    </div>
                  )}
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
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm text-center font-medium shadow-sm">
                ❌ {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm text-center font-medium shadow-sm">
                ✅ {successMessage}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex border-t border-gray-200 bg-gray-50 gap-2 p-3 md:gap-3 md:p-5">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              maxLength={500}
              className="flex-1 border border-gray-300 rounded-[20px] resize-none font-inherit focus:outline-none focus:border-orangeWheel-400 focus:shadow-[0_0_0_2px_rgba(245,124,0,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 py-2 px-3 text-sm min-h-[40px] max-h-[80px] md:py-2.5 md:px-3.5 md:text-sm md:min-h-[44px] md:max-h-[90px] lg:py-3 lg:px-4 lg:text-sm lg:min-h-[48px] lg:max-h-[100px]"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-orangeWheel-500 to-persimmon-500 border-none rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_8px_rgba(245,124,0,0.4)] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-white w-10 h-10 text-sm md:w-11 md:h-11 md:text-base lg:w-11 lg:h-11 lg:text-base"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
    </div>
  );
}
