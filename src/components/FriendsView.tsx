import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, addNotification } from '../storage';
import { getAccentClasses } from '../utils/theme';
import { Users, UserPlus, UserCheck, UserX, Check, X, ShieldCheck, Search, MessageSquare, ExternalLink } from 'lucide-react';

interface FriendsViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  isLight?: boolean;
  language?: 'de' | 'en';
  accentColor?: string;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  onUpdateUser,
  isLight = false,
  language = 'de',
  accentColor = 'indigo',
}) => {
  const isDe = language === 'de';
  const accent = getAccentClasses(accentColor);
  const [subTab, setSubTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = getUsers();
  const freshCurrentUser = allUsers.find(u => u.id === currentUser.id) || currentUser;

  const friendIds = freshCurrentUser.friends || [];
  const requestsReceivedIds = freshCurrentUser.friendRequestsReceived || [];
  const requestsSentIds = freshCurrentUser.friendRequestsSent || [];

  const friendsList = allUsers.filter(u => friendIds.includes(u.id));
  const requestsReceivedList = allUsers.filter(u => requestsReceivedIds.includes(u.id));
  const discoverList = allUsers.filter(
    u => u.id !== freshCurrentUser.id &&
         !friendIds.includes(u.id) &&
         !requestsReceivedIds.includes(u.id) &&
         !requestsSentIds.includes(u.id) &&
         (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendRequest = (targetId: string) => {
    const success = sendFriendRequest(freshCurrentUser.id, targetId);
    if (success) {
      const updated = getUsers().find(u => u.id === freshCurrentUser.id);
      if (updated) onUpdateUser(updated);
    }
  };

  const handleAccept = (requesterId: string) => {
    const success = acceptFriendRequest(freshCurrentUser.id, requesterId);
    if (success) {
      const updated = getUsers().find(u => u.id === freshCurrentUser.id);
      if (updated) onUpdateUser(updated);
    }
  };

  const handleReject = (requesterId: string) => {
    const success = rejectFriendRequest(freshCurrentUser.id, requesterId);
    if (success) {
      const updated = getUsers().find(u => u.id === freshCurrentUser.id);
      if (updated) onUpdateUser(updated);
    }
  };

  const handleRemove = (friendId: string) => {
    const success = removeFriend(freshCurrentUser.id, friendId);
    if (success) {
      const updated = getUsers().find(u => u.id === freshCurrentUser.id);
      if (updated) onUpdateUser(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shadow-md ${accent.shadow}`}>
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <Users className={`w-6 h-6 ${accent.text}`} />
            </div>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {isDe ? 'Freunde & Kontakte' : 'Friends & Connections'}
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isDe ? 'Vernetze dich mit anderen Mitgliedern im SZ Portal' : 'Connect with other members in the SZ Portal'}
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
          <button
            onClick={() => setSubTab('friends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'friends'
                ? `${accent.bg} text-white shadow-md`
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isDe ? 'Freunde' : 'Friends'} ({friendsList.length})</span>
          </button>
          <button
            onClick={() => setSubTab('requests')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'requests'
                ? `${accent.bg} text-white shadow-md`
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isDe ? 'Anfragen' : 'Requests'}</span>
            {requestsReceivedList.length > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {requestsReceivedList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('discover')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'discover'
                ? `${accent.bg} text-white shadow-md`
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isDe ? 'Entdecken' : 'Discover'}</span>
          </button>
        </div>
      </div>

      {/* Content based on SubTab */}
      {subTab === 'friends' && (
        <div className="space-y-4">
          {friendsList.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <Users className={`w-10 h-10 mx-auto mb-3 opacity-40 ${accent.text}`} />
              <p className="font-semibold">{isDe ? 'Noch keine Freunde hinzugefügt' : 'No friends added yet'}</p>
              <p className="text-xs mt-1">{isDe ? 'Durchsuche den Tab "Entdecken", um Kontakte zu knüpfen.' : 'Browse the "Discover" tab to make connections.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friendsList.map(friend => (
                <div
                  key={friend.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${
                    isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shrink-0`}>
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full rounded-[10px] object-cover" />
                      ) : (
                        <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
                          {friend.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className={`font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {friend.username}
                        </h3>
                        {friend.isVerified && (
                          <ShieldCheck className={`w-3.5 h-3.5 ${accent.text} shrink-0`} title="Verified" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {friend.bio || (isDe ? 'Mitglied im Portal' : 'Portal member')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(friend.id)}
                    className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1 shrink-0 ${
                      isLight ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                    }`}
                    title={isDe ? 'Freund entfernen' : 'Remove friend'}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Requests */}
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accent.text}`}>
              {isDe ? 'Eingehende Freundschaftsanfragen' : 'Incoming Friend Requests'} ({requestsReceivedList.length})
            </h3>
            {requestsReceivedList.length === 0 ? (
              <p className={`text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDe ? 'Keine offenen Anfragen erhalten.' : 'No pending requests received.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requestsReceivedList.map(reqUser => (
                  <div
                    key={reqUser.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shrink-0`}>
                        {reqUser.avatarUrl ? (
                          <img src={reqUser.avatarUrl} alt={reqUser.username} className="w-full h-full rounded-[10px] object-cover" />
                        ) : (
                          <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
                            {reqUser.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {reqUser.username}
                        </h3>
                        <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {reqUser.bio || (isDe ? 'Möchte dein Freund sein' : 'Wants to be your friend')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAccept(reqUser.id)}
                        className={`p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all`}
                        title={isDe ? 'Annehmen' : 'Accept'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(reqUser.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isLight ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                        }`}
                        title={isDe ? 'Ablehnen' : 'Reject'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accent.text}`}>
              {isDe ? 'Gesendete Anfragen' : 'Sent Requests'} ({requestsSentIds.length})
            </h3>
            {requestsSentIds.length === 0 ? (
              <p className={`text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDe ? 'Keine offenen gesendeten Anfragen.' : 'No pending sent requests.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allUsers.filter(u => requestsSentIds.includes(u.id)).map(target => (
                  <div
                    key={target.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shrink-0`}>
                        {target.avatarUrl ? (
                          <img src={target.avatarUrl} alt={target.username} className="w-full h-full rounded-[10px] object-cover" />
                        ) : (
                          <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
                            {target.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {target.username}
                        </h3>
                        <p className={`text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isDe ? 'Wartet auf Bestätigung...' : 'Waiting for confirmation...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'discover' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${accent.text}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDe ? 'Mitglieder nach Name oder E-Mail suchen...' : 'Search members by name or email...'}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-indigo-500/30'
              }`}
            />
          </div>

          {discoverList.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <Users className={`w-10 h-10 mx-auto mb-3 opacity-40 ${accent.text}`} />
              <p className="font-semibold">{isDe ? 'Keine weiteren Mitglieder gefunden' : 'No other members found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoverList.map(member => (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${
                    isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shrink-0`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.username} className="w-full h-full rounded-[10px] object-cover" />
                      ) : (
                        <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
                          {member.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className={`font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {member.username}
                        </h3>
                        {member.isVerified && (
                          <ShieldCheck className={`w-3.5 h-3.5 ${accent.text} shrink-0`} title="Verified" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {member.bio || (isDe ? 'Mitglied im Portal' : 'Portal member')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(member.id)}
                    className={`${accent.bg} text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1 shrink-0 active:scale-95`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isDe ? 'Hinzufügen' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
