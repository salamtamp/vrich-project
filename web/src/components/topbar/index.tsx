'use client';

import { LogoIcon } from '@public/assets/icon';
import { LogOut, PanelRightOpen } from 'lucide-react';

import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

import styles from './topbar.module.scss';

const Topbar = () => {
  const { isCollapsed, toggleCollapse, handleLogout } = useSidebarContext();

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarContent}>
        {/* Logo Section */}
        <div className={styles.topbarLogoSection}>
          <div className={styles.topbarLogoWrapper}>
            <div className={cn(styles.topbarLogoLarge)}>
              <LogoIcon />
            </div>
          </div>
          <button
            className={styles.topbarToggleButton}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type='button'
            onClick={toggleCollapse}
          >
            <PanelRightOpen
              className={cn(styles.topbarToggleIcon, isCollapsed && '!rotate-180')}
              size={20}
            />
          </button>
        </div>

        {/* Center Section - Can be used for search or other content */}
        <div className={styles.topbarCenterSection}>{/* Placeholder for future content like search */}</div>

        {/* Right Section - Actions */}
        <div className={styles.topbarRightSection}>
          {/* Logout Button */}
          <button
            className={styles.topbarLogoutButton}
            title='ออกจากระบบ'
            type='button'
            onClick={handleLogout}
          >
            <LogOut
              className={styles.topbarLogoutIcon}
              size={20}
            />
            <span className={styles.topbarLogoutText}>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
