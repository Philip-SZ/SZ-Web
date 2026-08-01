import React, { useState, useEffect, useRef } from 'react';
import { User, UserRank, Post } from '../types';
import {
  getUserById,
  getFriendStatus,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  updateUserRank,
  updateUserBio,
  updateUserAvatar,
  toggleVerifyUser,
  getPosts,
  getUsers,
  isFullAdmin,
} from '../storage';
import { UserRankBadge } from './UserRankBadge';
import { PostCard } from './PostCard';
import {
  X,
  BadgeCheck,
  UserPlus,
  UserCheck,
  UserMinus,
  Clock,
  ShieldCheck,
  Edit3,
  Check,
  Users,
  Calendar,
  Sparkles,
  Layers,
  Crown,
  Camera,
} from 'lucide-react';

interface UserProfileModalProps {
  targetUser?: User | null;
  user?: User | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  isLight?: boolean;
  onSelectProfile?: (user: User) => void;
  onUserUpdated?: () => void;
  onUpdate?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  targetUser,
  user,
  currentUser,
  isOpen,
  onClose,
  onOpenLogin,
  onToast,
  language = 'de',
  isLight = false,
  onSelectProfile,
  onUserUpdated,
  onUpdate,
}) => {
  const initialTargetUser = targetUser || user;
  if (!isOpen || !initialTargetUser) return null;

  const isDe = language === 'de';
  const isPhillipDev = isFullAdmin(currentUser);

  // State
  const [profileUser, setProfileUser] = useState<User>(initialTargetUser);
  const [activeTab, setActiveTab] = useState<'info' | 'posts' | 'friends'>('info');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [adminSelectedRank, setAdminSelectedRank] = useState<UserRank>(
    initialTargetUser.rank || 'normal'
  );

  // Sync profile data on mount or when targetUser changes
  useEffect(() => {
    const refreshed = getUserById(initialTargetUser.id);
    if (refreshed) {
      setProfileUser(refreshed);
      setBioInput(refreshed.bio || '');
      setAdminSelectedRank(refreshed.rank || 'normal');
    } else {
      setProfileUser(initialTargetUser);
      setBioInput(initialTargetUser.bio || '');
      setAdminSelectedRank(initialTargetUser.rank || 'normal');
    }
  }, [initialTargetUser]);

  const refreshProfile = () => {
    const refreshed = getUserById(profileUser.id);
    if (refreshed) {
      setProfileUser(refreshed);
    }
    if (onUserUpdated) onUserUpdated();
    if (onUpdate) onUpdate();
  };

  const isSelf = currentUser?.id === profileUser.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast(isDe ? 'Bitte wähle eine Bilddatei aus.' : 'Please select an image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const success = updateUserAvatar(profileUser.id, dataUrl);
          if (success) {
            onToast(isDe ? 'Profilbild erfolgreich aktualisiert!' : 'Profile picture updated successfully!', 'success');
            refreshProfile();
          } else {
            onToast(isDe ? 'Fehler beim Speichern (Speicherlimit erreicht).' : 'Error saving profile picture (storage limit reached).', 'error');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const friendStatus = currentUser
    ? getFriendStatus(currentUser.id, profileUser.id)
    : 'none';

  // Get user's created posts
  const allPosts = getPosts();
  const userPosts = allPosts.filter((p) => p.authorId === profileUser.id);

  // Get friends list
  const allUsers = getUsers();
  const friendUsers = allUsers.filter((u) => profileUser.friends?.includes(u.id));

  // Handlers
  const handleSendFriendRequest = () => {
    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    const res = sendFriendRequest(currentUser.id, profileUser.id);
    if (res.success) {
      onToast(
        isDe
          ? `Freundschaftsanfrage an ${profileUser.username} gesendet!`
          : `Friend request sent to ${profileUser.username}!`,
        'success'
      );
      refreshProfile();
    } else {
      onToast(res.error || 'Error', 'error');
    }
  };

  const handleAcceptRequest = () => {
    if (!currentUser) return;
    const res = acceptFriendRequest(currentUser.id, profileUser.id);
    if (res.success) {
      onToast(
        isDe
          ? `Du bist jetzt mit ${profileUser.username} befreundet!`
          : `You are now friends with ${profileUser.username}!`,
        'success'
      );
      refreshProfile();
    }
  };

  const handleDeclineRequest = () => {
    if (!currentUser) return;
    declineFriendRequest(currentUser.id, profileUser.id);
    onToast(
      isDe ? 'Freundschaftsanfrage abgelehnt' : 'Friend request declined',
      'info'
    );
    refreshProfile();
  };

  const handleRemoveFriend = () => {
    if (!currentUser) return;
    removeFriend(currentUser.id, profileUser.id);
    onToast(
      isDe
        ? `${profileUser.username} aus Freundesliste entfernt`
        : `Removed ${profileUser.username} from friends`,
      'info'
    );
    refreshProfile();
  };

  const handleSaveBio = () => {
    if (!currentUser) return;
    updateUserBio(currentUser.id, bioInput);
    setIsEditingBio(false);
    onToast(isDe ? 'Profil-Bio aktualisiert!' : 'Profile bio updated!', 'success');
    refreshProfile();
  };

  const handleAdminChangeRank = (newRank: UserRank) => {
    setAdminSelectedRank(newRank);
    const res = updateUserRank(profileUser.id, newRank);
    if (res.success) {
      onToast(
        isDe
          ? `Rang von ${profileUser.username} auf "${newRank}" geändert!`
          : `Rank for ${profileUser.username} changed to "${newRank}"!`,
        'success'
      );
      refreshProfile();
    }
  };

  const handleAdminToggleVerify = () => {
    const res = toggleVerifyUser(profileUser.id);
    if (res.success) {
      onToast(
        res.isVerified
          ? (isDe ? 'Blauer Haken erteilt!' : 'Verified badge granted!')
          : (isDe ? 'Verifizierung entfernt' : 'Verification removed'),
        'info'
      );
      refreshProfile();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl transition-all overflow-hidden my-auto ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Cover / Header banner */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 relative p-4 flex justify-end items-start">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="px-5 sm:px-6 pb-4 relative -mt-12 sm:-mt-14 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Avatar & Username */}
            <div className="flex items-end gap-3.5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-1 shadow-xl">
                  {profileUser.avatarUrl ? (
                    <img
                      src={profileUser.avatarUrl}
                      alt={profileUser.username}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl ${
                        isLight ? 'bg-slate-100 text-indigo-600' : 'bg-slate-950 text-indigo-400'
                      }`}
                    >
                      {profileUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {isSelf && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title={isDe ? 'Profilbild hochladen' : 'Upload profile picture'}
                      className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-indigo-300" />
                      <span>{isDe ? 'Ändern' : 'Change'}</span>
                    </button>
                  </>
                )}
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className={`text-lg sm:text-2xl font-bold tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    {profileUser.username}
                  </h2>
                  {profileUser.isVerified && (
                    <BadgeCheck
                      className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 fill-sky-400/20 shrink-0"
                      title={isDe ? 'Verifiziertes Konto' : 'Verified Account'}
                    />
                  )}
                  <UserRankBadge rank={profileUser.rank} language={language} size="md" />
                </div>

                <p
                  className={`text-xs flex items-center gap-1 mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isDe ? 'Mitglied seit' : 'Member since'}{' '}
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      isDe ? 'de-DE' : 'en-US',
                      { month: 'short', year: 'numeric' }
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Friend / Action Button */}
            <div className="shrink-0 flex items-center gap-2">
              {!isSelf && (
                <>
                  {friendStatus === 'none' && (
                    <button
                      onClick={handleSendFriendRequest}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isDe ? 'Freund hinzufügen' : 'Add Friend'}</span>
                    </button>
                  )}

                  {friendStatus === 'pending_sent' && (
                    <button
                      disabled
                      className="px-3.5 py-2 bg-slate-800 text-slate-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 cursor-default"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{isDe ? 'Anfrage gesendet' : 'Request Sent'}</span>
                    </button>
                  )}

                  {friendStatus === 'pending_received' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleAcceptRequest}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isDe ? 'Annehmen' : 'Accept'}</span>
                      </button>
                      <button
                        onClick={handleDeclineRequest}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                      >
                        {isDe ? 'Ablehnen' : 'Decline'}
                      </button>
                    </div>
                  )}

                  {friendStatus === 'friends' && (
                    <button
                      onClick={handleRemoveFriend}
                      title={isDe ? 'Freundschaft beenden' : 'Remove Friend'}
                      className="px-3.5 py-2 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/50 text-emerald-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isDe ? 'Befreundet ✓' : 'Friends ✓'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Phillip Dev Admin Controls Banner */}
          {isPhillipDev && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isDe ? 'Admin Rang-Steuerung' : 'Admin Rank Control'}</span>
                </div>

                {/* Toggle Verified */}
                <button
                  onClick={handleAdminToggleVerify}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    profileUser.isVerified
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {profileUser.isVerified
                      ? (isDe ? 'Verifiziert ✓' : 'Verified ✓')
                      : (isDe ? '+ Blauer Haken' : '+ Verify')}
                  </span>
                </button>
              </div>

              {/* Rank Dropdown Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-300 font-medium">
                  {isDe ? 'Rang zuweisen:' : 'Assign Rank:'}
                </span>
                <select
                  value={adminSelectedRank}
                  onChange={(e) => handleAdminChangeRank(e.target.value as UserRank)}
                  className="bg-slate-950 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 border border-purple-700/60 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="not_granted">{isDe ? 'Nicht gewährt (Not granted)' : 'Not granted'}</option>
                  <option value="normal">{isDe ? 'Normal' : 'Normal'}</option>
                  <option value="creator">{isDe ? 'Creator (Ersteller)' : 'Creator'}</option>
                  <option value="developer">{isDe ? 'Developer (Entwickler)' : 'Developer'}</option>
                  <option value="admin">{isDe ? 'Admin (Administrator)' : 'Admin'}</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800/80 pt-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-400'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDe ? 'Profil-Info' : 'Profile Info'}</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'posts'
                  ? 'border-indigo-500 text-indigo-400'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isDe ? 'Beiträge' : 'Posts'} ({userPosts.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'friends'
                  ? 'border-indigo-500 text-indigo-400'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {isDe ? 'Freunde' : 'Friends'} ({friendUsers.length})
              </span>
            </button>
          </div>

          {/* Tab 1: Profile Info & Bio */}
          {activeTab === 'info' && (
            <div className="space-y-4 pt-2">
              {/* Bio Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {isDe ? 'Über mich / Bio' : 'About / Bio'}
                  </h3>

                  {isSelf && !isEditingBio && (
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Bearbeiten' : 'Edit'}</span>
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder={
                        isDe
                          ? 'Schreibe eine kurze Beschreibung über dich...'
                          : 'Write a short bio...'
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        {isDe ? 'Abbrechen' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDe ? 'Speichern' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-xs leading-relaxed ${
                      profileUser.bio
                        ? isLight
                          ? 'text-slate-700'
                          : 'text-slate-300'
                        : isLight
                        ? 'text-slate-400 italic'
                        : 'text-slate-500 italic'
                    }`}
                  >
                    {profileUser.bio ||
                      (isDe ? 'Noch keine Biografie vorhanden.' : 'No bio provided yet.')}
                  </p>
                )}
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <p className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isDe ? 'Rang' : 'Rank'}
                  </p>
                  <div className="mt-1">
                    <UserRankBadge rank={profileUser.rank} language={language} size="md" />
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <p className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isDe ? 'Freigabestatus' : 'Release Status'}
                  </p>
                  <p className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
                    {profileUser.status === 'approved' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {isDe ? 'Freigeschaltet' : 'Approved'}
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {isDe ? 'Ausstehend' : 'Pending'}
                      </span>
                    )}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <p className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isDe ? 'Freunde' : 'Friends'}
                  </p>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {friendUsers.length} {isDe ? 'Mitglieder' : 'members'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: User's Posts */}
          {activeTab === 'posts' && (
            <div className="space-y-3 pt-2">
              {userPosts.length === 0 ? (
                <div
                  className={`p-6 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isDe
                      ? 'Dieser Benutzer hat noch keine Beiträge verfasst.'
                      : 'This user has not created any posts yet.'}
                  </p>
                </div>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    isBookmarked={false}
                    onBookmarkToggle={() => {}}
                    onToast={onToast}
                    language={language}
                    isLight={isLight}
                    onViewProfile={(u) => {
                      if (onSelectProfile) {
                        onSelectProfile(u);
                      } else {
                        setProfileUser(u);
                      }
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab 3: Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-3 pt-2">
              {friendUsers.length === 0 ? (
                <div
                  className={`p-6 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {isDe ? 'Noch keine Freunde hinzugefügt' : 'No friends added yet'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {friendUsers.map((fUser) => (
                    <div
                      key={fUser.id}
                      onClick={() => onSelectProfile && onSelectProfile(fUser)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {fUser.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100 truncate">
                              {fUser.username}
                            </span>
                            {fUser.isVerified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                          </div>
                          <UserRankBadge rank={fUser.rank} language={language} size="sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
