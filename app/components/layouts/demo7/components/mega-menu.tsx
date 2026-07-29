'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_MEGA } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';


const MegaMenu = React.memo(() => {
  const pathname = usePathname();
  const { isActive, hasActiveChild } = useMenu(pathname);
  const eventListItem = MENU_MEGA[0];
  const participantListItem = MENU_MEGA[1];
  const linkClass = `
    text-sm text-white/70 font-medium rounded-none px-0 border-b border-transparent
    hover:text-[#00a8e1] hover:bg-transparent 
    focus:text-[#00a8e1] focus:bg-transparent 
  data-[active=true]:text-[#00a8e1] data-[active=true]:bg-transparent data-[active=true]:border-[#00a8e1] data-[active=true]:border-b-2
    data-[state=open]:text-[#00a8e1] data-[state=open]:bg-transparent
  `;

  // Always show Home and My Events, even if MENU_MEGA is empty

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-7.5">
        {/* Home Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/home"
              className={cn(linkClass)}
              data-active={isActive('/home') || undefined}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/explore"
              className={cn(linkClass)}
              data-active={isActive('/explore') || undefined}
            >
              Explore
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Membership List */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/practice"
              className={cn(linkClass)}
              data-active={isActive('/practice') || undefined}
            >
              Practice
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Cookoo wall */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/journal"
              className={cn(linkClass)}
              data-active={isActive('/journal') || undefined}
            >
              Journal
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/circles"
              className={cn(linkClass)}
              data-active={isActive('/circles') || undefined}
            >
              Circles
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {eventListItem && (
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={eventListItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(eventListItem.path) || undefined}
            >
              {eventListItem.title}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        )}
        {participantListItem && (
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={participantListItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(participantListItem.path) || undefined}
            >
              {participantListItem.title}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        )}

      </NavigationMenuList>
    </NavigationMenu>
  );
});

MegaMenu.displayName = 'MegaMenu';

export { MegaMenu };
