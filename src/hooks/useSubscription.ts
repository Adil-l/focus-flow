import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Subscription status values mirror the `status` column on public.subscriptions.
export type SubscriptionStatus =
  | 'free'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled';

const PREMIUM_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

/**
 * DEV-ONLY premium override. Lets you test Plus features locally without a
 * Stripe checkout or DB write. It is hard-gated behind `import.meta.env.DEV`,
 * so production builds ALWAYS ignore it — the server stays the source of truth.
 *
 * Enable it either way:
 *   - set VITE_DEV_PREMIUM=true in .env, or
 *   - run in the browser console:  localStorage.setItem('kipto:dev-premium','1')
 * Turn off with: localStorage.removeItem('kipto:dev-premium')
 */
function devPremiumEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  if (import.meta.env.VITE_DEV_PREMIUM === 'true') return true;
  try {
    return localStorage.getItem('kipto:dev-premium') === '1';
  } catch {
    return false;
  }
}

export interface UseSubscriptionResult {
  status: SubscriptionStatus;
  isPremium: boolean;
  currentPeriodEnd: Date | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

interface SubscriptionRow {
  status: string | null;
  current_period_end: string | null;
}

/**
 * Reads the current user's subscription row from Supabase. RLS guarantees a
 * user can only ever see their own row. A missing row (never subscribed) is
 * treated as `free`. Re-fetches whenever the authenticated user changes.
 */
export function useSubscription(): UseSubscriptionResult {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setStatus('free');
      setCurrentPeriodEnd(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await createClient()
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle<SubscriptionRow>();

    if (error || !data) {
      // No row (or unreadable) means the user has never subscribed -> free.
      setStatus('free');
      setCurrentPeriodEnd(null);
    } else {
      setStatus((data.status as SubscriptionStatus) ?? 'free');
      setCurrentPeriodEnd(
        data.current_period_end ? new Date(data.current_period_end) : null,
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Wait for auth to settle before deciding the subscription state.
    if (authLoading) {
      setLoading(true);
      return;
    }
    void fetchSubscription();
  }, [authLoading, fetchSubscription]);

  // Active/trialing only counts while the paid period hasn't lapsed (a missed
  // cancel webhook shouldn't grant Plus forever). No period end = lifetime.
  const notExpired = !currentPeriodEnd || currentPeriodEnd.getTime() > Date.now();
  const realPremium = PREMIUM_STATUSES.includes(status) && notExpired;

  // DEV override wins so you can exercise the full Plus UX locally.
  const devPremium = devPremiumEnabled();

  return {
    status: devPremium ? 'active' : status,
    isPremium: devPremium || realPremium,
    currentPeriodEnd,
    loading: devPremium ? false : loading,
    refresh: fetchSubscription,
  };
}
