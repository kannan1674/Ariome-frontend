'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import { HeaderLogo } from './header-logo';
import { HeaderTopbar } from './header-topbar';

const Header = React.memo(() => {
  const { settings } = useSettings();
  const scrollPosition = useScrollPosition();
  const [headerStickyOn, setHeaderStickyOn] = useState(false);

  const stickyOffset = useMemo(() => {
    return settings.layouts.demo2.headerStickyOffset;
  }, [settings.layouts.demo2.headerStickyOffset]);

  useEffect(() => {
    const isSticky = scrollPosition > stickyOffset;
    setHeaderStickyOn(isSticky);
  }, [scrollPosition, stickyOffset]);

  useEffect(() => {
    if (headerStickyOn === true) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerStickyOn]);

  return (
    <header
      className={cn(
        'relative z-50 flex shrink-0 items-center border-b border-[var(--ariome-border)] py-3 transition-all lg:h-[4.25rem] lg:py-0',
        'bg-white/90 backdrop-blur-xl',
        headerStickyOn &&
          'fixed top-0 right-0 left-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)] pe-[var(--removed-body-scroll-bar-size,0px)]',
      )}
    >
      <Container className="flex w-full flex-wrap items-center gap-3 lg:gap-6">
        <HeaderLogo />
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <HeaderTopbar />
        </div>
      </Container>
    </header>
  );
});

Header.displayName = 'Header';

export { Header };
