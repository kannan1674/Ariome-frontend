import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
export function ClassicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSignupPage = pathname?.toLowerCase().includes('/signup');

  const cardClasses = [
    'flex flex-col items-center justify-center rounded-[16px] w-full',
    isSignupPage ? 'sm:min-w-[620px] sm:max-w-[720px]' : 'sm:max-w-[500px]',
    isSignupPage ? 'overflow-hidden bg-white max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)]' : 'overflow-visible bg-white'
  ].join(' ');

  const cardContentClasses = isSignupPage
    ? 'flex flex-col items-stretch justify-start w-full gap-6 p-6 sm:p-10 overflow-y-auto max-h-full'
    : 'flex flex-col items-stretch justify-center w-full p-6 sm:p-12';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .auth-bg-container {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-image: url('/media/images/2600x1200/CooKoo_mobile.png');
        }
        @media (min-width: 640px) {
          .auth-bg-container {
            background-image: url('/media/images/2600x1200/CooKoo_desktop.png');
          }
        }
      `}} />
      <div className="auth-bg-container fixed inset-0 w-full h-full min-h-screen ">
        <div className="relative w-full h-full min-h-screen flex items-center justify-center py-6 px-4 md:items-center md:justify-end md:pr-[5%] md:pt-4 md:pb-4">
          <div className="w-full flex justify-center md:justify-end">
            <Card className={cardClasses}>
              <CardContent className={cardContentClasses}>{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
