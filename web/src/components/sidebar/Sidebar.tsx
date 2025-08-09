'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';

import { useSidebar } from './hooks/useSidebar';
import { sidebarConfig } from './config';
import MenuItem from './MenuItem';
import SidebarFooter from './SidebarFooter';
import SidebarHeader from './SidebarHeader';
import type { SidebarProps } from './types';

import styles from './sidebar.module.scss';

const Sidebar = memo<SidebarProps>(({ className }) => {
  const {
    isCollapsed,
    handleLogout,
    handleMenuClick,
    handleExpandClick,
    toggleCollapse,
    isActive,
    isExpanded,
  } = useSidebar();

  return (
    <div
      className={cn(
        styles.sidebarRoot,
        'transition-all duration-300 ease-in-out',
        isCollapsed && styles.sidebarRootCollapsed,
        className
      )}
    >
      <div className={styles.sidebarMainContainer}>
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <div className={styles.sidebarHeaderDivider} />

        <div className={styles.sidebarMenuContainer}>
          {sidebarConfig.map((menuItem) => (
            <MenuItem
              key={menuItem.label}
              isActive={isActive(menuItem)}
              isCollapsed={isCollapsed}
              isExpanded={isExpanded(menuItem.label)}
              item={menuItem}
              onExpandClick={handleExpandClick}
              onMenuClick={handleMenuClick}
            />
          ))}
        </div>
      </div>

      <div className={styles.sidebarFooterContainer}>
        <SidebarFooter
          isCollapsed={isCollapsed}
          onLogout={() => {
            void handleLogout();
          }}
        />
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
