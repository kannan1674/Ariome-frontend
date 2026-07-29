'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Demo7Layout from '@/app/components/layouts/demo7/layout';
import { StreamingShell } from '@/app/components/streaming';
import {
  HomeEventsSection,
  HomeHero,
  HomeJourneyStats,
  HomeMoodCheck,
  HomePromoModal,
  HomeQuickActions,
  HomeReflection,
} from '@/app/components/home';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  eventsGet,
  getAthleteAuthorization,
  isAthleteStravaAuthorized,
  signinHomeGet,
} from '@/lib/Actions/HomeActions';
import { clearEvents, setLoadingComplete } from '@/lib/features/auth/homeSlice';
import { getTokenFromCookies } from '@/lib/utils/tokenStorage';
import { showError } from '@/lib/utils/toast';
import { ChevronRight, Crown, Key, LoaderCircleIcon } from 'lucide-react';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { eventsByType, loading } = useAppSelector((state: { homeState: { eventsByType: { ongoing: Record<string, unknown>[]; upcoming: Record<string, unknown>[]; past: Record<string, unknown>[] }; loading: boolean } }) => state.homeState);
  const { user, isLoading: authLoading } = useAppSelector((state) => state.authState);

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? !!getTokenFromCookies() : false,
  );
  const [hasCheckedToken, setHasCheckedToken] = useState(() => typeof window !== 'undefined');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [stravaConsent, setStravaConsent] = useState(false);
  const [athleteAuthData, setAthleteAuthData] = useState<Record<string, unknown> | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const explorerName =
    (user?.firstName && String(user.firstName).trim()) ||
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    'Explorer';

  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const isAuthorized = isAthleteStravaAuthorized(athleteAuthData);
  const hasEvents =
    eventsByType.ongoing.length + eventsByType.upcoming.length + eventsByType.past.length > 0;

  useEffect(() => {
    const updateAuth = () => {
      setIsLoggedIn(!!getTokenFromCookies());
      setHasCheckedToken(true);
    };
    updateAuth();
    window.addEventListener('focus', updateAuth);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateAuth();
    });
    return () => {
      window.removeEventListener('focus', updateAuth);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      const result = (await dispatch(getAthleteAuthorization() as never)) as
        | { error?: string }
        | Record<string, unknown>;
      if (result && !('error' in result && result.error)) {
        setAthleteAuthData(result as Record<string, unknown>);
      }
    };
    void load();
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsInitialLoad(true);
      dispatch(clearEvents());
      const types = ['ongoing', 'upcoming', 'past'] as const;
      const clubId = process.env.NEXT_PUBLIC_CLUB_ID || '';
      await Promise.all(
        types.map((type, index) =>
          dispatch(
            (isLoggedIn ? signinHomeGet : eventsGet)({
              PageNo: 1,
              PageSize: 10,
              Keyword: '',
              Type: type,
              ClubId: clubId,
              append: index > 0,
            }) as never,
          ),
        ),
      );
      dispatch(setLoadingComplete());
      setIsInitialLoad(false);
    };
    void fetchEvents();
  }, [dispatch, isLoggedIn]);

  const showMembership =
    !loading &&
    !isInitialLoad &&
    hasCheckedToken &&
    hasEvents &&
    (!isLoggedIn || (!authLoading && user?.Membership?.IsMembershipActive !== true));

  const showStrava =
    isLoggedIn && !isAuthorized && hasEvents && !loading && !isInitialLoad;

  const handleStravaAuthorize = () => {
    const stravaClientId =
      (athleteAuthData?.Content as { StravaClientId?: string })?.StravaClientId ||
      (athleteAuthData?.StravaClientId as string) ||
      (athleteAuthData?.data as { StravaClientId?: string })?.StravaClientId;

    if (!stravaClientId) {
      showError('Strava client ID not available. Please try again later.');
      return;
    }

    const redirectUri =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/callback?callbackUrl=${encodeURIComponent('/home')}`
        : '/api/auth/callback';

    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.set('client_id', String(stravaClientId));
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'read,activity:read_all,profile:read_all');
    window.location.href = url.toString();
  };

  const isLoadingEvents = loading || isInitialLoad;

  return (
    <Demo7Layout>
      <HomePromoModal
        userId={user?.id || user?.email || user?.PhoneNumber || null}
        enabled={
          hasCheckedToken &&
          (isLoggedIn || !!user?.id || !!user?.token || !!user?.email)
        }
      />
      <StreamingShell activeNav="home" wide className="pt-2 md:pb-8">
        <div className="space-y-8 sm:space-y-10">
          <HomeHero
            name={explorerName}
            dateLabel={todayLabel}
            selectedMood={selectedMoodId}
          />

          <HomeQuickActions />

          <HomeMoodCheck selectedId={selectedMoodId} onSelect={setSelectedMoodId} />

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <HomeReflection />
            <HomeJourneyStats />
          </div>

          {showMembership && (
            <section className="ariome-glass rounded-[var(--ariome-radius-lg)] border border-[var(--ariome-gold)]/20 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ariome-gold-muted)] ring-1 ring-[var(--ariome-gold)]/40">
                    <Crown className="size-6 text-[var(--ariome-gold)]" />
                  </span>
                  <div>
                    <p className="ariome-label text-[var(--ariome-gold)]">Premium</p>
                    <h2 className="mt-1 text-lg font-semibold text-[var(--ariome-text)]">Unlock full wellness library</h2>
                    <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">
                      Exclusive films, guided practices, and community perks.
                    </p>
                  </div>
                </div>
                <Button asChild className="ariome-btn-primary h-11 shrink-0 rounded-full px-6">
                  <Link href="/membership">
                    Join now
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </section>
          )}

          {showStrava && (
            <section className="ariome-glass rounded-[var(--ariome-radius-lg)] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 ring-1 ring-orange-400/25">
                  <Key className="size-5 text-orange-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-[var(--ariome-text)]">Connect Strava</h2>
                  <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">
                    Link your activity for event leaderboards (optional).
                  </p>
                  <label className="mt-4 flex cursor-pointer items-start gap-3">
                    <Checkbox
                      id="strava-consent"
                      checked={stravaConsent}
                      onCheckedChange={(c) => setStravaConsent(c === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-relaxed text-[var(--ariome-text-faint)]">
                      I agree to share my Strava activity data for club event leaderboards.
                    </span>
                  </label>
                  {stravaConsent && (
                    <Button
                      type="button"
                      onClick={handleStravaAuthorize}
                      className="mt-4 h-10 rounded-full bg-purple-600 px-5 text-sm hover:bg-purple-700"
                    >
                      Authorize Strava
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {isLoadingEvents ? (
            <div className="flex justify-center py-16">
              <LoaderCircleIcon className="size-10 animate-spin text-[var(--ariome-gold)]" />
            </div>
          ) : (
            <HomeEventsSection
              ongoing={eventsByType.ongoing}
              upcoming={eventsByType.upcoming}
              past={eventsByType.past}
            />
          )}
        </div>
      </StreamingShell>
    </Demo7Layout>
  );
};

export default HomePage;
