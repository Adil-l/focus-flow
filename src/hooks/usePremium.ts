import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { startCheckout } from '@/lib/billing';

export interface UsePremiumResult {
  isPremium: boolean;
  loading: boolean;
  checkPremium: (action: string) => boolean;
}

/**
 * Thin ergonomic wrapper over useSubscription. Backed by REAL Supabase data
 * (no localStorage). `checkPremium` returns true when the user is entitled,
 * otherwise it surfaces an upgrade toast (keeping the old UX) whose action
 * kicks off a real Stripe Checkout. NOTE: this is UX gating only — the server
 * is the source of truth for entitlement.
 */
export function usePremium(): UsePremiumResult {
  const { isPremium, loading } = useSubscription();

  const checkPremium = (action: string): boolean => {
    if (isPremium) return true;

    toast.error('Plus Feature', {
      description: `Upgrade to Plus to use ${action}.`,
      action: {
        label: 'Upgrade',
        onClick: () => {
          void startCheckout();
        },
      },
    });
    return false;
  };

  return { isPremium, loading, checkPremium };
}
