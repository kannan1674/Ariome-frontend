import { ReactNode } from 'react';
import { Fraunces, Inter } from 'next/font/google';
import { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@/providers/auth-provider';
import { ReduxProvider } from '@/providers/redux-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { LocaleProvider } from '@/lib/i18n/locale-context';

import '@/css/styles.css';
import '@/css/ariome-elegant.css';
import '@/components/keenicons/assets/styles.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Ariome',
    default: 'Ariome',
  },
  icons: {
    icon: '/media/app/fav-icon.png',
    apple: '/media/app/apple-touch-icon.png',
  },
};

/** Avoid flash: apply theme before paint from next-themes storage. */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("nextjs-theme");
    var mode = "light";
    if (stored === "dark" || stored === "light") {
      mode = stored;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      mode = "dark";
    }
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute(
      "data-theme-mode",
      stored === "dark" || stored === "light" ? stored : "system"
    );
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      data-theme-mode="system"
      suppressHydrationWarning
    >
      <body
        className={`ariome-app antialiased flex min-h-screen w-full flex-col ${inter.variable} ${fraunces.variable} ${inter.className}`}
      >
        <Script id="data-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <LocaleProvider>
            <ReduxProvider>
              <AuthProvider>
                <SettingsProvider>{children}</SettingsProvider>
              </AuthProvider>
            </ReduxProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
