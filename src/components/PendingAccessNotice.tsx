import React from 'react';
import { User } from '../types';
import { Lock, ShieldAlert, Sparkles, ArrowRight, UserCheck, BadgeCheck } from 'lucide-react';

interface PendingAccessNoticeProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onQuickSwitchToPhillip: () => void;
  language?: 'de' | 'en';
}

export const PendingAccessNotice: React.FC<PendingAccessNoticeProps> = ({
  currentUser,
  onOpenLogin,
  onQuickSwitchToPhillip,
  language = 'de',
}) => {
  if (currentUser && currentUser.status === 'approved') {
    return null; // No warning needed for released users!
  }

  const isDe = language === 'de';

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-800/60 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <h2 className="font-bold text-amber-200 text-sm sm:text-base flex items-center gap-1.5">
                <span>
                  {currentUser
                    ? (isDe ? `Willkommen ${currentUser.username}!` : `Welcome ${currentUser.username}!`)
                    : (isDe ? 'Registrierung & Freischaltung erforderlich' : 'Registration & Release Required')}
                </span>
                {currentUser?.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0 inline-block" title={isDe ? 'Verifiziertes Konto (Blauer Haken)' : 'Verified Account'} />
                )}
              </h2>
              {currentUser && (
                <span className="text-amber-200/80 text-xs">
                  • {isDe ? 'Wartet auf Freischaltung' : 'Pending Release'}
                </span>
              )}
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isDe ? 'Eingeschränkter Modus' : 'Restricted Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentUser
                ? (isDe
                  ? 'Deine Registrierungsanfrage wurde eingereicht. Bis Phillip Dev dein Konto freischaltet, sind Beiträge, Dateidownloads und Lesezeichen gesperrt.'
                  : 'Your registration request has been submitted. Until Phillip Dev approves ("releases") your account, posts, attached files, and bookmarks are locked.')
                : (isDe
                  ? 'Du surfst derzeit als Gast. Bitte melde dich an oder registriere ein Konto. Neu registrierte Benutzer benötigen eine Freischaltung durch Phillip Dev.'
                  : 'You are currently browsing as a guest. Please sign in or register an account. Newly registered users require release by Phillip Dev before downloads & posts are unlocked.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!currentUser ? (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>{isDe ? 'Einloggen' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
