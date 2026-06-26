import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { isTauri, webOrigin } from '@/lib/desktop';
import { openExternal } from '@/lib/openExternal';

// Client helpers that call the Stripe edge functions and send the user to the
// returned Stripe-hosted URL. Entitlement is enforced server-side (webhook +
// RLS). In the desktop app we open Stripe in the system browser, because the
// webview can't complete the redirect back; the webhook updates the DB and the
// app re-checks the subscription on focus.

const PRO_PRICE_ID: string | undefined = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;

async function goToStripe(url: string): Promise<void> {
  if (isTauri()) await openExternal(url);
  else window.location.assign(url);
}

/** Start a Stripe Checkout session and send the user to it. */
export async function startCheckout(priceId?: string): Promise<void> {
  track('checkout_started', { priceId: priceId ?? PRO_PRICE_ID });
  try {
    const { data, error } = await createClient().functions.invoke<{ url: string }>(
      'create-checkout',
      { body: { priceId: priceId ?? PRO_PRICE_ID, origin: webOrigin() } },
    );

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    await goToStripe(data.url);
    if (isTauri()) {
      toast('Finish checkout in your browser', {
        description: 'Your Plus activates automatically — reopen Settings to refresh.',
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start checkout';
    track('checkout_redirect_failed', { message });
    toast.error('Checkout failed', { description: message });
  }
}

/** Open the Stripe Billing Portal so the user can manage their subscription. */
export async function openBillingPortal(): Promise<void> {
  track('billing_portal_opened');
  try {
    const { data, error } = await createClient().functions.invoke<{ url: string }>(
      'customer-portal',
      { body: { origin: webOrigin() } },
    );

    if (error) throw error;
    if (!data?.url) throw new Error('No portal URL returned');

    await goToStripe(data.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not open billing portal';
    toast.error('Billing portal failed', { description: message });
  }
}
