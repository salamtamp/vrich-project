'use client';

import { FenixLogoIcon, LogoIcon } from '@public/assets/icon';
import { LogOut, PanelRightOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

import styles from './topbar.module.scss';

const Topbar = () => {
  const { data } = useSession();
  const { isCollapsed, toggleCollapse, handleLogout } = useSidebarContext();

  const user = data?.user;

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarContent}>
        {/* Logo Section */}
        <div className={styles.topbarLogoSection}>
          <div className={styles.topbarLogoWrapper}>
            <div className={cn(styles.topbarLogoLarge)}>
              {user?.email === 'fenix@admin.com' ? (
                <div className='h-[30px]'>
                  <FenixLogoIcon className='h-[30px] w-[110px]' />
                </div>
              ) : (
                <LogoIcon />
              )}
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
