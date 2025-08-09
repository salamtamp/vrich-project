import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { SidebarFooterProps } from './types';

import styles from './sidebar.module.scss';

const SidebarFooter = ({ isCollapsed, onLogout }: SidebarFooterProps) => (
  <div className={styles.sidebarFooterDivider}>
    <div className={cn(styles.sidebarLogoutWrapper, isCollapsed && styles.sidebarLogoutWrapperCollapsed)}>
      <button
        className={cn(styles.sidebarLogoutButton, isCollapsed && styles.sidebarLogoutButtonCollapsed)}
        title={isCollapsed ? 'ออกจากระบบ' : undefined}
        type='button'
        onClick={onLogout}
      >
        <LogOut
          className={cn(styles.sidebarLogoutIcon, isCollapsed && styles.sidebarLogoutIconCollapsed)}
          size={20}
        />
        <div
          className={cn(
            styles.sidebarLogoutTextWrapper,
            isCollapsed && styles.sidebarLogoutTextWrapperCollapsed
          )}
        >
          <p className={styles.sidebarLogoutText}>ออกจากระบบ</p>
        </div>
      </button>
    </div>
  </div>
);

export default SidebarFooter;
