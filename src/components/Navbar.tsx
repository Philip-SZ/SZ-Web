import React from 'react';
import { User } from '../types';
import { User as UserIcon, ShieldCheck, Lock, UserCheck, LogOut, PlusCircle, Bookmark, Layers, Settings, BadgeCheck, Bell, Calendar, Sparkles, ShieldAlert, Users } from 'lucide-react';
import { getNotifications, canApproveUsers, canCreateMainPost, isFullAdmin, isSupporter, getReportedPosts, getCreatorApplications } from '../storage';
import { getAccentClasses } from '../utils/theme';

export type TabType = 'posts' | 'bookmarks' | 'notifications' | 'events' | 'approvals' | 'creator' | 'support' | 'friends';

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
  accentColor?: string;
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
  accentColor = 'indigo',
}) => {
  const isDe = language === 'de';
  const accent = getAccentClasses(accentColor);
  const canApprove = canApproveUsers(currentUser);
  const canSupport = isSupporter(currentUser);
  const canCreate = canCreateMainPost(currentUser);
  const isApproved = currentUser?.status === 'approved';

  const unreadNotifCount = currentUser ? getNotifications(currentUser.id).filter(n => !n.read).length : 0;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Center Navigation Tabs */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-3">
          <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shadow-md ${accent.shadow} shrink-0`}>
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                  <ShieldCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${accent.text}`} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className={`font-bold text-sm sm:text-lg tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    SZ <span className={`${accent.text} font-medium`}>Portal</span>
                  </h1>
                </div>
                <p className={`text-[10px] sm:text-xs hidden md:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isDe ? 'Jeden Tag neue Nachrichten' : 'New updates every day'}
                </p>
              </div>
            </div>

            {/* Mobile Right Actions & Profile */}
            <div className="flex lg:hidden items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenSettings}
                className={`p-2 rounded-xl border transition-all ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
                title={isDe ? 'Einstellungen' : 'Settings'}
              >
                <Settings className="w-4 h-4" />
              </button>
              {currentUser && (
                <>
                  {onOpenMyProfile && (
                    <button
                      onClick={onOpenMyProfile}
                      className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                      title={isDe ? 'Mein Profil' : 'My Profile'}
                    >
                      <UserIcon className={`w-4 h-4 ${accent.text}`} />
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold ${
                      isLight ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600' : 'bg-rose-950/50 hover:bg-rose-900/50 border-rose-800/50 text-rose-300'
                    }`}
                    title={isDe ? 'Abmelden' : 'Log Out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
              {!currentUser && (
                <button
                  onClick={onOpenLogin}
                  className={`${accent.bg} text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition-all whitespace-nowrap`}
                >
                  {isDe ? 'Einloggen' : 'Sign In'}
                </button>
              )}
            </div>
          </div>

          {/* Two-Column / Wrap Navigation Tabs Menu */}
          <div className="w-full lg:w-auto">
            <nav className={`grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
            }`}>
              {/* Posts Tab */}
              <button
                onClick={() => onTabChange('posts')}
                className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'posts'
                    ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>{isDe ? 'Beiträge' : 'Posts'}</span>
              </button>

              {/* Bookmarks Tab */}
              {currentUser && (
                <button
                  onClick={() => onTabChange('bookmarks')}
                  disabled={!isApproved}
                  title={!isApproved ? (isDe ? 'Erfordert Freischaltung durch Phillip Dev' : 'Requires account release by Phillip Dev') : (isDe ? 'Gespeicherte Lesezeichen' : 'Saved Bookmarks')}
                  className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'bookmarks'
                      ? `${accent.bg} text-white shadow-md ${accent.shadow}`
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
                className={`relative flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'notifications'
                    ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>{isDe ? 'Mitteilungen' : 'Notifications'}</span>
                {unreadNotifCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 ${accent.solidBg} text-white text-[10px] font-bold rounded-full animate-pulse`}>
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Events & Updates Tab */}
              <button
                onClick={() => onTabChange('events')}
                className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'events'
                    ? `${accent.bg} text-white shadow-md ${accent.shadow}`
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
                className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'creator'
                    ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{isDe ? 'Creator-Tab' : 'Creator Tab'}</span>
              </button>

              {/* Friends Tab */}
              {currentUser && (
                <button
                  onClick={() => onTabChange('friends')}
                  className={`relative flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'friends'
                      ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{isDe ? 'Freunde' : 'Friends'}</span>
                  {currentUser.friendRequestsReceived && currentUser.friendRequestsReceived.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.2 ${accent.solidBg} text-white text-[10px] font-bold rounded-full animate-pulse`}>
                      {currentUser.friendRequestsReceived.length}
                    </span>
                  )}
                </button>
              )}

              {/* Approvals Tab */}
              {canApprove && (
                <button
                  onClick={() => onTabChange('approvals')}
                  className={`relative flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'approvals'
                      ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{isDe ? 'Freigaben' : 'Approvals'}</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              {/* Support Tab */}
              {canSupport && (
                <button
                  onClick={() => onTabChange('support')}
                  className={`relative flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'support'
                      ? `${accent.bg} text-white shadow-md ${accent.shadow}`
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{isDe ? 'Support' : 'Support'}</span>
                  {(() => {
                    const supportCount = getReportedPosts().length + getCreatorApplications().filter(a => a.status === 'pending').length;
                    return supportCount > 0 ? (
                      <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                        {supportCount}
                      </span>
                    ) : null;
                  })()}
                </button>
              )}
            </nav>
          </div>

          {/* Desktop Right Actions (Settings, My Profile, New Post, User / Login) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border transition-all ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={isDe ? 'Einstellungen' : 'Settings'}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* My Profile button next to Settings */}
            {currentUser && onOpenMyProfile && (
              <button
                onClick={onOpenMyProfile}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
                title={isDe ? 'Mein Profil anzeigen und Kontoverwaltung' : 'View My Profile'}
              >
                <UserIcon className={`w-4 h-4 ${accent.text}`} />
                <span>{isDe ? 'Mein Profil' : 'My Profile'}</span>
              </button>
            )}

            {canCreate && (
              <button
                onClick={onOpenPostCreator}
                className={`flex items-center gap-1.5 bg-gradient-to-r ${accent.gradient} text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isDe ? 'Neuer Beitrag' : 'New Post'}</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 p-1.5 pl-3 pr-1.5 rounded-xl border bg-slate-950/80 border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${accent.solidBg} text-white font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden`}>
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {currentUser.username}
                  </span>
                  {currentUser.isVerified && (
                    <BadgeCheck className={`w-4 h-4 ${accent.text}`} title={isDe ? "Verifiziertes Konto" : "Verified Account"} />
                  )}
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 transition-colors"
                  title={isDe ? 'Abmelden' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className={`${accent.bg} text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap`}
              >
                {isDe ? 'Einloggen' : 'Sign In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

