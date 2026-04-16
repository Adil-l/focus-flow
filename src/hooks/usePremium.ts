import { useSubscription } from '@/stores/subscriptionStore';
import { toast } from 'sonner';

export function usePremium() {
  const { isPremium, upgradeToPremium } = useSubscription();

  const checkPremium = (action: string) => {
    if (isPremium) return true;
    
    toast.error('Premium Feature', {
      description: `Upgrade to Plus to use ${action}.`,
      action: {
        label: 'Upgrade Now',
        onClick: () => upgradeToPremium()
      }
    });
    return false;
  };

  return { isPremium, checkPremium };
}
