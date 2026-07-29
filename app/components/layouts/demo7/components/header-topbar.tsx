'use client';

import { usePathname } from 'next/navigation';
import { UserDropdownMenu } from '@/app/components/partials/topbar/user-dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import LanguageSwitcher from '@/app/components/i18n/language-switcher';
import { ThemeToggle } from '@/app/components/theme/theme-toggle';
import { isAuthenticated as checkTokenAuth, getTokenFromCookies } from '@/lib/utils/tokenStorage';
import {
  PROFILE_PHOTO_CHANGED_EVENT,
  PROFILE_PHOTO_KEY,
  readProfilePhoto,
} from '@/lib/profilePhoto';
// import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';

const HeaderTopbar = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.authState);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Helper function to check for authToken cookie directly
  const checkAuthTokenCookie = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // Check for authToken cookie directly
      const cookies = document.cookie.split(';');
      const authTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('authToken=')
      );
      if (authTokenCookie && authTokenCookie.split('=')[1]?.trim()) {
        return true;
      }
      // Also check via getTokenFromCookies
      const token = getTokenFromCookies();
      return !!token || checkTokenAuth();
    } catch {
      return false;
    }
  };
  
  // Initialize hasToken by checking for token synchronously on client-side only
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return checkAuthTokenCookie();
    }
    return false;
  });
  
  useEffect(() => {
    setMounted(true);
    // Re-check for token after mount to ensure we have the latest state
    setHasToken(checkAuthTokenCookie());
    setProfilePhoto(readProfilePhoto() || user?.image || null);
  }, [user?.image]);

  useEffect(() => {
    const onPhotoChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ dataUrl?: string | null }>).detail;
      if (detail && 'dataUrl' in detail) {
        setProfilePhoto(detail.dataUrl || null);
        return;
      }
      setProfilePhoto(readProfilePhoto() || user?.image || null);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== PROFILE_PHOTO_KEY) return;
      setProfilePhoto(e.newValue || user?.image || null);
    };
    window.addEventListener(PROFILE_PHOTO_CHANGED_EVENT, onPhotoChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PROFILE_PHOTO_CHANGED_EVENT, onPhotoChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [user?.image]);

  useEffect(() => {
    // Update hasToken when Redux auth state changes
    if (isAuthenticated) {
      setHasToken(true);
    } else if (mounted) {
      // Re-check token when isAuthenticated becomes false (only on client)
      setHasToken(checkAuthTokenCookie());
    }
  }, [isAuthenticated, mounted]);
  
  // Periodically check for authToken cookie to ensure button stays hidden
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      const hasAuthToken = checkAuthTokenCookie();
      if (hasAuthToken !== hasToken) {
        setHasToken(hasAuthToken);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [mounted, hasToken]);

  // Debug: Log membership status
  useEffect(() => {
    if (mounted) {
      const membershipRefDebug = user?.Membership?.MembershipReference;
      const activeCheckDebug = mounted && membershipRefDebug && String(membershipRefDebug).trim() !== '';
      
    }
  }, [user, mounted]);
  
  const getInitials = () => {
    if (!mounted) return '';
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  // Show avatar if authenticated OR if token exists (for page refresh)
  // Wait for mounted check to complete before deciding what to show
  const shouldShowAvatar = mounted && (isAuthenticated || hasToken);
  
  // Check if user has active membership - show badge if MembershipReference exists
  const membershipRef = user?.Membership?.IsMembershipActive === true;
  const hasActiveMembership = mounted && 
                               user && 
                               user.Membership && 
                               membershipRef && 
                               String(membershipRef).trim() !== '';
  
  // Force render badge for testing - remove after confirming it works
  // const hasActiveMembership = true;
  
  // Don't render anything until we've checked for token (prevents flash of wrong state)
  if (!mounted) {
    return (
      <div className="flex items-center flex-wrap gap-2 lg:gap-3.5">
        <div className="w-8 h-8 bg-transparent" /> {/* Placeholder to prevent layout shift */}
      </div>
    );
  }
  
  return (
    <div className="flex items-center flex-wrap gap-2 lg:gap-3.5">
      <ThemeToggle compact />
      <LanguageSwitcher compact />
      {pathname.startsWith('/dashboard') ? (
        <div className="text-sm text-muted-foreground">{user?.firstName}</div>
      ) : shouldShowAvatar ? (
        <UserDropdownMenu 
          trigger={
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent">
              <div className="relative inline-block" style={{ marginRight: '9px' }}>
                <div className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 bg-[var(--ariome-surface)] text-sm font-semibold text-[var(--ariome-text)] ${hasActiveMembership ? 'border-[var(--ariome-gold)]' : 'border-[var(--ariome-border)]'}`}>
                  {profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhoto}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                {hasActiveMembership ? (
                  <div className="absolute -bottom-0.5 -right-1.5 bg-white rounded-full border-2 border-white z-20 shadow-lg flex items-center justify-center" style={{ width: '20px', height: '20px', boxSizing: 'border-box' }}>
                    <CheckCircle2 className="text-green-400" size={12} fill="green" strokeWidth={2} />
                  </div>
                ) : null}
              </div>
            </Button>
          } 
        />
      ) : null}
    </div>
  );
};

export { HeaderTopbar };
