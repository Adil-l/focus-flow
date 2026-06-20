import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Client helpers that call the Stripe edge functions and redirect the browser
// to the returned Stripe-hosted URL. These are UX entry points only — actual
// entitlement is enforced server-side via the webhook + RLS.

const PRO_PRICE_ID: string | undefined = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;

/** Start a Stripe Checkout session and redirect the user to it. */
export async function startCheckout(priceId?: string): Promise<void> {
  try {
    const { data, error } = await createClient().functions.invoke<{ url: string }>(
      'create-checkout',
      {
        body: {
          priceId: priceId ?? PRO_PRICE_ID,
          origin: window.location.origin,
        },
      },
    );

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    window.location.assign(data.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start checkout';
    toast.error('Checkout failed', { description: message });
  }
}

/** Open the Stripe Billing Portal so the user can manage their subscription. */
export async function openBillingPortal(): Promise<void> {
  try {
    const { data, error } = await createClient().functions.invoke<{ url: string }>(
      'customer-portal',
      { body: { origin: window.location.origin } },
    );

    if (error) throw error;
    if (!data?.url) throw new Error('No portal URL returned');

    window.location.assign(data.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not open billing portal';
    toast.error('Billing portal failed', { description: message });
  }
}
