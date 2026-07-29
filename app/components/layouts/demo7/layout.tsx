'use client';

import { ReactNode, useEffect } from 'react';
import { useBodyClass } from '@/hooks/use-body-class';
import { useSettings } from '@/providers/settings-provider';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Demo7Layout({ children }: { children: ReactNode }) {
  const { setOption } = useSettings();

  useBodyClass(`
    [--header-height-default:75px]
    data-[sticky-header=on]:[--header-height:75px]
    [--header-height:var(--header-height-default)]	
    [--header-height-mobile:75px]	
  `);

  useEffect(() => {
    setOption('layout', 'demo7');
  }, [setOption]);

  return (
    <>
      <div className="relative flex min-h-screen grow flex-col in-data-[sticky-header=on]:pt-(--header-height-default)">
        <Header />

        <div className="grow text-[var(--ariome-text)]" role="content">
          {children}
        </div>

        <Footer />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={1}
      />
    </>
  );
}
