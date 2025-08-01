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
        isCollapse ? '!min-w-[110px] !px-0' : 'w-full'
      )}
    >
      <div className={styles.navBarContainer}>
        <div
          className={cn(
            styles.headerContainer,
            'transition-all duration-300 ease-in-out',
            isCollapse && '!ml-2 pl-5'
          )}
        >
          <div className='h-[30px] overflow-hidden'>
            <div
              className={cn(
                'transition-all duration-300 ease-in-out',
                isCollapse ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              )}
            >
              {isCollapse ? <LogoSmallIcon /> : null}
            </div>
            <div
              className={cn(
                'transition-all duration-300 ease-in-out',
                !isCollapse ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              )}
            >
              {!isCollapse && <LogoIcon />}
            </div>
          </div>
          <button
            className={cn(
              'flex size-7 items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-300',
              'transform transition-all duration-300 ease-in-out',
              isCollapse ? 'mr-2 rotate-180' : 'mr-4'
            )}
            onClick={() => {
              setIsCollapse((c) => !c);
            }}
          >
            <LeftColorIcon />
          </button>
        </div>
        <div className='mt-5 h-[2px] w-full rounded-lg bg-gray-300' />

        <div className={styles.menuContainer}>
          {sidebarConfig.map((item) => {
            const IconComponent = item.icon;

            const isActive = pathname?.includes(item.path);
            return (
              <div
                key={item.path}
                className={cn('flex flex-col px-3')}
              >
                <button
                  type='button'
                  className={cn(
                    styles.menuItem,
                    isActive && styles.isActive,
                    'cursor-pointer rounded-lg p-2 transition-all duration-300 ease-in-out',
                    isCollapse && 'justify-center'
                  )}
                  onClick={() => {
                    handleMenuClick(item.path);
                  }}
                >
                  <IconComponent
                    className={cn(styles.iconActive, 'transition-all duration-300 ease-in-out')}
                    size={20}
                    strokeWidth={2.5}
                  />
                  {!isCollapse ? (
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isCollapse ? 'w-0 opacity-0' : 'w-auto opacity-100'
                      )}
                    >
                      <p className='ml-2 whitespace-nowrap text-display-medium'>{item.label}</p>
                    </div>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.navBarContainer}>
        <div className='mt-6 h-[2px] w-full rounded-lg bg-gray-300' />
        <div className={cn('flex flex-col px-3 pb-4')}>
          <button
            type='button'
            className={cn(
              styles.menuItem,
              'mt-4 cursor-pointer rounded-lg p-2 transition-all duration-300 ease-in-out',
              isCollapse && 'justify-center'
            )}
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut
              className={cn(styles.iconActive, 'transition-all duration-300 ease-in-out')}
              strokeWidth={2.5}
            />
            {!isCollapse ? (
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isCollapse ? 'w-0 opacity-0' : 'w-auto opacity-100'
                )}
              >
                <p className='ml-2 whitespace-nowrap text-display-medium'>Logout</p>
              </div>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
