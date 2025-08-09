'use client';
import { memo, useEffect, useRef, useState } from 'react';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { MenuItemProps } from './types';

import styles from './sidebar.module.scss';

const MenuItem = memo<MenuItemProps>(
  ({ item, level = 0, isCollapsed = false, isActive, isExpanded, onMenuClick, onExpandClick }) => {
    const MenuIcon = item.icon;
    const hasSubItems = item.children && item.children.length > 0;
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
        }
      };

      if (showDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDropdown]);

    const handleMenuItemClick = () => {
      if (isCollapsed && hasSubItems) {
        setShowDropdown(!showDropdown);
      } else if (hasSubItems) {
        onExpandClick(item.label);
      } else if (item.path) {
        onMenuClick(item.path);
      }
    };

    const handleSubItemClick = (path: string) => {
      onMenuClick(path);
      setShowDropdown(false);
    };

    return (
      <div
        key={item.label}
        className='relative'
      >
        <button
          ref={buttonRef}
          className={cn(styles.menuItemButton, isCollapsed && styles.menuItemButtonCollapsed)}
          title={isCollapsed ? item.label : undefined}
          type='button'
          onClick={handleMenuItemClick}
        >
          <div
            className={cn(
              styles.menuItemContent,
              level > 0 && styles.menuItemSubContent,
              isActive && styles.menuItemActive,
              isCollapsed && styles.menuItemCollapsed
            )}
          >
            {level > 0 ? (
              <div className={cn(styles.menuItemIndicator, isActive && styles.menuItemIndicatorActive)} />
            ) : (
              <MenuIcon
                className={cn(styles.menuItemIcon, isCollapsed && styles.menuItemIconCollapsed)}
                size={isCollapsed ? 20 : 20}
                strokeWidth={2.5}
              />
            )}
            <div
              className={cn(styles.menuItemTextWrapper, isCollapsed && styles.menuItemTextWrapperCollapsed)}
            >
              <p className={styles.menuItemText}>{item.label}</p>
            </div>
          </div>

          {hasSubItems && !isCollapsed ? (
            <div className={styles.menuItemChevronWrapper}>
              {isExpanded ? (
                <ChevronDown
                  className={cn(styles.menuItemChevron, isActive && styles.menuItemChevronActive)}
                  size={16}
                  strokeWidth={2.5}
                />
              ) : (
                <ChevronRight
                  className={cn(styles.menuItemChevron, isActive && styles.menuItemChevronActive)}
                  size={16}
                  strokeWidth={2.5}
                />
              )}
            </div>
          ) : null}
        </button>

        {/* Dropdown for collapsed state */}
        {isCollapsed && hasSubItems && showDropdown ? (
          <div
            ref={dropdownRef}
            className={styles.menuItemDropdown}
          >
            <div className={styles.menuItemDropdownContent}>
              {item.children?.map((child) => (
                <button
                  key={child.label}
                  className={cn(styles.menuItemDropdownItem, isActive && styles.menuItemDropdownItemActive)}
                  type='button'
                  onClick={() => {
                    if (child.path) {
                      handleSubItemClick(child.path);
                    }
                  }}
                >
                  <div className={styles.menuItemDropdownItemContent}>
                    <child.icon
                      size={16}
                      strokeWidth={2.5}
                      className={cn(
                        styles.menuItemDropdownItemIcon,
                        isActive && styles.menuItemDropdownItemIconActive
                      )}
                    />
                    <span className={styles.menuItemDropdownItemText}>{child.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Regular sub-menu for expanded state */}
        {hasSubItems && isExpanded && item.children && !isCollapsed ? (
          <div className={styles.menuItemSubList}>
            {item.children.map((child) => (
              <MenuItem
                key={child.label}
                isActive={isActive}
                isCollapsed={isCollapsed}
                isExpanded={isExpanded}
                item={child}
                level={level + 1}
                onExpandClick={onExpandClick}
                onMenuClick={onMenuClick}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

MenuItem.displayName = 'MenuItem';

export default MenuItem;
