import { ReactNode } from 'react';
import { Overlay, Content } from './styles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        {children}
      </Content>
    </Overlay>
  );
}
