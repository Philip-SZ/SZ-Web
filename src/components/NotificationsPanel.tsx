import React, { useState } from 'react';
import { User, UserNotification } from '../types';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from '../storage';
import {
  Bell,
  BadgeCheck,
  CheckCircle2,
  Info,
  AlertTriangle,
  CheckCheck,
  Trash2,
  UserX,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationsPanelProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  isLight?: boolean;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  currentUser,
  onOpenLogin,
  onToast,
  language = 'de',
  isLight = false,
}) => {
  const isDe = language === 'de';
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = currentUser ? getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    onToast(isDe ? 'Als gelesen markiert' : 'Marked as read', 'info');
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    markAllNotificationsRead(currentUser.id);
    onToast(isDe ? 'Alle Mitteilungen als gelesen markiert' : 'All notifications marked as read', 'success');
  };

  const handleClear = () => {
    if (!currentUser) return;
    clearNotifications(currentUser.id);
    onToast(isDe ? 'Benachrichtigungen geleert' : 'Notifications cleared', 'info');
  };

  const getNotifIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'badge':
        return <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-400/20 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  if (!currentUser) {
    return (
      <div
        className={`border rounded-2xl p-8 text-center max-w-lg mx-auto my-8 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          {isDe ? 'Anmeldung erforderlich' : 'Sign in Required'}
        </h3>
        <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {isDe
            ? 'Bitte melde dich an, um deine persönlichen Benachrichtigungen (z. B. blauer Haken oder Konto-Freischaltung) zu sehen.'
            : 'Please sign in to view your personal notifications (such as blue checkmark or account release updates).'}
        </p>
        <button
          onClick={onOpenLogin}
          className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30"
        >
          {isDe ? 'Jetzt anmelden / registrieren' : 'Sign In / Register Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div
        className={`p-5 sm:p-6 border rounded-2xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Bell className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {isDe ? 'Meine Benachrichtigungen' : 'My Notifications'}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                    {unreadCount} {isDe ? 'ungelesen' : 'unread'}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDe
                  ? `Mitteilungen für ${currentUser.username} (Verifizierung, Freischaltung & Systemmeldungen)`
                  : `Updates for ${currentUser.username} (Verification, approvals & system messages)`}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isDe ? 'Alle lesen' : 'Mark all read'}</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                className={`p-1.5 border rounded-xl text-xs font-semibold transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                    : 'bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border-slate-700'
                }`}
                title={isDe ? 'Benachrichtigungen leeren' : 'Clear notifications'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isDe ? `Alle (${notifications.length})` : `All (${notifications.length})`}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isDe ? `Ungelesen (${unreadCount})` : `Unread (${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div
          className={`border rounded-2xl p-8 text-center ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <Bell className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
          <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {filter === 'unread'
              ? isDe
                ? 'Keine ungelesenen Benachrichtigungen'
                : 'No unread notifications'
              : isDe
              ? 'Keine Benachrichtigungen vorhanden'
              : 'No notifications found'}
          </p>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            {isDe
              ? 'Du wirst hier benachrichtigt, sobald Phillip Dev dein Konto freischaltet oder dir den blauen Haken verleiht.'
              : 'You will receive notifications here when Phillip Dev releases your account or grants a blue checkmark.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex gap-3.5 items-start ${
                !n.read
                  ? isLight
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                    : 'bg-indigo-950/30 border-indigo-800/60 shadow-lg shadow-indigo-950/20'
                  : isLight
                  ? 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="mt-0.5">{getNotifIcon(n.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {n.title}
                  </h4>
                  <span className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <div
                  className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 self-center"
                  title={isDe ? 'Ungelesen' : 'Unread'}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
