import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useQuotes } from '@/hooks/useQuotes';

interface PresenceUser {
  presence_ref: string;
  user_id: string;
  email: string;
  status: 'focus' | 'break' | 'idle';
  last_seen: number;
}

export default function FocusRoom({ currentStatus }: { currentStatus: 'focus' | 'break' | 'idle' }) {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const { currentQuote } = useQuotes({ autoRefresh: true, refreshInterval: 30000 });

  useEffect(() => {
    if (!user) return;

    const channel = createClient().channel('focus_room', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat() as unknown as PresenceUser[];
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email?.split('@')[0] || (language === 'pt' ? 'Anônimo' : 'Anonymous'),
            status: currentStatus,
            last_seen: Date.now(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
    // `language` intentionally omitted: it only feeds an anonymous-name fallback
    // in the presence payload; re-subscribing the realtime channel on every
    // language toggle isn't worth it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentStatus]);

  if (!user) {
    return (
      <div className="bg-white/[0.04] rounded-xl p-4 text-center border border-white/[0.05]">
        <Users size={20} className="mx-auto mb-2 text-white/20" />
        <p className="text-xs text-white/40">{language === 'en' ? 'Log in to see who else is focusing' : 'Faça login para ver quem mais está focando'}</p>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    if (language === 'pt') {
      return status === 'focus' ? 'Foco Profundo' : status === 'break' ? 'No Intervalo' : 'Inativo';
    }
    return status === 'focus' ? 'Deep Work' : status === 'break' ? 'On Break' : 'Idle';
  };

  return (
    <div className="glass-panel p-6 w-[min(540px,92vw)] max-h-[85vh] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">{t.focusRoom}</h4>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">{onlineUsers.length} Online</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{
            scale: currentStatus === 'focus' ? [1, 1.2, 1] : 1,
            opacity: currentStatus === 'focus' ? [0.4, 0.8, 0.4] : 0.2,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`w-40 h-40 rounded-full flex items-center justify-center ${
            currentStatus === 'focus' ? 'bg-purple-500/20' : currentStatus === 'break' ? 'bg-green-500/20' : 'bg-white/5'
          }`}
        >
          <span className="text-4xl">
            {currentStatus === 'focus' ? '🎯' : currentStatus === 'break' ? '☕' : '⏳'}
          </span>
        </motion.div>
        <p className="text-sm font-medium text-white/60">
           {language === 'pt' 
             ? (currentStatus === 'focus' ? 'Foco profundo ativo' : currentStatus === 'break' ? 'Aproveite seu intervalo' : 'Aguardando timer')
             : (currentStatus === 'focus' ? 'Deep focus active' : currentStatus === 'break' ? 'Enjoy your break' : 'Waiting for timer')}
        </p>
        {currentStatus === 'focus' && currentQuote && (
          <div className="bg-white/5 rounded-lg p-4 max-w-md text-center">
            <p className="text-sm text-white/80 italic mb-2">{currentQuote.text}</p>
            <p className="text-xs text-white/50">- {currentQuote.author}</p>
          </div>
        )}
      </div>


      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
        <AnimatePresence>
          {onlineUsers.map((u) => (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.05]"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 border border-black ${
                    u.status === 'focus' ? 'bg-purple-500' : u.status === 'break' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/60">
                    {u.email[0].toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-white/80">{u.email}</span>
                  </div>
                  <div className="text-[9px] text-white/40 uppercase tracking-tight">
                    {getStatusText(u.status)}
                  </div>
                </div>
              </div>
              {u.status === 'focus' && (
                <Zap size={10} className="text-purple-400 animate-pulse" fill="currentColor" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
