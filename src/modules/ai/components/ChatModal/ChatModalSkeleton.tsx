export default function ChatModalSkeleton() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-2xl px-8 py-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">Carregando assistente…</p>
      </div>
    </div>
  )
}
