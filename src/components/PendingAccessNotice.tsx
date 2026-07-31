import React from 'react';
import { User } from '../types';
import { Lock, ShieldAlert, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

interface PendingAccessNoticeProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onQuickSwitchToPhillip: () => void;
}

export const PendingAccessNotice: React.FC<PendingAccessNoticeProps> = ({
  currentUser,
  onOpenLogin,
  onQuickSwitchToPhillip,
}) => {
  if (currentUser && currentUser.status === 'approved') {
    return null; // No warning needed for released users!
  }

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-800/60 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-amber-200 text-sm sm:text-base">
                {currentUser ? `Welcome ${currentUser.username}! Account Pending Release` : 'Registration & Release Required'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Restricted Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentUser
                ? 'Your registration request has been submitted. Until Phillip Dev approves ("releases") your account, posts, attached files, and bookmarks are locked.'
                : 'You are currently browsing as a guest. Please sign in or register an account. Newly registered users require release by Phillip Dev before downloads & posts are unlocked.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!currentUser ? (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Einloggen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
