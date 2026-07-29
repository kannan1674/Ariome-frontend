'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMobileCountryCode, getProfileInfo } from '@/lib/Actions/authActions';
import {
  ChevronDown,
  X,
  LoaderCircleIcon,
  Camera,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditProfileForm from '@/app/components/forms/edit-profile-form';
import ChangePasswordForm from '@/app/components/forms/change-password-form';
import { PremiumProfileUpload } from '@/components/profile/PremiumProfileUpload';
import { countryDialLabel, splitPhoneNumber } from '@/lib/i18n/countryFlag';
import Demo7Layout from '@/app/components/layouts/demo7/layout';
import { Card } from '@/components/ui/card';
import { isAuthenticated } from '@/lib/utils/tokenStorage';
import { PROFILE_PHOTO_KEY } from '@/lib/profilePhoto';



type MobileCountryOption = {
  Id: string;
  Country?: string;
  DialDisplay?: string;
  Code?: string;
  iso2?: string;
  CountryCode?: string;
  dialCode?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authState);
  const mobileDialCodes = useAppSelector((state) => state.authState.mobileDialCodes);
  const mobileCountryCodesRaw = useAppSelector((state) => state.authState.content);
  const mobileCountryCodes = useMemo(() => {
    if (Array.isArray(mobileDialCodes) && mobileDialCodes.length > 0) {
      return mobileDialCodes as MobileCountryOption[];
    }
    if (Array.isArray(mobileCountryCodesRaw)) {
      return mobileCountryCodesRaw as MobileCountryOption[];
    }
    if (Array.isArray((mobileCountryCodesRaw as { Content?: unknown[] })?.Content)) {
      return (mobileCountryCodesRaw as { Content: MobileCountryOption[] }).Content;
    }
    return [] as MobileCountryOption[];
  }, [mobileDialCodes, mobileCountryCodesRaw]);

  const phoneRaw = user?.PhoneNumber || user?.MobileNumber || '';
  const { countryId: phoneCountryId, national: phoneNational } = useMemo(
    () => splitPhoneNumber(phoneRaw, mobileCountryCodes),
    [phoneRaw, mobileCountryCodes],
  );
  const selectedPhoneCountry = useMemo(
    () =>
      mobileCountryCodes.find((c) => c.Id === phoneCountryId) ||
      mobileCountryCodes.find((c) => c.CountryCode === 'IN' || c.Code === '91'),
    [mobileCountryCodes, phoneCountryId],
  );
  const phoneDisplay = useMemo(() => {
    if (!phoneNational && !phoneRaw) return '-';
    const dial = countryDialLabel(selectedPhoneCountry);
    if (phoneNational) return `${dial} ${phoneNational}`;
    return phoneRaw || '-';
  }, [phoneNational, phoneRaw, selectedPhoneCountry]);

  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [preventAutoClose, setPreventAutoClose] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  /** Avoid SSR/client mismatch from cookie/localStorage auth checks. */
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_PHOTO_KEY);
      setProfilePhoto(saved || user?.image || null);
    } catch {
      setProfilePhoto(user?.image || null);
    }
  }, [user?.image]);

  // Get first letter for avatar
  const getInitials = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    let cancelled = false;
    setIsInitialLoad(true);
    dispatch(getProfileInfo()).finally(() => {
      if (!cancelled) setIsInitialLoad(false);
    });
    if (!mobileDialCodes || (Array.isArray(mobileDialCodes) && mobileDialCodes.length === 0)) {
      dispatch(getMobileCountryCode());
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [dispatch]);

  // Redirect if not authenticated (client-only; after mount)
  useEffect(() => {
    if (!hasMounted) return;
    const isLoggedIn = isAuthenticated() || user?.token || user?.sessionId || user?.id;
    if (!isLoggedIn) {
      router.push('/signin');
    }
  }, [hasMounted, user, router]);

  // Lock scroll when modals are open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const shouldLockScroll = showEditProfileModal || showChangePasswordModal;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    }

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    };
  }, [showEditProfileModal, showChangePasswordModal]);

  // Same shell on server + first client paint.
  // Do NOT gate on global authState.isLoading — dial-code / other auth requests would unmount the edit modal.
  if (!hasMounted || (isInitialLoad && !user)) {
    return (
      <Demo7Layout>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            <Card className="bg-white border-0 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden max-w-7xl mx-auto">
              <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
                <LoaderCircleIcon className="size-12 animate-spin text-indigo-600 mx-auto mb-4" />
              </div>
            </Card>
          </div>
        </div>
      </Demo7Layout>
    );
  }

  if (!user) {
    return (
      <Demo7Layout>
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            <Card className="bg-white border-0 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden max-w-7xl mx-auto">
              <div className="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-sm text-gray-600">Unable to load profile. Please try again.</p>
                <Button
                  type="button"
                  onClick={() => {
                    setIsInitialLoad(true);
                    dispatch(getProfileInfo()).finally(() => setIsInitialLoad(false));
                  }}
                  className="bg-violet-700 hover:bg-violet-800 text-white"
                >
                  Retry
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Demo7Layout>
    );
  }

  return (
    <Demo7Layout>
      <div className="relative min-h-screen">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
          {/* Main Card with Tabs */}
          <Card className="max-w-7xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:rounded-3xl">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 overflow-hidden border-b border-gray-200">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                {/* Left Side - Avatar + Name */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0">
                  {/* Avatar + upload control */}
                  <div className="flex flex-col items-center gap-2 sm:items-start">
                    <button
                      type="button"
                      onClick={() => setShowPhotoUpload(true)}
                      className="group relative flex-shrink-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-violet-500"
                      aria-label="Upload profile photo"
                    >
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white text-2xl font-semibold text-indigo-600 shadow-xl sm:h-20 sm:w-20 sm:text-3xl md:h-24 md:w-24 md:text-4xl">
                        {profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
                        ) : (
                          getInitials()
                        )}
                      </div>
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/35">
                        <Camera className="size-6 text-white opacity-0 drop-shadow transition group-hover:opacity-100 sm:size-7" />
                      </span>
                      <span className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border-2 border-white bg-violet-700 text-white shadow-md sm:size-9">
                        <Camera className="size-3.5 sm:size-4" />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhotoUpload(true)}
                      className="text-xs font-semibold text-violet-700 underline-offset-2 hover:text-violet-900 hover:underline sm:text-sm"
                    >
                      {profilePhoto ? 'Change photo' : 'Upload photo'}
                    </button>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-black text-start tracking-wide break-words">
                      {user?.firstName || ''} {user?.lastName || ''}
                    </div>
                    {user?.email ? (
                      <p className="mt-1 truncate text-sm text-gray-600">{user.email}</p>
                    ) : null}
                  </div>
                </div>

              </div>
            </div>

            <div className="w-full">
              <div className="p-3 sm:p-4 md:p-5 bg-[#fcfcfd]">
                {/* <div className="mb-4 flex flex-col gap-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-violet-900">Profile photo</p>
                    <p className="mt-0.5 text-xs text-violet-700/80 sm:text-sm">
                      Upload a JPG, PNG, or WEBP image (up to 5MB).
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowPhotoUpload(true)}
                    className="h-10 shrink-0 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"
                  >
                    <Camera className="mr-2 size-4" />
                    {profilePhoto ? 'Change photo' : 'Upload avatar'}
                  </Button>
                </div> */}
                {/* Info Cards — blood group, DOB, gender, address hidden */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {[
                    { label: 'First Name', value: user?.firstName || '-' },
                    { label: 'Last Name', value: user?.lastName || '-' },
                    { label: 'Email', value: user?.email || '-' },
                    { label: 'Phone Number', value: phoneDisplay },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-dashed border-gray-300 rounded-lg p-2 sm:p-2 bg-white"
                    >
                      <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                      <div className="text-lg font-normal text-black font-semibold font-sans break-words">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 pt-6">
                  <DropdownMenu open={isActionsDropdownOpen} onOpenChange={setIsActionsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="bg-violet-700 hover:bg-violet-800 text-white font-medium h-11 rounded-lg w-full sm:w-auto"
                      >
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side={isMobile ? "top" : "bottom"}
                      sideOffset={8}
                      className="w-48 cursor-pointer z-[60]"
                    >
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setIsActionsDropdownOpen(false);
                          setShowPhotoUpload(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Camera className="mr-2 size-4" />
                        Upload Profile Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setIsActionsDropdownOpen(false);
                          setShowEditProfileModal(true);
                        }}
                        className="cursor-pointer"
                      >
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setIsActionsDropdownOpen(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="cursor-pointer"
                      >
                        Change Password
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Premium profile photo upload modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setShowPhotoUpload(false)}
          />
          <div className="relative z-[10000] max-h-[90vh] w-full max-w-sm overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowPhotoUpload(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-slate-500 shadow hover:text-slate-800"
              aria-label="Close upload"
            >
              <X className="size-4" />
            </button>
            <PremiumProfileUpload
              initialUrl={profilePhoto}
              storageKey={PROFILE_PHOTO_KEY}
              onSaved={(url) => {
                setProfilePhoto(url);
                setShowPhotoUpload(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col mx-auto z-[10000]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white flex-shrink-0 rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="p-4 sm:p-6">
                <EditProfileForm 
                  onClose={() => setShowEditProfileModal(false)} 
                  preventAutoClose={preventAutoClose}
                  setPreventAutoClose={setPreventAutoClose}
                  showEditProfileModal={showEditProfileModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col mx-auto z-[10000]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="p-4 sm:p-6">
                <ChangePasswordForm 
                  onClose={() => setShowChangePasswordModal(false)} 
                  preventAutoClose={preventAutoClose}
                  setPreventAutoClose={setPreventAutoClose}
                  showChangePasswordModal={showChangePasswordModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Demo7Layout>
  );
}

