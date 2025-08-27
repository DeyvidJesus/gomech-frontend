interface ToastProps {
  onClick: () => void;
}

export default function Toast({ onClick }: ToastProps) {
  return (
    <div 
      onClick={onClick}
      className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-3 rounded-full flex items-center gap-2 cursor-pointer z-[1000] shadow-lg animate-pulse hover:scale-110 hover:animate-none hover:shadow-xl transition-all duration-300 md:bottom-4 md:right-4 md:px-4 md:py-2.5"
    >
      <span className="text-xl md:text-lg">🤖</span>
      <span className="font-semibold text-sm md:text-xs">Chat IA</span>
    </div>
  );
}
