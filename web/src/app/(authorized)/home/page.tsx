'use client';

import { useRouter } from 'next/navigation';

import { sidebarConfig } from '@/components/sidebar/config';
import type { SidebarItem } from '@/components/sidebar/types';
import { Card } from '@/components/ui/card';
import { PATH } from '@/constants/path.constant';

import styles from './home.module.scss';

const HomePage = () => {
  const router = useRouter();

  const handleMenuCardClick = (path: string) => {
    if (path) {
      router.push(path);
    }
  };

  const getMenuItems = () => {
    const menuItems: Array<{
      label: string;
      path: string;
      icon: SidebarItem['icon'];
      description?: string;
    }> = [];

    sidebarConfig.forEach((item) => {
      if (item.path && item.path !== PATH.HOME) {
        menuItems.push({
          label: item.label,
          path: item.path,
          icon: item.icon,
          description: `เข้าถึง ${item.label}`,
        });
      }

      if (item.children) {
        item.children.forEach((child) => {
          if (child.path) {
            menuItems.push({
              label: child.label,
              path: child.path,
              icon: child.icon,
              description: `จัดการ ${child.label}`,
            });
          }
        });
      }
    });

    return menuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}>
        <h1 className={styles.homeTitle}>ยินดีต้อนรับ</h1>
      </div>

      <div className={styles.menuGrid}>
        {menuItems.map((menuItem) => {
          const MenuIcon = menuItem.icon;
          return (
            <Card
              key={menuItem.label}
              className={styles.menuCard}
              onClick={() => {
                handleMenuCardClick(menuItem.path);
              }}
            >
              <div className={styles.menuCardContent}>
                <div className={styles.menuCardIcon}>
                  <MenuIcon
                    size={32}
                    strokeWidth={2}
                  />
                </div>
                <div className={styles.menuCardText}>
                  <h3 className={styles.menuCardTitle}>{menuItem.label}</h3>
                  <p className={styles.menuCardDescription}>{menuItem.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
