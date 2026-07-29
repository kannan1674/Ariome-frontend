import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';

import {
  BetweenHorizontalStart,
  Coffee,
  CreditCard,
  FileText,
  Globe,
  Moon,
  Settings,
  Shield,
  User,
  UserCircle,
  Users,
  X,
  Bike,
  BarChart3,
  Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { logout } from '@/lib/Actions/authActions';
import { useTheme } from 'next-themes';
import { toAbsoluteUrl } from '@/lib/helpers';
import { clientApiCallWithToken } from '@/lib/clientApi';
import { getCookie } from '@/lib/utils/cookieUtils';
import { showSuccess, showError } from '@/lib/utils/toast';
import { getAthleteAuthorization, isAthleteStravaAuthorized } from '@/lib/Actions/HomeActions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export function DropdownMenuUser({ trigger }: { trigger: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authState);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeNotes, setRevokeNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
 
  const { theme, setTheme } = useTheme();

  const [stravaAuthorized, setStravaAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dispatch(getAthleteAuthorization() as any);
      if (cancelled || !res || (res as { error?: string }).error) return;
      setStravaAuthorized(isAthleteStravaAuthorized(res));
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const isAuthorized = stravaAuthorized;
  


  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

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
      showError('Please provide a reason for revoking your consent');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmRevoke = async () => {
    if (isRevoking) return;
    
    setShowConfirmDialog(false);
    setIsRevoking(true);
    
    try {
      const token = getCookie('authToken');
      if (!token) {
        showError('Authentication token not found. Please log in again.');
        setIsRevoking(false);
        return;
      }

      const response = await clientApiCallWithToken(
        '/auth/Strava-Revoke',
        token,
        { Notes: revokeNotes },
        'POST'
      );

      if (!response.ok) {
        throw new Error(response.error || 'Failed to revoke Strava consent');
      }

      showSuccess('Strava consent revoked successfully');

      // Close modal and refresh the page
      handleCloseRevokeModal();
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Error revoking Strava consent:', error);
      showError(error instanceof Error ? error.message : 'Failed to revoke Strava consent');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              className="w-9 h-9 rounded-full border border-border"
              src={toAbsoluteUrl(
                user?.image || '/media/avatars/300-2.png',
              )}
              alt="User avatar"
            />
            <div className="flex flex-col">
              <Link
                href="/account/home/get-started"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {user?.name || ''}
              </Link>
              <Link
                href="mailto:c.fisher@gmail.com"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {user?.email || ''}
              </Link>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link
            href="/public-profile/profiles/default"
            className="flex items-center gap-2"
          >
            <UserCircle />
            Public Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account/home/user-profile"
            className="flex items-center gap-2"
          >
            <User />
            My Profile
          </Link>
        </DropdownMenuItem>
        
        {/* Revoke Strava Consent - Only show if authorized */}
        {isAuthorized && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handleOpenRevokeModal();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOpenRevokeModal();
            }}
            disabled={isRevoking}
          >
            <X className="w-4 h-4" />
            Revoke Strava Consent
          </DropdownMenuItem>
        )}

        

        {/* My Account Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Settings />
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href="/account/home/get-started"
                className="flex items-center gap-2"
              >
                <Coffee />
                Get Started
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/home/user-profile"
                className="flex items-center gap-2"
              >
                <FileText />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/billing/basic"
                className="flex items-center gap-2"
              >
                <CreditCard />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/security/overview"
                className="flex items-center gap-2"
              >
                <Shield />
                Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/members/teams"
                className="flex items-center gap-2"
              >
                <Users />
                Members & Roles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/integrations"
                className="flex items-center gap-2"
              >
                <BetweenHorizontalStart />
                Integrations
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <Link
            href="https://devs.keenthemes.com"
            className="flex items-center gap-2"
          >
            <FileText />
            Dev Forum
          </Link>
        </DropdownMenuItem>

    

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event : any) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
                size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => dispatch(logout())}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    
    {/* Revoke Strava Consent Modal - Outside DropdownMenu */}
    <Dialog open={showRevokeModal} onOpenChange={setShowRevokeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Info className="w-5 h-5 text-blue-600" />
              What Data is Shared
            </DialogTitle>
          </DialogHeader>
          
          <DialogBody className="space-y-6">
            {/* Data Sharing Cards */}
            <div className="space-y-4">
              {/* Activity Data Card */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Bike className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-700 mb-1">Activity Data</h3>
                  <p className="text-sm text-gray-600">
                    Distance, elevation, time, and route information from your Strava activities
                  </p>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-700 mb-1">Profile Information</h3>
                  <p className="text-sm text-gray-600">
                    Name, location, and basic profile details for leaderboard display
                  </p>
                </div>
              </div>

              {/* Leaderboard Participation Card */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-700 mb-1">Leaderboard Participation</h3>
                  <p className="text-sm text-gray-600">
                    Your performance data visible to other participants in event leaderboards
                  </p>
                </div>
              </div>
            </div>

            {/* Reason for Revocation */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Reason for revocation <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Please provide a reason for revoking your consent..."
                value={revokeNotes}
                onChange={(e) => setRevokeNotes(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>
          </DialogBody>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCloseRevokeModal}
              className="w-full sm:w-auto"
            >
              CLOSE
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeConsentClick}
              disabled={!revokeNotes.trim() || isRevoking}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? 'Revoking...' : 'REVOKE CONSENT'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Revocation</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to revoke your Strava consent? This will disconnect your Strava account and you will need to re-authorize to use Strava features again.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? 'Revoking...' : 'Yes, Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
