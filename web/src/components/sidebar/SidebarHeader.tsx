import { LogoIcon, LogoSmallIcon } from '@public/assets/icon';
import { PanelRightOpen } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { SidebarHeaderProps } from './types';

import styles from './sidebar.module.scss';

const SidebarHeader = ({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) => (
  <div className={cn(styles.sidebarHeader, isCollapsed && styles.sidebarHeaderCollapsed)}>
    <div className={cn(styles.sidebarLogoWrapper, isCollapsed && styles.sidebarLogoWrapperCollapsed)}>
      <div className={cn(isCollapsed ? styles.sidebarLogoSmall : styles.sidebarLogoSmallHidden)}>
        {isCollapsed ? <LogoSmallIcon /> : null}
      </div>
      <div className={cn(!isCollapsed ? styles.sidebarLogoLarge : styles.sidebarLogoLargeHidden)}>
        {!isCollapsed && <LogoIcon />}
      </div>
    </div>
    <button
      className={cn(styles.sidebarToggleButton, isCollapsed && styles.sidebarToggleButtonCollapsed)}
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      type='button'
      onClick={onToggleCollapse}
    >
      <PanelRightOpen
        className={cn(styles.sidebarToggleIcon, isCollapsed && styles.sidebarToggleIconCollapsed)}
        size={20}
      />
    </button>
  </div>
);

export default SidebarHeader;
