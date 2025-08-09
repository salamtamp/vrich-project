import type { LucideIcon } from 'lucide-react';

export type SidebarItem = {
  label: string;
  path?: string;
  icon: LucideIcon;
  children?: SidebarItem[];
};

export type SidebarConfig = SidebarItem[];

export type SidebarProps = {
  className?: string;
};

export type MenuItemProps = {
  item: SidebarItem;
  level?: number;
  isCollapsed?: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onMenuClick: (path: string) => void;
  onExpandClick: (label: string) => void;
};

export type SidebarHeaderProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

export type SidebarFooterProps = {
  isCollapsed: boolean;
  onLogout: () => void;
};
