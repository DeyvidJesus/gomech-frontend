import { useState } from 'react';
import Toast from '../Toast/Toast';
import ChatModal from '../ChatModal/ChatModal';

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToastClick = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <Toast onClick={handleToastClick} />
      <ChatModal isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}
