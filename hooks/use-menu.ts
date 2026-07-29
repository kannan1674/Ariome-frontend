'use client';

import { useCallback } from 'react';

export interface MenuItem {
  title?: string;
  path?: string;
  children?: MenuItem[];
}

export function useMenu(pathname: string) {
  const isActive = useCallback(
    (path?: string): boolean => {
      if (!path) return false;
      return path === pathname || (path.length > 1 && pathname.startsWith(path));
    },
    [pathname]
  );

  const hasActiveChild = useCallback(
    (children?: MenuItem[]): boolean => {
      if (!children) return false;
      return children.some((child) => {
        if (isActive(child.path)) return true;
        if (child.children) return hasActiveChild(child.children);
        return false;
      });
    },
    [isActive]
  );

  const getCurrentItem = useCallback(
    (menuItems: MenuItem[]): MenuItem | null => {
      for (const item of menuItems) {
        if (isActive(item.path)) {
          return item;
        }
        if (item.children) {
          const found = getCurrentItem(item.children);
          if (found) return found;
        }
      }
      return null;
    },
    [isActive]
  );

  const getBreadcrumb = useCallback(
    (menuItems: MenuItem[]): MenuItem[] => {
      const breadcrumb: MenuItem[] = [];
      
      const findPath = (items: MenuItem[], targetPath: string): boolean => {
        for (const item of items) {
          breadcrumb.push(item);
          
          if (item.path === targetPath) {
            return true;
          }
          
          if (item.children && findPath(item.children, targetPath)) {
            return true;
          }
          
          breadcrumb.pop();
        }
        return false;
      };
      
      findPath(menuItems, pathname);
      return breadcrumb;
    },
    [pathname]
  );

  return {
    isActive,
    hasActiveChild,
    getCurrentItem,
    getBreadcrumb,
  };
}
