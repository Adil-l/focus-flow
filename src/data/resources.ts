// Professional help & crisis resources for Focus Flow.
//
// =============================================================================
// SAFETY NOTICE — READ BEFORE SHIPPING
// =============================================================================
// Every `contact` value below is a PLACEHOLDER. None of these are real phone
// numbers, hotlines, or URLs. They MUST be replaced by a human with verified,
// region-appropriate details from official sources before this feature is
// shown to users. Shipping a fabricated crisis number can cost someone help
// when they need it most.
//
// For each entry: confirm the number/URL is current, free where claimed, and
// available in the listed region, then remove the "TODO: human-verify" comment.
// =============================================================================

export type HelpResource = {
  category: string;
  name: string;
  contact: string;
  url?: string;
  note?: string;
};

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

// The four categories every region must cover, in display order.
const CATEGORIES = [
  'Mental health & crisis',
  'Gambling support',
  'Sexual compulsivity / problematic pornography',
  'Substance & other support',
] as const;

/**
 * Build the standard set of 4 placeholder resources for a region.
 * TODO: human-verify before shipping — replace every `contact`/`url` below
 * with a real, region-appropriate, verified service.
 */
function placeholderResources(regionLabel: string): HelpResource[] {
  return CATEGORIES.map((category) => ({
    category,
    // TODO: human-verify before shipping — add the real service name.
    name: 'Add a verified service name',
    // TODO: human-verify before shipping — add a real number/contact for this region.
    contact: `Add a verified contact for ${regionLabel}`,
    // TODO: human-verify before shipping — add the official website URL.
    url: '',
    note: 'Placeholder entry — a human must verify before this is shown to users.',
  }));
}

/**
 * Available regions. The International ("INT") entry is the default fallback
 * for users whose country isn't listed yet.
 *
 * TODO: human-verify before shipping — every resource here is a placeholder.
 */
export const HELP_REGIONS: HelpRegion[] = [
  {
    code: 'INT',
    label: 'International / choose your country',
    resources: placeholderResources('your region'),
  },
  {
    code: 'US',
    label: 'United States',
    resources: placeholderResources('the United States'),
  },
  {
    code: 'UK',
    label: 'United Kingdom',
    resources: placeholderResources('the United Kingdom'),
  },
  {
    code: 'PT',
    label: 'Portugal',
    resources: placeholderResources('Portugal'),
  },
  {
    code: 'BR',
    label: 'Brazil',
    resources: placeholderResources('Brazil'),
  },
];

/**
 * Return the region matching `code`, or the International default if no match.
 */
export function getRegion(code: string): HelpRegion {
  const found = HELP_REGIONS.find((r) => r.code === code);
  return found ?? HELP_REGIONS[0];
}
