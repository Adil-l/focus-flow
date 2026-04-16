import { usePremium } from '@/hooks/usePremium';
import { Gem } from 'lucide-react';

export const PremiumGate = ({ children, featureName }: { children: React.ReactNode, featureName: string }) => {
  const { isPremium } = usePremium();

  if (isPremium === true) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
        <div className="absolute inset-0 z-50 cursor-pointer flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all hover:bg-black/90" 
             onClick={(e) => { e.stopPropagation(); alert(`Upgrade para PLUS para acessar: ${featureName}`); }}>
            <Gem size={40} className="text-primary mb-3" />
            <span className="text-sm font-bold text-white bg-black/50 px-4 py-2 rounded-full border border-primary/30 shadow-xl">
              PLUS Feature
            </span>
        </div>
        <div className="opacity-10 pointer-events-none grayscale">
            {children}
        </div>
    </div>
  );
};
