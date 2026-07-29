'use client';

import { generalSettings } from '@/config/general.config';
import { Container } from '@/components/common/container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer relative z-[1] hidden border-t border-[var(--ariome-border)] md:block">
      <Container>
        <div className="flex flex-col items-center justify-center gap-2 py-6 md:flex-row md:justify-between">
          <div className="flex gap-2 text-sm font-normal">
            <span className="text-[var(--ariome-text-faint)]">{currentYear} &copy;</span>
            <span className="ariome-label tracking-[0.2em]">Ariome</span>
          </div>
          {/* <div className="flex order-1 md:order-2 justify-end font-normal text-sm">
            <span className="text-gray-500">
              Powered by <a href="https://yeppobooking.com/" target="_blank" className="text-secondary-foreground hover:text-primary">Yeppo Booking</a>
            </span> 
          </div> */}
        </div>
      </Container>
    </footer>
  );
}
