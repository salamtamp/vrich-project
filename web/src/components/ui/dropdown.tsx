'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

type DropdownContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

type DropdownProps = {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({ children, trigger, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef, menuRef }}>
      <div className={cn('relative', className)}>
        {trigger}
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

type DropdownTriggerProps = {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  className,
  icon = <MoreHorizontal className='size-4' />,
}) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownTrigger must be used within Dropdown');
  }

  const { isOpen, setIsOpen, triggerRef } = context;

  return (
    <button
      ref={triggerRef}
      className={cn(
        'flex items-center gap-1 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        className
      )}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      {icon}
      {children}
    </button>
  );
};

type DropdownMenuProps = {
  children: React.ReactNode;
  className?: string;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className }) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenu must be used within Dropdown');
  }

  const { isOpen, menuRef } = context;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-gray-200 bg-white py-1 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
};

type DropdownItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, className }) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownItem must be used within Dropdown');
  }

  const { setIsOpen } = context;

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      className={cn('w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100', className)}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
