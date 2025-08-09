import type { SidebarItem } from './types';

export const findActiveItem = (items: SidebarItem[], pathname: string): SidebarItem | null => {
  for (const item of items) {
    if (item.path && pathname.includes(item.path)) {
      return item;
    }
    if (item.children) {
      const activeChild = findActiveItem(item.children, pathname);
      if (activeChild) {
        return activeChild;
      }
    }
  }
  return null;
};

export const getExpandedItems = (items: SidebarItem[], pathname: string): Set<string> => {
  const expanded = new Set<string>();

  const traverse = (itemList: SidebarItem[]) => {
    for (const item of itemList) {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.path && pathname.includes(child.path));
        if (hasActiveChild) {
          expanded.add(item.label);
          traverse(item.children);
        }
      }
    }
  };

  traverse(items);
  return expanded;
};
