import { useState, useCallback } from 'react';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export interface SubscriptionState {
  isPremium: boolean;
  premiumSince: number | null;
}

const DEFAULT: SubscriptionState = {
  isPremium: false,
  premiumSince: null,
};

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(() =>
    loadJSON('pomo:subscription', DEFAULT)
  );

  const setPremium = useCallback((status: boolean) => {
    const next = {
      isPremium: status,
      premiumSince: status ? Date.now() : null,
    };
    setState(next);
    saveJSON('pomo:subscription', next);
  }, [setState]);

  const upgradeToPremium = () => {
    setPremium(true);
  };

  const resetPremium = () => {
    setPremium(false);
  };

  return {
    ...state,
    setPremium,
    resetPremium,
  };
}
