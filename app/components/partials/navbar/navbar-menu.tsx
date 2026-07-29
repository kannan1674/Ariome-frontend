'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { MenuConfig } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';

const NavbarMenu = ({ items }: { items: MenuConfig }) => {
  const pathname = usePathname();
  const { isActive, hasActiveChild } = useMenu(pathname);

  const buildMenu = (items: MenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenubarMenu key={index}>
            <MenubarTrigger
              className={cn(
                'flex items-center gap-1.5 px-3 py-3.5 text-base',
                'rounded-none border-b-2 border-transparent bg-transparent!',
                'hover:text-primary hover:bg-transparent',
                'focus:text-primary focus:bg-transparent',
                'data-[state=open]:bg-transparent data-[state=open]:text-primary',
                (isActive(item.path) || hasActiveChild(item.children))
                  ? 'text-blue-600 border-blue-600 font-semibold' 
                  : 'text-indigo-600 border-indigo-600 font-semibold' 
              )}
              data-active={isActive(item.path) || undefined}
              data-here={hasActiveChild(item.children) || undefined}
            >
              {item.title}
              <ChevronDown className="ms-auto size-3.5" />
            </MenubarTrigger>
            <MenubarContent className="min-w-[175px]">
              {buildSubMenu(item.children)}
            </MenubarContent>
          </MenubarMenu>
        );
      } else {
        return (
          <MenubarMenu key={index}>
            <MenubarTrigger
              asChild
              className={cn(
                'flex items-center px-2 py-3.5 text-base px-3',
                'rounded-none border-b-2 bg-transparent!',
                'hover:text-primary hover:bg-transparent',
                'focus:text-primary focus:bg-transparent',
                isActive(item.path) 
                  ? 'border-blue-600' 
                  : 'border-indigo-600'
              )}
            >
              <Link
                href={item.path || ''}
                className={cn(
                  'flex items-center w-full text-base',
                  isActive(item.path) 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-indigo-600 font-semibold'
                )}
                data-active={isActive(item.path) || undefined}
                data-here={hasActiveChild(item.children) || undefined}
              >
                {item.title}
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
        );
      }
    });
  };

  const buildSubMenu = (items: MenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenubarSub key={index}>
            <MenubarSubTrigger
              data-active={isActive(item.path) || undefined}
              data-here={hasActiveChild(item.children) || undefined}
            >
              <span>{item.title}</span>
            </MenubarSubTrigger>
            <MenubarSubContent className="min-w-[175px]">
              {buildSubMenu(item.children)}
            </MenubarSubContent>
          </MenubarSub>
        );
      } else {
        return (
          <MenubarItem
            key={index}
            asChild
            data-active={isActive(item.path) || undefined}
            data-here={hasActiveChild(item.children) || undefined}
          >
            <Link href={item.path || ''}>{item.title}</Link>
          </MenubarItem>
        );
      }
    });
  };

  return (
    <div className="grid">
      <div className="kt-scrollable-x-auto">
        <Menubar className="flex items-stretch gap-3 border-none bg-transparent p-0 h-auto">
          {buildMenu(items)}
        </Menubar>
      </div>
    </div>
  );
};

export { NavbarMenu };
