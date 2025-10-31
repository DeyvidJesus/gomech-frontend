import { lazy, Suspense, useState } from 'react'

import ChatModalFallback from '../ChatModal/ChatModalSkeleton'
import Toast from '../Toast/Toast'

const ChatModal = lazy(() => import('../ChatModal/ChatModal'))

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleToastClick = () => {
    setIsChatOpen(true)
  }

  const handleCloseChat = () => {
    setIsChatOpen(false)
  }

  return (
    <>
      <Toast onClick={handleToastClick} />
      {isChatOpen && (
        <Suspense fallback={<ChatModalFallback />}>
          <ChatModal isOpen={isChatOpen} onClose={handleCloseChat} />
        </Suspense>
      )}
    </>
  )
}
