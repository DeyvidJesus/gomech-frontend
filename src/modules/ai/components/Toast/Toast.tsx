interface ToastProps {
  onClick: () => void;
}

export default function Toast({ onClick }: ToastProps) {
  return (
    <div 
      onClick={onClick}
      className="fixed bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full flex items-center cursor-pointer z-[1000] shadow-lg animate-fadeIn hover:animate-none hover:shadow-xl transition-all duration-300 border-2 border-orangeWheel-400 bottom-2 right-4 px-3 py-2 gap-1.5 hover:scale-105 md:right-5 md:px-4 md:py-2.5 md:gap-2 md:hover:scale-108 lg:px-5 lg:py-3 lg:gap-2 lg:hover:scale-110"
    >
      <span className="text-base md:text-lg lg:text-xl">🤖</span>
      <span className="font-semibold text-xs md:text-xs lg:text-sm">
        <span className="inline sm:hidden">IA</span>
        <span className="hidden sm:inline">Mech Assistant</span>
      </span>
    </div>
  );
}
