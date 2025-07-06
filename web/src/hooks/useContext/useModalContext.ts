'use client';
import { useContext } from 'react';

import { ModalContext } from '@/contexts';

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalContextProvider');
  }
  return context;
};

export default useModalContext;
