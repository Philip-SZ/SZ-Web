import React, { useState } from 'react';
import { Post, User, FileAttachment, Comment } from '../types';
import { Bookmark, Download, Lock, FileText, Code, FileArchive, File, ShieldCheck, Tag, Check, Eye, BadgeCheck, MessageSquare, Send, Trash2, Heart, Star, Flag } from 'lucide-react';
import { recordDownload, toggleBookmark, getUsers, getComments, createComment, deleteComment, canDeleteComment, canDeletePost, deletePost, toggleLikePost, reportPost } from '../storage';
import { UserRankBadge } from './UserRankBadge';
import { getAccentClasses } from '../utils/theme';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  isBookmarked: boolean;
  onBookmarkToggle: (postId: string) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isLight?: boolean;
  isCompact?: boolean;
  language?: 'de' | 'en';
  onViewProfile?: (user: User) => void;
  onPostDeleted?: () => void;
  postStyle?: 'default' | 'elevated' | 'bordered' | 'minimal';
  accentColor?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  isBookmarked,
  onBookmarkToggle,
  onToast,
  isLight = false,
  isCompact = false,
  language = 'de',
  onViewProfile,
  onPostDeleted,
  postStyle = 'default',
  accentColor = 'indigo',
}) => {
  const isDe = language === 'de';
  const accent = getAccentClasses(accentColor);
  const isApproved = currentUser?.status === 'approved';
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>(() => getComments(post.id));
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const isLiked = currentUser ? likes.includes(currentUser.id) : false;
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReportPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const res = reportPost(post.id, currentUser.id, currentUser.username, reportReason);
    if (res.success) {
      onToast(isDe ? 'Beitrag erfolgreich gemeldet. Danke für deine Mithilfe!' : 'Post reported successfully. Thanks for helping!', 'success');
      setShowReportModal(false);
      setReportReason('');
    } else {
      onToast(res.error || (isDe ? 'Fehler beim Melden' : 'Error reporting'), 'error');
    }
  };

  const handleLikeToggle = () => {
    if (!currentUser) {
      onToast(isDe ? 'Bitte melde dich an, um Beiträge zu liken.' : 'Please log in to like posts.', 'info');
      return;
    }
    const updatedPosts = toggleLikePost(post.id, currentUser.id);
    const updatedPost = updatedPosts.find(p => p.id === post.id);
    if (updatedPost) {
      setLikes(updatedPost.likes || []);
    }
  };

  const refreshComments = () => {
    setCommentsList(getComments(post.id));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!commentText.trim()) return;

    createComment(post.id, currentUser, commentText.trim());
    setCommentText('');
    refreshComments();
    onToast(isDe ? 'Kommentar hinzugefügt' : 'Comment added', 'success');
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    refreshComments();
    onToast(isDe ? 'Kommentar gelöscht' : 'Comment deleted', 'info');
  };

  const handleDeletePost = () => {
    if (confirm(isDe ? 'Möchtest du diesen Beitrag wirklich löschen?' : 'Are you sure you want to delete this post?')) {
      deletePost(post.id);
      if (onPostDeleted) onPostDeleted();
      onToast(isDe ? 'Beitrag gelöscht' : 'Post deleted', 'info');
    }
  };
  const isPhillipDev = currentUser?.role === 'admin' || currentUser?.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';

  const handleDownload = (attachment: FileAttachment) => {
    if (!isApproved) {
      onToast(
        isDe
          ? 'Download gesperrt! Nur von Phillip Dev freigeschaltete Konten können Dateien herunterladen.'
          : 'Download locked! Only accounts released by Phillip Dev can download files.',
        'error'
      );
      return;
    }

    try {
      // Trigger file download
      const link = document.createElement('a');
      link.href = attachment.contentUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Record download count metric
      recordDownload(post.id, attachment.id);
      onToast(
        isDe ? `Datei "${attachment.name}" heruntergeladen` : `Downloaded file "${attachment.name}"`,
        'success'
      );
    } catch (err) {
      onToast(isDe ? 'Fehler beim Herunterladen der Datei.' : 'Error downloading file.', 'error');
    }
  };

  const handleBookmarkClick = () => {
    if (!currentUser) {
      onToast(
        isDe
          ? 'Bitte melde dich an oder registriere dich, um Lesezeichen zu speichern.'
          : 'Please sign in or register to bookmark posts.',
        'info'
      );
      return;
    }
    if (!isApproved) {
      onToast(
        isDe
          ? 'Lesezeichen gesperrt! Phillip Dev muss dein Konto zuerst freischalten.'
          : 'Bookmarking locked! Phillip Dev must release your account first.',
        'error'
      );
      return;
    }

    onBookmarkToggle(post.id);
    onToast(
      isBookmarked
        ? (isDe ? 'Aus Lesezeichen entfernt' : 'Removed from bookmarks')
        : (isDe ? 'Zu Lesezeichen hinzugefügt' : 'Added to bookmarks'),
      'info'
    );
  };

  // Icon helper based on file extension / type
  const getFileIcon = (filename: string, mimeType: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'ts' || ext === 'js' || ext === 'json' || ext === 'py') {
      return <Code className="w-5 h-5 text-sky-400" />;
    }
    if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === '7z') {
      return <FileArchive className="w-5 h-5 text-amber-400" />;
    }
    if (ext === 'txt' || ext === 'pdf' || ext === 'md' || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-indigo-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const authorUser = getUsers().find(u => u.id === post.authorId || u.username === post.authorName) || {
    id: post.authorId,
    username: post.authorName,
    email: 'phillip@dev.io',
    role: 'admin' as const,
    status: 'approved' as const,
    createdAt: post.createdAt,
    rank: 'admin' as const,
    isVerified: true,
    avatarUrl: undefined,
  };
  const isAuthorVerified = authorUser?.isVerified ?? (post.authorId === 'usr_phillip_dev' || post.authorName.toLowerCase().replace(/\s+/g, '') === 'phillipdev');

  const handleAuthorClick = () => {
    if (onViewProfile && authorUser) {
      onViewProfile(authorUser);
    }
  };

  return (
    <article className={`rounded-2xl relative overflow-hidden transition-all border ${
      isCompact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6'
    } ${
      postStyle === 'elevated' ? `shadow-2xl ${accent.shadow}` : postStyle === 'minimal' ? 'shadow-none bg-opacity-60' : 'shadow-xl'
    } ${
      postStyle === 'bordered' ? `border-2 ${accent.border}` : ''
    } ${
      isLight
        ? `bg-white border-slate-200 hover:border-current ${accent.text} text-slate-800`
        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
    }`}>
      
      {/* Header */}
      <div className={`flex items-start justify-between gap-4 ${isCompact ? 'mb-2.5' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <div
            onClick={handleAuthorClick}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${accent.gradient} p-0.5 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0`}
          >
            {authorUser?.avatarUrl ? (
              <img src={authorUser.avatarUrl} alt={post.authorName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${
                isLight ? `bg-white ${accent.text}` : `bg-slate-950 ${accent.text}`
              }`}>
                {post.authorName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={handleAuthorClick}
                className={`font-semibold text-sm cursor-pointer hover:${accent.text} transition-colors ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                {post.authorName}
              </span>
              {isAuthorVerified && (
                <BadgeCheck className={`w-4 h-4 ${accent.text} fill-current/25 shrink-0`} title={isDe ? 'Verifiziertes Konto (Blauer Haken)' : 'Verified Account'} />
              )}
              <UserRankBadge rank={authorUser.rank || 'admin'} language={language} size="sm" />
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {new Date(post.createdAt).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          disabled={!isApproved}
          title={
            !isApproved
              ? (isDe ? 'Gesperrt: Konto-Freischaltung erforderlich' : 'Locked: Account release required')
              : isBookmarked
              ? (isDe ? 'Lesezeichen entfernen' : 'Remove bookmark')
              : (isDe ? 'Beitrag speichern' : 'Bookmark post')
          }
          className={`p-2 rounded-xl border transition-all ${
            isBookmarked
              ? `${accent.solidBg}/30 border-current ${accent.text}`
              : !isApproved
              ? 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 text-slate-400 cursor-not-allowed'
              : isLight
              ? `bg-slate-100 border-slate-200 text-slate-600 hover:${accent.text} hover:bg-slate-200/60`
              : `bg-slate-950/60 border-slate-800/80 text-slate-400 hover:${accent.text} hover:bg-slate-800/60`
          }`}
        >
          {!isApproved ? (
            <Lock className="w-4 h-4 text-amber-500/70" />
          ) : (
            <Bookmark className={`w-4 h-4 ${isBookmarked ? `fill-current ${accent.text}` : ''}`} />
          )}
        </button>
      </div>

      {/* Rating badge if present */}
      {post.rating && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl mb-3 w-fit">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{isDe ? `Creator-Rating: ${post.rating} / 5 Sterne` : `Creator Rating: ${post.rating} / 5 Stars`}</span>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 ${isCompact ? 'mb-2' : 'mb-3'}`}>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-medium border ${
                isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              <Tag className={`w-2.5 h-2.5 ${accent.text}`} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Title */}
      <h3 className={`font-bold tracking-tight ${isCompact ? 'text-base mb-2' : 'text-lg mb-3'} ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
        {post.title}
      </h3>

      {/* Body Content Gated Guard */}
      {isApproved ? (
        <div className={`text-sm leading-relaxed whitespace-pre-line rounded-xl border ${
          isCompact ? 'mb-3 p-3' : 'mb-5 p-4'
        } ${
          isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950/40 text-slate-300 border-slate-800/60'
        }`}>
          {post.content}
        </div>
      ) : (
        <div className="mb-5 p-5 bg-amber-950/30 border border-amber-800/50 rounded-xl relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">
                {isDe ? 'Beitragsinhalt gesperrt (Wartet auf Freischaltung)' : 'Post Message Locked (Pending Release)'}
              </h4>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {isDe
                  ? 'Du kannst den Inhalt von Phillip Devs Beiträgen erst lesen und Anhänge herunterladen, wenn dein Konto freigeschaltet wurde.'
                  : "You cannot read Phillip Dev's post content or download attachments until your account is approved and released."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>{isDe ? `Angehängte Downloads (${post.attachments.length})` : `Attached Downloads (${post.attachments.length})`}</span>
            {!isApproved && (
              <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> {isDe ? 'Downloads gesperrt' : 'Downloads locked'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {post.attachments.map((att) => (
              <div
                key={att.id}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 ${
                  isApproved
                    ? isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-current'
                      : 'bg-slate-950/80 border-slate-800 hover:border-current'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 opacity-75'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg border shrink-0 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {getFileIcon(att.name, att.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{att.name}</p>
                    <p className={`text-[10px] flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{formatBytes(att.size)}</span>
                      <span>•</span>
                      <span>{att.downloadCount || 0} {isDe ? 'Downloads' : 'downloads'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(att)}
                  disabled={!isApproved}
                  title={
                    isApproved
                      ? (isDe ? `${att.name} herunterladen` : `Download ${att.name}`)
                      : (isDe ? 'Gesperrt: Erfordert Freischaltung durch Phillip Dev' : 'Locked: Requires release by Phillip Dev')
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ml-auto ${
                    isApproved
                      ? `${accent.bg} ${accent.hoverBg} text-white shadow-md ${accent.shadow}`
                      : isLight
                      ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Herunterladen' : 'Download'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>{isDe ? 'Gesperrt' : 'Locked'}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions & Comments Toggle */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-4">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLiked
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
            <span>{likes.length}</span>
            <span className="hidden sm:inline">{isDe ? (likes.length === 1 ? 'Like' : 'Likes') : (likes.length === 1 ? 'Like' : 'Likes')}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showComments
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isDe ? 'Kommentare' : 'Comments'}</span>
            <span className="px-1.5 py-0.2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] rounded-full font-bold">
              {commentsList.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && currentUser.id !== post.authorId && (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 border border-transparent hover:border-amber-800/40 rounded-xl transition-all"
              title={isDe ? 'Beitrag melden' : 'Report post'}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDe ? 'Melden' : 'Report'}</span>
            </button>
          )}

          {canDeletePost(currentUser, post.authorId) && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-800/40 rounded-xl transition-all"
              title={isDe ? 'Beitrag löschen' : 'Delete post'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDe ? 'Löschen' : 'Delete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'}`}>
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-500" />
              {isDe ? 'Beitrag melden' : 'Report Post'}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {isDe ? 'Bitte teile uns mit, warum dieser Beitrag gemeldet werden sollte. Supporter werden dies im Support-Channel prüfen.' : 'Please tell us why this post should be reported. Supporters will review it in the support channel.'}
            </p>
            <form onSubmit={handleReportPost} className="space-y-3">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={isDe ? 'Grund (z.B. Spam, unangebrachte Inhalte)...' : 'Reason (e.g. spam, inappropriate content)...'}
                className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:border-indigo-500 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                rows={3}
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {isDe ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
                >
                  {isDe ? 'Meldung absenden' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Comment Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isDe ? `Kommentare (${commentsList.length})` : `Comments (${commentsList.length})`}</span>
          </h4>

          {/* List of comments */}
          {commentsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              {isDe ? 'Noch keine Kommentare vorhanden. Schreibe den ersten!' : 'No comments yet. Write the first one!'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {commentsList.map((comm) => {
                const commentAuthorUser = getUsers().find(u => u.id === comm.authorId || u.username === comm.authorName);
                const canDel = canDeleteComment(currentUser, comm.authorId);

                return (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        onClick={() => commentAuthorUser && onViewProfile && onViewProfile(commentAuthorUser)}
                        className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 cursor-pointer hover:scale-105 transition-transform mt-0.5 overflow-hidden"
                      >
                        {commentAuthorUser?.avatarUrl ? (
                          <img src={commentAuthorUser.avatarUrl} alt={comm.authorName} className="w-full h-full object-cover" />
                        ) : (
                          comm.authorName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => commentAuthorUser && onViewProfile && onViewProfile(commentAuthorUser)}
                            className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            {comm.authorName}
                          </span>
                          {comm.authorIsVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" />
                          )}
                          <UserRankBadge rank={comm.authorRank || 'normal'} language={language} size="sm" />
                          <span className="text-[10px] text-slate-500 ml-auto">
                            {new Date(comm.createdAt).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 whitespace-pre-line leading-relaxed">{comm.content}</p>
                      </div>
                    </div>

                    {canDel && (
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-colors shrink-0"
                        title={isDe ? 'Kommentar löschen' : 'Delete comment'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Form */}
          {currentUser ? (
            isApproved ? (
              <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-3 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={isDe ? 'Schreibe einen Kommentar...' : 'Write a comment...'}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isDe ? 'Senden' : 'Send'}</span>
                </button>
              </form>
            ) : (
              <p className="text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-xl">
                {isDe
                  ? 'Gesperrt: Du kannst erst nach Freischaltung deines Kontos Kommentare verfassen.'
                  : 'Locked: You can write comments once your account is released.'}
              </p>
            )
          ) : (
            <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {isDe
                ? 'Bitte melde dich an, um Kommentare zu schreiben.'
                : 'Please log in to write comments.'}
            </p>
          )}
        </div>
      )}
    </article>
  );
};
