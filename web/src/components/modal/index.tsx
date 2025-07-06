'use client';

import { useCallback } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { FC, ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type ModalProps = {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: (() => void) | null;
  trigger?: ReactNode;
  title?: string;
  hideTitle?: boolean;
  closeOnOutsideClick?: boolean;
};

const Modal: FC<ModalProps> = ({
  isOpen,
  children,
  onClose,
  trigger,
  title = 'Dialog',
  hideTitle = true,
  closeOnOutsideClick = true,
}) => {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && closeOnOutsideClick) {
        onClose?.();
      }
    },
    [onClose, closeOnOutsideClick]
  );

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={handleOpenChange}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent data-testid='modal-container'>
        {hideTitle ? (
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
        ) : (
          <DialogTitle>{title}</DialogTitle>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
