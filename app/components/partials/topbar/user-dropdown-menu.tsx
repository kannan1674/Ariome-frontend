import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProfileInfo, logout } from '@/lib/Actions/authActions';
import { getGender } from '@/lib/Actions/PublicActions';
import { revokeStravaConsent } from '@/lib/Actions/eventRegisterActions';
import {
  Moon,
  User,
  ChevronDown,
  X,
  Home,
  Calendar,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import EditProfileForm from '@/app/components/forms/edit-profile-form';
import ChangePasswordForm from '@/app/components/forms/change-password-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Bike, BarChart3, Info } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils/toast';
import { getTokenFromCookies, isAuthenticated as checkTokenAuth } from '@/lib/utils/tokenStorage';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authState);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  
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
  }, []);
  
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [preventAutoClose, setPreventAutoClose] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeNotes, setRevokeNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  
  const handleOpenRevokeModal = () => {
    setShowRevokeModal(true);
    setRevokeNotes('');
  };

  const handleCloseRevokeModal = () => {
    setShowRevokeModal(false);
    setRevokeNotes('');
    setShowConfirmDialog(false);
  };

  const handleRevokeConsentClick = () => {
    if (!revokeNotes.trim()) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmRevoke = async () => {
    if (isRevoking) return;
    
    setIsRevoking(true);
    setShowConfirmDialog(false);
    
    try {
      const result = await dispatch(revokeStravaConsent({ Notes: revokeNotes }) as any);
      
      // Extract success message from response
      // The response structure is: { HttpResponse: { StatusCode: 200, Message: "..." }, Content: "..." }
      const responseData = result?.payload || result;
      let message = 'Strava access revoked.';
      
      if (responseData?.HttpResponse?.Message) {
        message = responseData.HttpResponse.Message;
      } else if (responseData?.Message) {
        message = responseData.Message;
      }
      
      // Show success message
      showSuccess(message);
      
      // Close modal
      handleCloseRevokeModal();
      
      // Refresh page after successful revocation
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1500);
    } catch (error) {
      console.error('Error revoking Strava consent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke Strava consent';
      showError(errorMessage);
      setIsRevoking(false);
    }
  };

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


  useEffect(() => {
    if (!hasToken) return;
    dispatch(getProfileInfo());
  }, [dispatch, hasToken]);

  // Load gender data when edit profile modal opens
  useEffect(() => {
    if (showEditProfileModal) {
      dispatch(getGender());
    }
  }, [dispatch, showEditProfileModal]);



  const isLoggedIn = useMemo(() => {
    if (!user) {
      return false;
    }
    return Boolean(user?.token || user?.sessionId || user?.id || user?.name || user?.firstName);
  }, [user]);
  
  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      // Handle YYYY-MM-DD format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If not a valid date, try to parse as DD-MM-YYYY or return as is
        return dateString;
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Don't render anything until we've checked for token (prevents flash of wrong state)
  if (!mounted) {
    return (
      <div className="w-8 h-8 bg-transparent" />
    );
  }
  
  return (
    <>
      {isLoggedIn || hasToken ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-0" side={isMobile ? "top" : "bottom"} align="end" sideOffset={8}>
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
            
                {/* Name and Email */}
                <div className="flex flex-col min-w-0 flex-1">
             
                  <div className="text-base font-semibold text-gray-900 truncate">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || user?.firstName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || 'No email'}
                  </div>
                  {user?.Membership?.IsMembershipActive === true && (
                  <div className="text-xs text-green-500 truncate mt-1">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 inset-ring inset-ring-green-500/10">Cookoo Member</span>
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
       

   

              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                My Profile
                </Link>
              </DropdownMenuItem>

              {/* Revoke Strava Consent - Only show if authorized */}
              {user?.StravaAthleteId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer px-4 py-2"
                    onSelect={(e) => {
                      e.preventDefault();
                     // handleRevokeStravaConsent();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenRevokeModal();
                    }}
                  >
                    <X className="w-4 h-4" />
                    Revoke Strava Consent
                  </DropdownMenuItem>
                </>
              )}
            </div>
              
            {/* Logout Button */}
            <div className="px-4 py-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300"
                onClick={() => dispatch(logout())}
              >
                Log out
              </Button>
            </div>
        </DropdownMenuContent>
        </DropdownMenu>
      ) : null}


      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center max-h-[90vh] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto mx-4 pr-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
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
            
            {/* Content */}
            <div className="p-4">
              <EditProfileForm 
                onClose={() => setShowEditProfileModal(false)} 
                preventAutoClose={preventAutoClose}
                setPreventAutoClose={setPreventAutoClose}
                showEditProfileModal={showEditProfileModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
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
            
            {/* Content */}
            <div className="p-6">
              <ChangePasswordForm 
                onClose={() => setShowChangePasswordModal(false)} 
                preventAutoClose={preventAutoClose}
                setPreventAutoClose={setPreventAutoClose}
                showChangePasswordModal={showChangePasswordModal}
              />
            </div>
          </div>
        </div>
      )}

         {/* Revoke Strava Consent Modal - Outside DropdownMenu */}
    <Dialog open={showRevokeModal} onOpenChange={(open) => {
      if (!open) {
        // Allow closing when close button is clicked
        handleCloseRevokeModal();
      }
    }}>
        <DialogContent 
          className="max-w-2xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white !p-4 sm:!p-6 !left-1/2 !-translate-x-1/2 !top-1/2 !-translate-y-1/2"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>What Data is Shared</span>
            </DialogTitle>
          </DialogHeader>
          
          <DialogBody className="space-y-4 sm:space-y-6">
            {/* Data Sharing Cards */}
            <div className="space-y-3 sm:space-y-4">
              {/* Activity Data Card */}
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Bike className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-blue-700 mb-1 text-sm sm:text-base">Activity Data</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Distance, elevation, time, and route information from your Strava activities
                  </p>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-lg bg-green-50 border border-green-100">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black mb-1 text-sm sm:text-base">Profile Information</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Name, location, and basic profile details for leaderboard display
                  </p>
                </div>
              </div>

              {/* Leaderboard Participation Card */}
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-orange-700 mb-1 text-sm sm:text-base">Leaderboard Participation</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Your performance data visible to other participants in event leaderboards
                  </p>
                </div>
              </div>
            </div>

            {/* Reason for Revocation */}
            <div className="space-y-2 rounded-2xl sm:rounded-lg">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Reason for revocation <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Please provide a reason for revoking your consent..."
                value={revokeNotes}
                onChange={(e) => setRevokeNotes(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                required
              />
            </div>
          </DialogBody>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 !pt-5">
            <Button
              variant="outline"
              onClick={handleCloseRevokeModal}
              className="w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
            >
              CLOSE
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeConsentClick}
              disabled={!revokeNotes.trim() || isRevoking}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 order-1 sm:order-2 text-sm sm:text-base"
            >
              REVOKE CONSENT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md w-[90vw] sm:w-full bg-white !p-4 sm:!p-6 !left-1/2 !-translate-x-1/2 !top-1/2 !-translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirm Revocation</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Are you sure you want to revoke your Strava consent? This will disconnect your Strava account and you will need to re-authorize to use Strava features again.
            </p>
          </DialogBody>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={!revokeNotes.trim() || isRevoking}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
            >
              {isRevoking ? 'Revoking...' : 'Yes, Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
