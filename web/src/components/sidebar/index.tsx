'use client';

import { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { LeftColorIcon, LogoIcon, LogoSmallIcon } from '@public/assets/icon';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { PATH } from '@/constants/path.constant';
import { cn } from '@/lib/utils';

import { sidebarConfig } from './config';

import styles from './sidebar.module.scss';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapse, setIsCollapse] = useState<boolean | null>(null);

  const handleLogout = async () => {
    await signOut({ callbackUrl: PATH.LOGIN });
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className={cn(
        styles.container,
        'transition-all duration-300 ease-in-out',
        isCollapse && styles.isCollapse
      )}
    >
      <div className={styles.navBarContainer}>
        <div className={cn(styles.headerContainer, isCollapse && styles.headerContainerCollapsed)}>
          <div className={styles.logoContainer}>
            <div className={cn(isCollapse ? styles.logoSmall : styles.logoSmallHidden)}>
              {isCollapse ? <LogoSmallIcon /> : null}
            </div>
            <div className={cn(!isCollapse ? styles.logoLarge : styles.logoLargeHidden)}>
              {!isCollapse && <LogoIcon />}
            </div>
          </div>
          <button
            className={cn(styles.collapseButton, isCollapse && styles.collapseButtonCollapsed)}
            onClick={() => {
              setIsCollapse((c) => !c);
            }}
          >
            <LeftColorIcon />
          </button>
        </div>
        <div className={styles.divider} />

        <div className={styles.menuContainer}>
          {sidebarConfig.map((item) => {
            const IconComponent = item.icon;

            const isActive = pathname?.includes(item.path);
            return (
              <div
                key={item.path}
                className='flex flex-col px-3'
              >
                <button
                  type='button'
                  className={cn(
                    styles.menuItem,
                    isActive && styles.isActive,
                    isCollapse && styles.menuItemCollapsed
                  )}
                  onClick={() => {
                    handleMenuClick(item.path);
                  }}
                >
                  <IconComponent
                    className={styles.iconActive}
                    size={20}
                    strokeWidth={2.5}
                  />
                  {!isCollapse ? (
                    <div className={styles.menuTextContainer}>
                      <p className={styles.menuText}>{item.label}</p>
                    </div>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.navBarContainer}>
        <div className={styles.footerDivider} />
        <div className={styles.logoutContainer}>
          <button
            className={cn(styles.logoutButton, isCollapse && styles.logoutButtonCollapsed)}
            type='button'
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut
              className={styles.iconActive}
              strokeWidth={2.5}
            />
            {!isCollapse ? (
              <div className={styles.menuTextContainer}>
                <p className={styles.menuText}>Logout</p>
              </div>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
