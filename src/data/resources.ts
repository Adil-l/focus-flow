// Professional help & crisis resources for Focus Flow.
//
// =============================================================================
// SAFETY NOTICE — READ BEFORE SHIPPING
// =============================================================================
// The entries below are DRAFT CANDIDATES (well-known official lines) staged for
// review. They are ALL `placeholder: true`, so the SOS panel HIDES them and
// shows the honest emergency fallback instead — nothing here reaches users yet.
//
// To publish a line: a human must confirm the number/URL is current, free where
// claimed, and available in that region, then remove `placeholder: true` (or set
// it to false) for that entry. Shipping a fabricated/stale crisis number can cost
// someone help when they need it most — verify before flipping.
// =============================================================================

export type HelpResource = {
  category: string;
  name: string;
  contact: string;
  url?: string;
  note?: string;
  placeholder?: boolean; // true until a human verifies it (hidden while true)
};

/** True if this entry is still an unverified placeholder (never show as real). */
export function isPlaceholder(r: HelpResource): boolean {
  return r.placeholder === true;
}

/** True if a region has at least one human-verified (non-placeholder) resource. */
export function hasVerifiedResources(region: HelpRegion): boolean {
  return region.resources.some((r) => !isPlaceholder(r));
}

export type HelpRegion = {
  code: string;
  label: string;
  resources: HelpResource[];
};

/**
 * A short, compassionate disclaimer shown prominently above the resources.
 * Reassures the user that the app is not a substitute for professional care.
 */
export const HELP_DISCLAIMER: string =
  "Focus Flow is a tool, not a clinician. The services below are staffed by people trained to help, and reaching out is a sign of strength. If you're in immediate danger or thinking about harming yourself, please contact your local emergency services right now.";

// Display-order categories.
const C = {
  crisis: 'Mental health & crisis',
  gambling: 'Gambling support',
  sexual: 'Sexual compulsivity / problematic pornography',
  substance: 'Substance & other support',
} as const;

// Helper: a DRAFT entry — staged but hidden until a human verifies it.
// When verified, change `placeholder: true` → `false` (or delete the line).
function draft(category: string, name: string, contact: string, url: string): HelpResource {
  return { category, name, contact, url, note: 'Candidato — verificar antes de publicar.', placeholder: true };
}

/**
 * Available regions. INT is the default fallback for unlisted countries.
 * ⚠️ All entries are DRAFTS (placeholder:true) — verify, then flip to publish.
 */
export const HELP_REGIONS: HelpRegion[] = [
  {
    code: 'INT',
    label: 'International / choose your country',
    resources: [
      draft(C.crisis, 'Find A Helpline (global directory)', 'findahelpline.com', 'https://findahelpline.com'),
      draft(C.gambling, 'Gamblers Anonymous', 'gamblersanonymous.org', 'https://www.gamblersanonymous.org'),
      draft(C.sexual, 'Sex Addicts Anonymous', 'saa-recovery.org', 'https://saa-recovery.org'),
      draft(C.substance, 'Find A Helpline (global directory)', 'findahelpline.com', 'https://findahelpline.com'),
    ],
  },
  {
    code: 'US',
    label: 'United States',
    resources: [
      draft(C.crisis, '988 Suicide & Crisis Lifeline', 'Call or text 988', 'https://988lifeline.org'),
      draft(C.gambling, 'National Problem Gambling Helpline', '1-800-426-2537', 'https://www.ncpgambling.org'),
      draft(C.sexual, 'Sex Addicts Anonymous', 'saa-recovery.org', 'https://saa-recovery.org'),
      draft(C.substance, 'SAMHSA National Helpline', '1-800-662-4357', 'https://www.samhsa.gov/find-help/national-helpline'),
    ],
  },
  {
    code: 'UK',
    label: 'United Kingdom',
    resources: [
      draft(C.crisis, 'Samaritans', '116 123', 'https://www.samaritans.org'),
      draft(C.gambling, 'National Gambling Helpline (GamCare)', '0808 8020 133', 'https://www.gamcare.org.uk'),
      draft(C.sexual, 'Sex Addicts Anonymous (UK)', 'saa-recovery.org.uk', 'https://saa-recovery.org.uk'),
      draft(C.substance, 'FRANK', '0300 123 6600', 'https://www.talktofrank.com'),
    ],
  },
  {
    code: 'PT',
    label: 'Portugal',
    resources: [
      draft(C.crisis, 'SNS 24 (apoio psicológico)', '808 24 24 24', 'https://www.sns24.gov.pt'),
      draft(C.gambling, 'Linha Vida / SICAD', '1414', 'https://www.sicad.pt'),
      draft(C.sexual, 'Sex Addicts Anonymous (intl.)', 'saa-recovery.org', 'https://saa-recovery.org'),
      draft(C.substance, 'Linha Vida / SICAD', '1414', 'https://www.sicad.pt'),
    ],
  },
  {
    code: 'BR',
    label: 'Brazil',
    resources: [
      draft(C.crisis, 'CVV — Centro de Valorização da Vida', '188', 'https://www.cvv.org.br'),
      draft(C.gambling, 'Jogadores Anônimos', 'jogadoresanonimos.com.br', 'https://www.jogadoresanonimos.com.br'),
      draft(C.sexual, 'Dependentes de Sexo Anônimos', 'dsabrasil.org.br', 'https://www.dsabrasil.org.br'),
      draft(C.substance, 'CVV', '188', 'https://www.cvv.org.br'),
    ],
  },
];

/**
 * Return the region matching `code`, or the International default if no match.
 */
export function getRegion(code: string): HelpRegion {
  const found = HELP_REGIONS.find((r) => r.code === code);
  return found ?? HELP_REGIONS[0];
}
