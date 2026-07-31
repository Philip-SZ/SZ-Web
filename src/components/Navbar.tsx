import React from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, UserCheck, LogOut, PlusCircle, Bookmark, Layers, Settings } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  pendingCount: number;
  activeTab: 'posts' | 'bookmarks' | 'approvals';
  onTabChange: (tab: 'posts' | 'bookmarks' | 'approvals') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPostCreator: () => void;
  onQuickSwitchUser: (username: string) => void;
  onOpenSettings: () => void;
  isLight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pendingCount,
  activeTab,
  onTabChange,
  onOpenLogin,
  onLogout,
  onOpenPostCreator,
  onQuickSwitchUser,
  onOpenSettings,
  isLight = false,
}) => {
  const isPhillipDev = currentUser?.role === 'admin' || currentUser?.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';
  const isApproved = currentUser?.status === 'approved';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-base sm:text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                SZ <span className="text-indigo-500 font-medium">Portal</span>
              </h1>
            </div>
            <p className={`text-xs hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Jeden Tag neue Nachrichten
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        {currentUser && (
          <nav className={`flex items-center gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <button
              onClick={() => onTabChange('posts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'posts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Posts</span>
            </button>

            {/* Bookmarks Tab - only active for released users */}
            <button
              onClick={() => onTabChange('bookmarks')}
              disabled={!isApproved}
              title={!isApproved ? 'Requires account release by Phillip Dev' : 'Saved Bookmarks'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : !isApproved
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {!isApproved ? <Lock className="w-3 h-3 text-amber-500/70" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>Bookmarks</span>
            </button>

            {/* Approvals Tab - Phillip Dev Admin only */}
            {isPhillipDev && (
              <button
                onClick={() => onTabChange('approvals')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'approvals'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Approvals</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Einstellungen"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isPhillipDev && (
            <button
              onClick={onOpenPostCreator}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Post</span>
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              {/* Account Pill with Status */}
              <div className={`flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{currentUser.username}</span>
                    {isPhillipDev ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 rounded-md uppercase tracking-wider">
                        👑 Admin
                      </span>
                    ) : isApproved ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 rounded-md uppercase tracking-wider">
                        Freigeschaltet
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Ausstehend
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLight ? 'hover:bg-rose-100 text-slate-500 hover:text-rose-600' : 'hover:bg-rose-950/50 text-slate-400 hover:text-rose-300'
                  }`}
                  title="Ausloggen"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              Einloggen
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
