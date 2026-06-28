#!/usr/bin/env bash
# Deploy Kipto's Supabase backend: migrations + edge functions + secrets.
#
# Prereqs:
#   1. supabase CLI installed   (brew install supabase/tap/supabase)
#   2. supabase login           (interactive — paste your access token)
#   3. .secrets/supabase-secrets.env filled in (see the .example)
#
# DB password: `db push` connects to the live Postgres and may prompt for the
# database password. Export it first to avoid the prompt:
#   export SUPABASE_DB_PASSWORD='...'
#
# Usage:  ./scripts/deploy-supabase.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="ybuibskdiynfoubqrczt"
SECRETS=".secrets/supabase-secrets.env"
FUNCTIONS="create-checkout customer-portal stripe-webhook ai-coach ai-task-breakdown"

command -v supabase >/dev/null || { echo "❌ supabase CLI not found (brew install supabase/tap/supabase)"; exit 1; }

echo "🔗 Linking project $PROJECT_REF…"
supabase link --project-ref "$PROJECT_REF"

echo "🗄  Applying migrations (db push)…"
if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  supabase db push --password "$SUPABASE_DB_PASSWORD"
else
  supabase db push
fi

echo "🚀 Deploying edge functions: $FUNCTIONS"
# shellcheck disable=SC2086
supabase functions deploy $FUNCTIONS

if [ -f "$SECRETS" ]; then
  echo "🔐 Setting function secrets from $SECRETS…"
  supabase secrets set --env-file "$SECRETS"
else
  echo "⚠️  $SECRETS not found — skipped. Fill it in (see .example) then run:"
  echo "    supabase secrets set --env-file $SECRETS"
fi

echo ""
echo "✅ Deploy done. Verify:"
echo "   supabase functions list"
echo "   Stripe webhook → https://${PROJECT_REF}.supabase.co/functions/v1/stripe-webhook"
