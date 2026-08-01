import React, { useState } from 'react';
import { User, Post } from '../types';
import { getCreatorPosts, canCreateCreatorPost, isDeveloper, approveCreatorPost, rejectCreatorPost } from '../storage';
import { PostCard } from './PostCard';
import { Sparkles, Plus, ShieldCheck, CheckCircle2, XCircle, Star, MessageSquare } from 'lucide-react';

interface CreatorTabPanelProps {
  currentUser: User | null;
  bookmarks: string[];
  onBookmarkToggle: (postId: string) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenCreatorPostModal: () => void;
  onViewProfile?: (user: User) => void;
  isLight?: boolean;
  language?: 'de' | 'en';
}

export const CreatorTabPanel: React.FC<CreatorTabPanelProps> = ({
  currentUser,
  bookmarks,
  onBookmarkToggle,
  onToast,
  onOpenCreatorPostModal,
  onViewProfile,
  isLight = false,
  language = 'de',
}) => {
  const isDe = language === 'de';
  const [posts, setPosts] = useState<Post[]>(() => getCreatorPosts());
  const canCreate = canCreateCreatorPost(currentUser);
  const isPhillip = isDeveloper(currentUser);

  const refreshPosts = () => {
    setPosts(getCreatorPosts());
  };

  const handleApprove = (postId: string) => {
    approveCreatorPost(postId);
    refreshPosts();
    onToast(isDe ? 'Creator-Beitrag im Tab freigeschaltet!' : 'Creator post approved in tab!', 'success');
  };

  const handleReject = (postId: string) => {
    rejectCreatorPost(postId);
    refreshPosts();
    onToast(isDe ? 'Creator-Beitrag abgelehnt.' : 'Creator post rejected.', 'info');
  };

  // Filter posts visible to current user
  // Normal users & creators see approved posts. Phillip sees approved + pending posts.
  const visiblePosts = posts.filter(p => {
    if (p.status === 'approved') return true;
    if (isPhillip || p.authorId === currentUser?.id) return true;
    return false;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      {/* Description Banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-lg ${
        isLight
          ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-200/60'
          : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/30'
      }`}>
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDe ? 'Creator Tab' : 'Creator Tab'}</span>
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {isDe ? 'Hier können Creator ihre Meinungen schreiben' : 'Creators can write their opinions here'}
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isDe
                ? 'Creator mit Creator-Rang oder höher können hier ihre Beiträge und Meinungen verfassen. Normale Nutzer können Beiträge kommentieren und liken.'
                : 'Creators with creator rank or higher can write their posts and opinions here. Normal users can like and comment on posts.'}
            </p>
          </div>

          {canCreate && (
            <button
              onClick={onOpenCreatorPostModal}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isDe ? 'Beitrag verfassen' : 'Write Post'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {visiblePosts.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-200">
              {isDe ? 'Keine Beiträge im Creator-Tab vorhanden' : 'No posts in Creator Tab yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isDe ? 'Sei der Erste, der hier seine Meinung teilt.' : 'Be the first to share your opinion here.'}
            </p>
          </div>
        ) : (
          visiblePosts.map((post) => {
            const isPending = post.status === 'pending';
            return (
              <div key={post.id} className="space-y-2">
                {/* Pending Review Badge for Phillip */}
                {isPending && (
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>
                        {isDe
                          ? `Ausstehender Creator-Beitrag (Rating: ${post.rating || 5}/5). Phillip entscheidet dann:`
                          : `Pending creator post (Rating: ${post.rating || 5}/5). Philipp decides then:`}
                      </span>
                    </div>
                    {isPhillip && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDe ? 'Freigeben' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => handleReject(post.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isDe ? 'Ablehnen' : 'Reject'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <PostCard
                  post={post}
                  currentUser={currentUser}
                  isBookmarked={bookmarks.includes(post.id)}
                  onBookmarkToggle={onBookmarkToggle}
                  onToast={onToast}
                  isLight={isLight}
                  language={language}
                  onViewProfile={onViewProfile}
                  onPostDeleted={refreshPosts}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
