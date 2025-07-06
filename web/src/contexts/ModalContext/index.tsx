'use client';

import { Children, createContext, useCallback, useMemo, useState } from 'react';

import type { FC, ReactNode } from 'react';

import Modal from '@/components/modal';
import type { NextJSChildren } from '@/types';

import { PaginationProvider } from '../PaginationContext';

type ModalProps = {
  content: ReactNode;
  key: string;
  onClose?: (() => void) | null;
};

type ModalConfig = Omit<ModalProps, 'key'> & { key?: string };

type ModalContextType = {
  open: (props: ModalConfig) => void;
  close: (key?: string) => void;
  clear: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: FC<NextJSChildren> = ({ children }) => {
  const [modalConfigs, setModalConfigs] = useState<ModalProps[]>([]);

  const open = useCallback((modalConfig: ModalConfig) => {
    const newKey = modalConfig.key ?? `modal-${crypto.randomUUID()}`;

    setModalConfigs((prevConfig) => [...prevConfig, { ...modalConfig, key: newKey }]);
  }, []);

  const close = useCallback((key?: string) => {
    setModalConfigs((prevConfig) => {
      if (!prevConfig.length) {
        return prevConfig;
      }

      if (!key) {
        return prevConfig.slice(0, -1);
      }

      return prevConfig.filter((modal) => modal.key !== key);
    });
  }, []);

  const clear = useCallback(() => {
    setModalConfigs([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      open,
      close,
      clear,
    }),
    [close, clear, open]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {Children.toArray(
        modalConfigs.map((modalConfig, index) => {
          const { content, ...rest } = modalConfig;
          const isLastModal = index === modalConfigs.length - 1;
          const handleClose = () => {
            if (rest?.onClose) {
              rest.onClose();
              return;
            }
            if (rest.key) {
              close(rest.key);
            } else {
              close();
            }
          };
          return (
            <Modal
              {...rest}
              key={modalConfig.key}
              isOpen={isLastModal}
              onClose={handleClose}
            >
              <PaginationProvider>{content}</PaginationProvider>
            </Modal>
          );
        })
      )}
      {children}
    </ModalContext.Provider>
  );
};
