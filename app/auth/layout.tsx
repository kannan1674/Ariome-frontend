'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClassicLayout } from './layouts/classic';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const isSplitAuth =
    pathname.includes('/signin') ||
    pathname.includes('/signup') ||
    pathname.includes('/Account-Verify') ||
    pathname.includes('/forgot-password') ||
    pathname.includes('/Verify-Otp') ||
    pathname.includes('/reset-password');

  return (
    <>
      {isSplitAuth ? children : <ClassicLayout>{children}</ClassicLayout>}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </>
  );
}
