'use client';
import { useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { signOut } from 'next-auth/react';

import { PATH } from '@/constants/path.constant';

import { sidebarConfig } from '../config';
import type { SidebarItem } from '../types';
import { getExpandedItems } from '../utils';

export const useSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (pathname) {
      const initialExpanded = getExpandedItems(sidebarConfig, pathname);
      // Set all parent items as expanded by default
      const allExpanded = new Set(initialExpanded);
      sidebarConfig.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allExpanded.add(item.label);
        }
      });
      setExpandedItems(allExpanded);
    }
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: PATH.LOGIN });
  }, []);

  const handleMenuClick = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const handleExpandClick = useCallback((label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const isActive = useCallback(
    (item: SidebarItem): boolean => {
      if (item.path && pathname?.includes(item.path)) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => isActive(child));
      }
      return false;
    },
    [pathname]
  );

  const isExpanded = useCallback(
    (label: string): boolean => {
      return expandedItems.has(label);
    },
    [expandedItems]
  );

  return {
    isCollapsed,
    handleLogout,
    handleMenuClick,
    handleExpandClick,
    toggleCollapse,
    isActive,
    isExpanded,
  };
};
