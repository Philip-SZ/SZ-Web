import React from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, UserCheck, LogOut, PlusCircle, Bookmark, Layers, Settings, BadgeCheck, Bell, Calendar, Sparkles } from 'lucide-react';
import { getNotifications, canApproveUsers, canCreateMainPost, isFullAdmin } from '../storage';

export type TabType = 'posts' | 'bookmarks' | 'notifications' | 'events' | 'approvals' | 'creator';

interface NavbarProps {
  currentUser: User | null;
  pendingCount: number;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPostCreator: () => void;
  onQuickSwitchUser: (username: string) => void;
  onOpenSettings: () => void;
  onOpenMyProfile?: () => void;
  isLight?: boolean;
  language?: 'de' | 'en';
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
  onOpenMyProfile,
  isLight = false,
  language = 'de',
}) => {
  const isDe = language === 'de';
  const canApprove = canApproveUsers(currentUser);
  const canCreate = canCreateMainPost(currentUser);
  const isApproved = currentUser?.status === 'approved';

  const unreadNotifCount = currentUser ? getNotifications(currentUser.id).filter(n => !n.read).length : 0;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-bold text-sm sm:text-lg tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                SZ <span className="text-indigo-500 font-medium">Portal</span>
              </h1>
            </div>
            <p className={`text-[10px] sm:text-xs hidden md:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isDe ? 'Jeden Tag neue Nachrichten' : 'New updates every day'}
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Scrollable on mobile) */}
        <div className="overflow-x-auto no-scrollbar py-1 px-1 max-w-full">
          <nav className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 whitespace-nowrap ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            {/* Posts Tab */}
            <button
              onClick={() => onTabChange('posts')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'posts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{isDe ? 'Beiträge' : 'Posts'}</span>
            </button>

            {/* Bookmarks Tab - only active for released users */}
            {currentUser && (
              <button
                onClick={() => onTabChange('bookmarks')}
                disabled={!isApproved}
                title={!isApproved ? (isDe ? 'Erfordert Freischaltung durch Phillip Dev' : 'Requires account release by Phillip Dev') : (isDe ? 'Gespeicherte Lesezeichen' : 'Saved Bookmarks')}
                className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'bookmarks'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : !isApproved
                    ? 'text-slate-400 cursor-not-allowed opacity-60'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {!isApproved ? <Lock className="w-3 h-3 text-amber-500/70 shrink-0" /> : <Bookmark className="w-3.5 h-3.5 shrink-0" />}
                <span>{isDe ? 'Lesezeichen' : 'Bookmarks'}</span>
              </button>
            )}

            {/* Notifications Tab */}
            <button
              onClick={() => onTabChange('notifications')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span>{isDe ? 'Mitteilungen' : 'Notifications'}</span>
              {unreadNotifCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-sky-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Events & Updates Tab */}
            <button
              onClick={() => onTabChange('events')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{isDe ? 'Events' : 'Events'}</span>
            </button>

            {/* Creator Tab */}
            <button
              onClick={() => onTabChange('creator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'creator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isDe ? 'Creator-Tab' : 'Creator Tab'}</span>
            </button>

            {/* Approvals Tab - Developers & Admins */}
            {canApprove && (
              <button
                onClick={() => onTabChange('approvals')}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'approvals'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{isDe ? 'Freigaben' : 'Approvals'}</span>
                {pendingCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isDe ? 'Einstellungen' : 'Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>

          {canCreate && (
            <button
              onClick={onOpenPostCreator}
              className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isDe ? 'Neuer Beitrag' : 'New Post'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              {/* Account Pill with Status & Profile Trigger */}
              <div className={`flex items-center gap-1.5 sm:gap-2 p-1 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <button
                  onClick={() => onOpenMyProfile && onOpenMyProfile()}
                  className="flex items-center gap-1.5 max-w-[140px] sm:max-w-none truncate hover:text-indigo-400 transition-colors cursor-pointer group"
                  title={isDe ? 'Mein Profil anzeigen' : 'View My Profile'}
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-200 group-hover:text-indigo-400'}`}>
                    {currentUser.username}
                  </span>
                  {currentUser.isVerified && (
                    <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 fill-sky-400/20 shrink-0" title={isDe ? "Verifiziertes Konto" : "Verified Account"} />
                  )}
                </button>

                <button
                  onClick={onLogout}
                  className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                    isLight ? 'hover:bg-rose-100 text-slate-500 hover:text-rose-600' : 'hover:bg-rose-950/50 text-slate-400 hover:text-rose-300'
                  }`}
                  title={isDe ? 'Abmelden' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              {isDe ? 'Einloggen' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
;
