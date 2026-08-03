import React, { useState, useEffect } from 'react';
import { User, Post } from './types';
import {
  initializeStorage,
  getCurrentUser,
  setCurrentUser,
  getPosts,
  getBookmarks,
  toggleBookmark,
  getUsers,
  getSettings,
  saveSettings,
  resetAllData,
  AppSettings,
  canCreatePost,
  canCreateMainPost,
  canCreateCreatorPost,
  canApproveUsers,
} from './storage';
import { Navbar, TabType } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PendingAccessNotice } from './components/PendingAccessNotice';
import { LoginRegisterModal } from './components/LoginRegisterModal';
import { ApprovalPanel } from './components/ApprovalPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import { EventsPanel } from './components/EventsPanel';
import { PostCreator } from './components/PostCreator';
import { CreatorTabPanel } from './components/CreatorTabPanel';
import { CreatorPostModal } from './components/CreatorPostModal';
import { CreatorApplicationModal } from './components/CreatorApplicationModal';
import { SupporterApplicationModal } from './components/SupporterApplicationModal';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SupportChannelPanel } from './components/SupportChannelPanel';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Search, Bookmark, Layers, ShieldCheck, Sparkles, UserCheck, Lock } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserLocal] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  // UI Controls
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCreatorPostModalOpen, setIsCreatorPostModalOpen] = useState(false);
  const [isCreatorAppOpen, setIsCreatorAppOpen] = useState(false);
  const [isSupporterAppOpen, setIsSupporterAppOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize data engine
  useEffect(() => {
    initializeStorage();
    refreshState();
  }, []);

  const refreshState = () => {
    const user = getCurrentUser();
    setCurrentUserLocal(user);

    const loadedPosts = getPosts();
    setPosts(loadedPosts);

    if (user) {
      setBookmarks(getBookmarks(user.id));
    } else {
      setBookmarks([]);
    }
  };

  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    const updated = saveSettings(newPartial);
    setSettingsState(updated);
  };

  const handleResetData = () => {
    resetAllData();
    setSettingsState(getSettings());
    refreshState();
  };

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserLocal(null);
    setBookmarks([]);
    setActiveTab('posts');
    addToast(settings.language === 'de' ? 'Erfolgreich abgemeldet.' : 'Logged out successfully.', 'info');
  };

  const handleQuickSwitchUser = (targetUsername: string) => {
    const allUsers = getUsers();
    const target = allUsers.find(
      (u) =>
        u.username.toLowerCase() === targetUsername.toLowerCase() ||
        u.username.toLowerCase().replace(/\s+/g, '') === targetUsername.toLowerCase().replace(/\s+/g, '')
    );

    if (target) {
      setCurrentUser(target);
      setCurrentUserLocal(target);
      setBookmarks(getBookmarks(target.id));
      const isDe = settings.language === 'de';
      addToast(
        isDe
          ? `Konto gewechselt zu "${target.username}" (${target.status === 'approved' ? 'Freigeschaltet' : 'Ausstehend'})`
          : `Switched account to "${target.username}" (${target.status === 'approved' ? 'Released' : 'Pending'})`,
        'success'
      );
    } else {
      addToast(
        settings.language === 'de'
          ? `Benutzer "${targetUsername}" nicht gefunden.`
          : `User "${targetUsername}" not found.`,
        'error'
      );
    }
  };

  const handleBookmarkToggle = (postId: string) => {
    if (!currentUser) return;
    const updated = toggleBookmark(currentUser.id, postId);
    setBookmarks(updated);
  };

  const canCreateMain = canCreateMainPost(currentUser);
  const pendingUsersCount = getUsers().filter(
    (u) => u.status === 'pending' && u.username.toLowerCase().replace(/\s+/g, '') !== 'phillipdev'
  ).length;

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'posts') {
      if (post.isCreatorTabPost) return false;
    }

    if (activeTab === 'bookmarks') {
      if (!bookmarks.includes(post.id)) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = post.title.toLowerCase().includes(q);
    const matchContent = post.content.toLowerCase().includes(q);
    const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
    const matchAttachment = post.attachments?.some((a) => a.name.toLowerCase().includes(q));

    return matchTitle || matchContent || matchTags || matchAttachment;
  });

  const isLight = settings.theme === 'light';
  const isDe = settings.language === 'de';

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${
      settings.fontSize === 'large' ? 'text-base' : 'text-sm'
    } ${
      isLight ? 'bg-slate-100 text-slate-800 selection:bg-indigo-600 selection:text-white' : 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white'
    }`}>
      
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        pendingCount={pendingUsersCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenPostCreator={() => setIsCreatorOpen(true)}
        onQuickSwitchUser={handleQuickSwitchUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMyProfile={() => currentUser && setSelectedUserForProfile(currentUser)}
        isLight={isLight}
        language={settings.language}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        
        {/* Pending / Restricted Access Notice */}
        <PendingAccessNotice
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onQuickSwitchToPhillip={() => handleQuickSwitchUser('Phillip Dev')}
          language={settings.language}
        />

        {/* Tab View 1: Main Posts Feed & Bookmarks Feed */}
        {(activeTab === 'posts' || activeTab === 'bookmarks') && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Header Toolbar */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl shadow-lg border transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
            }`}>
              <div className="flex items-center gap-2">
                {activeTab === 'posts' ? (
                  <>
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <h2 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {isDe ? 'SZ Portal Nachrichten-Feed' : 'SZ Portal Updates Feed'}
                    </h2>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5 text-indigo-500" />
                    <h2 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {isDe ? 'Gespeicherte Lesezeichen' : 'Saved Bookmarks'}
                    </h2>
                  </>
                )}
                <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  ({filteredPosts.length} {isDe ? 'Einträge' : 'updates'})
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isDe ? 'Beiträge, Dateien oder Tags suchen...' : 'Search posts, files, or tags...'}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>

              {/* Create post button for creators/developers/admins on mobile */}
              {canCreateMain && (
                <button
                  onClick={() => setIsCreatorOpen(true)}
                  className="md:hidden px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isDe ? 'Beitrag erstellen' : 'Create Post'}</span>
                </button>
              )}
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className={`border rounded-2xl p-10 text-center ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className={`text-base font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {activeTab === 'bookmarks'
                    ? (isDe ? 'Noch keine Lesezeichen gespeichert' : 'No Bookmarks Saved Yet')
                    : (isDe ? 'Keine Beiträge gefunden' : 'No Posts Found')}
                </h3>
                <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {activeTab === 'bookmarks'
                    ? (isDe
                        ? 'Speichere Beiträge von Phillip Dev über das Lesezeichen-Icon, sobald dein Konto freigeschaltet wurde.'
                        : 'Save posts from Phillip Dev by clicking the bookmark icon on any post after your account is released.')
                    : (isDe
                        ? 'Keine Beiträge entsprechen deinen Suchkriterien. Versuche den Filter zurückzusetzen.'
                        : 'No posts match your search criteria. Try clearing the filter.')}
                </p>
              </div>
            ) : (
              <div className={settings.compactView ? 'space-y-3' : 'space-y-5'}>
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    isBookmarked={bookmarks.includes(post.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                    onToast={addToast}
                    isLight={isLight}
                    isCompact={settings.compactView}
                    language={settings.language}
                    onViewProfile={(u) => setSelectedUserForProfile(u)}
                    onPostDeleted={refreshState}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab View 2: Notifications Panel */}
        {activeTab === 'notifications' && (
          <NotificationsPanel
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onToast={addToast}
            language={settings.language}
            isLight={isLight}
          />
        )}

        {/* Tab View 3: System Events & Updates Changelog Panel */}
        {activeTab === 'events' && (
          <EventsPanel
            currentUser={currentUser}
            onToast={addToast}
            language={settings.language}
            isLight={isLight}
          />
        )}

        {/* Tab View 4: Approval Management Panel (Phillip Dev Only) */}
        {activeTab === 'approvals' && (
          <ApprovalPanel
            currentUser={currentUser}
            onUserReleased={refreshState}
            onToast={addToast}
            language={settings.language}
            onViewProfile={(u) => setSelectedUserForProfile(u)}
          />
        )}

        {/* Tab View 5: Creator Tab Panel */}
        {activeTab === 'creator' && (
          <CreatorTabPanel
            currentUser={currentUser}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onToast={addToast}
            onOpenCreatorPostModal={() => setIsCreatorPostModalOpen(true)}
            onOpenCreatorApplication={() => setIsCreatorAppOpen(true)}
            onOpenSupporterApplication={() => setIsSupporterAppOpen(true)}
            onViewProfile={(u) => setSelectedUserForProfile(u)}
            isLight={isLight}
            language={settings.language}
          />
        )}

        {/* Tab View 6: Support Channel Panel */}
        {activeTab === 'support' && (
          <SupportChannelPanel
            currentUser={currentUser}
            onToast={addToast}
            language={settings.language}
            isLight={isLight}
            onViewProfile={(u) => setSelectedUserForProfile(u)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs mt-12 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800/80 text-slate-500'
      }`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>SZ Portal Access Node</span>
          </div>
          <p>
            {isDe ? 'Freischaltungsrichtlinie aktiv' : 'Release Policy Active'} • Passwort: <span className="font-mono text-indigo-500 font-semibold">Ingolstadt 2015</span>
          </p>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <LoginRegisterModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(user) => {
          setCurrentUserLocal(user);
          refreshState();
          addToast(isDe ? `Angemeldet als "${user.username}"` : `Signed in as "${user.username}"`, 'success');
        }}
        language={settings.language}
      />

      <PostCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onPostCreated={() => {
          refreshState();
        }}
        onToast={addToast}
        language={settings.language}
      />

      <CreatorPostModal
        isOpen={isCreatorPostModalOpen}
        onClose={() => setIsCreatorPostModalOpen(false)}
        currentUser={currentUser}
        onPostCreated={() => {
          refreshState();
        }}
        onToast={addToast}
        language={settings.language}
      />

      <CreatorApplicationModal
        isOpen={isCreatorAppOpen}
        onClose={() => setIsCreatorAppOpen(false)}
        currentUser={currentUser}
        onToast={addToast}
        language={settings.language}
        isLight={isLight}
      />

      <SupporterApplicationModal
        isOpen={isSupporterAppOpen}
        onClose={() => setIsSupporterAppOpen(false)}
        currentUser={currentUser}
        onToast={addToast}
        language={settings.language}
        isLight={isLight}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStorage={handleResetData}
        onToast={addToast}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {selectedUserForProfile && (
        <UserProfileModal
          user={selectedUserForProfile}
          currentUser={currentUser}
          isOpen={!!selectedUserForProfile}
          onClose={() => setSelectedUserForProfile(null)}
          onUpdate={refreshState}
          onToast={addToast}
          language={settings.language}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
