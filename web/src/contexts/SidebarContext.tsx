'use client';

import { createContext, type ReactNode, useContext } from 'react';

import { useSidebar } from '@/components/sidebar/hooks/useSidebar';
import type { SidebarItem } from '@/components/sidebar/types';

type SidebarContextType = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  handleLogout: () => void;
  handleMenuClick: (path: string) => void;
  handleExpandClick: (label: string) => void;
  isActive: (item: SidebarItem) => boolean;
  isExpanded: (label: string) => boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

type SidebarProviderProps = {
  children: ReactNode;
};

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const {
    isCollapsed,
    toggleCollapse,
    handleLogout,
    handleMenuClick,
    handleExpandClick,
    isActive,
    isExpanded,
  } = useSidebar();

  const handleLogoutWrapper = () => {
    void handleLogout();
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse,
        handleLogout: handleLogoutWrapper,
        handleMenuClick,
        handleExpandClick,
        isActive,
        isExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
