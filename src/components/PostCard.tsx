import React from 'react';
import { Post, User, FileAttachment } from '../types';
import { Bookmark, Download, Lock, FileText, Code, FileArchive, File, ShieldCheck, Tag, Check, Eye } from 'lucide-react';
import { recordDownload, toggleBookmark } from '../storage';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  isBookmarked: boolean;
  onBookmarkToggle: (postId: string) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isLight?: boolean;
  isCompact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  isBookmarked,
  onBookmarkToggle,
  onToast,
  isLight = false,
  isCompact = false,
}) => {
  const isApproved = currentUser?.status === 'approved';
  const isPhillipDev = currentUser?.role === 'admin' || currentUser?.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';

  const handleDownload = (attachment: FileAttachment) => {
    if (!isApproved) {
      onToast('Download locked! Only accounts released by Phillip Dev can download files.', 'error');
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
      onToast(`Downloaded file "${attachment.name}"`, 'success');
    } catch (err) {
      onToast('Error downloading file.', 'error');
    }
  };

  const handleBookmarkClick = () => {
    if (!currentUser) {
      onToast('Please sign in or register to bookmark posts.', 'info');
      return;
    }
    if (!isApproved) {
      onToast('Bookmarking locked! Phillip Dev must release your account first.', 'error');
      return;
    }

    onBookmarkToggle(post.id);
    onToast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'info');
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

  return (
    <article className={`rounded-2xl shadow-xl relative overflow-hidden transition-all border ${
      isCompact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6'
    } ${
      isLight
        ? 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
    }`}>
      
      {/* Header */}
      <div className={`flex items-start justify-between gap-4 ${isCompact ? 'mb-2.5' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md">
            <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${
              isLight ? 'bg-white text-indigo-600' : 'bg-slate-950 text-indigo-300'
            }`}>
              PD
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{post.authorName}</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 rounded uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Creator
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
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
          title={!isApproved ? 'Locked: Account release required' : isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          className={`p-2 rounded-xl border transition-all ${
            isBookmarked
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400'
              : !isApproved
              ? 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 text-slate-400 cursor-not-allowed'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60'
          }`}
        >
          {!isApproved ? (
            <Lock className="w-4 h-4 text-amber-500/70" />
          ) : (
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-500 text-indigo-500' : ''}`} />
          )}
        </button>
      </div>

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
              <Tag className="w-2.5 h-2.5 text-indigo-500" />
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
                Post Message Locked (Pending Release)
              </h4>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                You cannot read Phillip Dev's post content or download attachments until your account is approved and released.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Attached Downloads ({post.attachments.length})</span>
            {!isApproved && (
              <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Downloads locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {post.attachments.map((att) => (
              <div
                key={att.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isApproved
                    ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getFileIcon(att.name, att.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{att.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>{formatBytes(att.size)}</span>
                      <span>•</span>
                      <span>{att.downloadCount || 0} downloads</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(att)}
                  disabled={!isApproved}
                  title={isApproved ? `Download ${att.name}` : 'Locked: Requires release by Phillip Dev'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    isApproved
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Locked</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
