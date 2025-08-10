'use client';

import { memo } from 'react';

import { useSession } from 'next-auth/react';

import { useSidebarContext } from '@/contexts';
import { cn } from '@/lib/utils';

import { fenixSidebarConfig, sidebarConfig } from './config';
import MenuItem from './MenuItem';
import type { SidebarProps } from './types';

import styles from './sidebar.module.scss';

const Sidebar = memo<SidebarProps>(({ className }) => {
  const { isCollapsed, handleMenuClick, handleExpandClick, isActive, isExpanded } = useSidebarContext();

  const { data } = useSession();

  const config = data?.user?.email === 'fenix@admin.com' ? fenixSidebarConfig : sidebarConfig;
  return (
    <div
      className={cn(
        styles.sidebarRoot,
        'transition-all duration-300 ease-in-out',
        isCollapsed && styles.sidebarRootCollapsed,
        className
      )}
    >
      <div className={styles.sidebarMenuContainer}>
        {config.map((menuItem) => (
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
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
