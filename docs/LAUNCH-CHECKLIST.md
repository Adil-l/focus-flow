# Kipto — Launch checklist (owner actions)

Everything below needs **your** accounts/data. The code side is done and staged.
Work top-to-bottom; each item says exactly what to do and what I'll do after.

---

## 1) Go LIVE on Stripe  💳
Currently the app + backend run in **TEST** mode (validated end-to-end).

**You:**
1. In Stripe, switch to **Live mode**. Create the 3 products/prices and copy the **live price IDs** (Pro monthly, Pro annual, Lifetime).
2. Copy the live **Secret key** `sk_live_…` and **Publishable key** `pk_live_…`.
3. Create a **Live webhook** → endpoint `https://ybuibskdiynfoubqrczt.supabase.co/functions/v1/stripe-webhook`
   events: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
   Copy the **Signing secret** `whsec_…`.
4. Put the live values in **`.secrets/supabase-secrets.env`** (replace the test ones):
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, the 3 `STRIPE_*_PRICE_ID`.
5. Give me the **`pk_live_…`** (publishable — safe to paste in chat).

**Then I:** `supabase secrets set --env-file …` (re-run deploy script) · update `.env`
(`VITE_STRIPE_PUBLIC_KEY` + the 3 `VITE_STRIPE_*_PRICE_ID`) · rebuild the DMG ·
verify a live purchase flips `subscriptions.status=active` → premium unlocks.

---

## 2) AI on (optional)  🤖
**You:** put an `ANTHROPIC_API_KEY=sk-ant-…` in `.secrets/supabase-secrets.env`.
**Then I:** re-run the deploy (sets the secret) → the AI coach / task breakdown work.

---

## 3) Crisis helpline numbers  ☎️  (SAFETY)
Draft candidates are **staged but hidden** in `src/data/resources.ts` (every entry is
`placeholder: true`, so the SOS panel shows the honest emergency fallback, not them).

**You:** verify each number/URL is current, free where claimed, and region-correct
(US 988 · UK Samaritans 116 123 · PT 808 24 24 24 / 1414 · BR CVV 188 · etc).
**Then I (on your "confirmo"):** set `placeholder: false` on the verified entries →
they go live in the SOS panel. Never flip an unverified line.

---

## 4) Legal documents  📄
Fill these placeholders in `src/content/legal/*.md` **and** the `.pt.md` mirrors:
- `[Your Company]` — legal publisher name
- `[contact email]` — privacy/support contact
- `[jurisdiction]` — governing law (Terms of Service)
- `[date]` — "Last updated" date

Files: `terms-of-service(.pt).md`, `privacy-policy(.pt).md`, `system-permissions-consent(.pt).md`.
**Then I:** can wire them in for you once you give me the values (EN+PT together).

---

## 5) Rotate exposed secrets  🔐  (were pasted in chat earlier)
**You, in the dashboards:**
- Supabase → Settings → API → **roll the `service_role` key**.
- Supabase → Settings → Database → **reset the DB password**.
- Stripe → **revoke the old test keys** that were exposed (going live replaces them).
- Change the temp password for `gavumendeadilson@gmail.com`.
- Update `.secrets/` with any new values (stays local).
**Note:** functions auto-receive the new `service_role` (no code change). See `.secrets/README.md`.

---

## 6) Distribution polish (optional, later)  📦
- **Sign + notarize** the DMG (Apple Developer ID) → installs with no Gatekeeper
  warning. Runbook: `docs/RELEASE-macos.md` (everything's pre-configured).
- **Universal build** (Intel + Apple Silicon) if you want non-M-series Macs.

---

### Status (done by me)
- ✅ Backend deployed in TEST (5 edge functions + secrets); all tables/RPC exist.
- ✅ Checkout validated end-to-end (test card).
- ✅ Privacy policy updated (payments + leaderboard disclosed, EN/PT).
- ✅ Crisis candidates staged (hidden) for your verification.
- ✅ DMG packaging + signing scaffolding + reproducible deploy script.
