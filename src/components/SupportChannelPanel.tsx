import React, { useState } from 'react';
import { User, Post, CreatorApplication, SupporterApplication } from '../types';
import { getReportedPosts, deletePost, dismissPostReports, isSupporter, getCreatorApplications, approveCreatorApplication, rejectCreatorApplication, getSupporterApplications, approveSupporterApplication, rejectSupporterApplication } from '../storage';
import { PostCard } from './PostCard';
import { ShieldAlert, CheckCircle, Trash2, AlertTriangle, Sparkles, Check, X, ShieldCheck } from 'lucide-react';

interface SupportChannelPanelProps {
  currentUser: User | null;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  isLight?: boolean;
  onViewProfile?: (user: User) => void;
}

export const SupportChannelPanel: React.FC<SupportChannelPanelProps> = ({
  currentUser,
  onToast,
  language = 'de',
  isLight = false,
  onViewProfile,
}) => {
  const isDe = language === 'de';
  const [reportedPosts, setReportedPosts] = useState<Post[]>(() => getReportedPosts());
  const [creatorApps, setCreatorApps] = useState<CreatorApplication[]>(() => getCreatorApplications().filter(a => a.status === 'pending'));
  const [supporterApps, setSupporterApps] = useState<SupporterApplication[]>(() => getSupporterApplications().filter(a => a.status === 'pending'));

  const hasAccess = currentUser && isSupporter(currentUser);

  const refresh = () => {
    setReportedPosts(getReportedPosts());
    setCreatorApps(getCreatorApplications().filter(a => a.status === 'pending'));
    setSupporterApps(getSupporterApplications().filter(a => a.status === 'pending'));
  };

  const handleDelete = (postId: string) => {
    if (confirm(isDe ? 'Möchtest du diesen gemeldeten Beitrag löschen?' : 'Do you want to delete this reported post?')) {
      deletePost(postId);
      refresh();
      onToast(isDe ? 'Unangemessener Beitrag gelöscht.' : 'Inappropriate post deleted.', 'success');
    }
  };

  const handleDismiss = (postId: string) => {
    dismissPostReports(postId);
    refresh();
    onToast(isDe ? 'Meldungen für diesen Beitrag verworfen.' : 'Reports dismissed for this post.', 'info');
  };

  const handleApproveApp = (appId: string, username: string) => {
    const success = approveCreatorApplication(appId);
    if (success) {
      refresh();
      onToast(
        isDe
          ? `Bewerbung von ${username} angenommen! Er/Sie ist nun offiziell im SZ Portal Team (Creator).`
          : `Application from ${username} approved! Now officially in the SZ Portal Team (Creator).`,
        'success'
      );
    } else {
      onToast(isDe ? 'Fehler beim Annehmen der Bewerbung.' : 'Error approving application.', 'error');
    }
  };

  const handleRejectApp = (appId: string, username: string) => {
    const success = rejectCreatorApplication(appId);
    if (success) {
      refresh();
      onToast(isDe ? `Creator-Bewerbung von ${username} abgelehnt.` : `Creator application from ${username} rejected.`, 'info');
    } else {
      onToast(isDe ? 'Fehler beim Ablehnen.' : 'Error rejecting.', 'error');
    }
  };

  const handleApproveSupporter = (appId: string, username: string) => {
    const success = approveSupporterApplication(appId);
    if (success) {
      refresh();
      onToast(
        isDe
          ? `Supporter-Bewerbung von ${username} angenommen! Er/Sie ist nun offiziell im SZ Portal Team (Supporter).`
          : `Supporter application from ${username} approved! Now officially in the SZ Portal Team (Supporter).`,
        'success'
      );
    } else {
      onToast(isDe ? 'Fehler beim Annehmen.' : 'Error approving.', 'error');
    }
  };

  const handleRejectSupporter = (appId: string, username: string) => {
    const success = rejectSupporterApplication(appId);
    if (success) {
      refresh();
      onToast(isDe ? `Supporter-Bewerbung von ${username} abgelehnt.` : `Supporter application from ${username} rejected.`, 'info');
    } else {
      onToast(isDe ? 'Fehler beim Ablehnen.' : 'Error rejecting.', 'error');
    }
  };

  if (!hasAccess) {
    return (
      <div className={`p-12 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'}`}>
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1">
          {isDe ? 'Zugriff eingeschränkt (Support-Channel)' : 'Access Restricted (Support Channel)'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {isDe
            ? 'Der Support-Channel ist exklusiv für Supporter, Entwickler und Administratoren zugänglich, um gemeldete Beiträge und Creator- sowie Supporter-Bewerbungen für das SZ Portal Team zu prüfen.'
            : 'The support channel is exclusively accessible to supporters, developers, and administrators to review reported posts and applications for the SZ Portal Team.'}
        </p>
      </div>
    );
  }

  const totalPending = reportedPosts.length + creatorApps.length + supporterApps.length;

  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isLight
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-slate-800'
          : 'bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border-emerald-500/30 text-slate-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {isDe ? 'Support-Channel (Supporter & Team)' : 'Support Channel (Supporters & Team)'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                {totalPending} {isDe ? 'Offen' : 'Pending'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isDe
                ? 'Creator-Bewerbungen und Supporter-Bewerbungen für das SZ Portal Team sowie gemeldete Beiträge.'
                : 'Creator applications and supporter applications for the SZ Portal Team as well as reported posts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Creator Applications Section for Supporters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            {isDe ? 'Ausstehende Creator-Bewerbungen (SZ Portal Team)' : 'Pending Creator Applications (SZ Portal Team)'}
          </h3>
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold">
            {creatorApps.length}
          </span>
        </div>

        {creatorApps.length === 0 ? (
          <div className={`p-6 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <p className="text-xs">
              {isDe ? 'Aktuell gibt es keine offenen Creator-Bewerbungen.' : 'Currently no pending creator applications.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creatorApps.map((app) => (
              <div key={app.id} className={`p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {app.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{app.username}</h4>
                      <p className="text-[10px] text-slate-400">{app.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold">
                    {isDe ? 'Wartet auf Prüfung' : 'Pending review'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                      {isDe ? 'Motivation:' : 'Motivation:'}
                    </span>
                    <p className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
                      "{app.reason}"
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                      {isDe ? 'Themen:' : 'Topics:'}
                    </span>
                    <p className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
                      {app.topics}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleRejectApp(app.id, app.username)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isDe ? 'Ablehnen' : 'Reject'}</span>
                  </button>
                  <button
                    onClick={() => handleApproveApp(app.id, app.username)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDe ? 'Annehmen & ins SZ Portal Team' : 'Accept & join team'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supporter Applications Section for Supporters */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            {isDe ? 'Ausstehende Supporter-Bewerbungen (SZ Portal Team)' : 'Pending Supporter Applications (SZ Portal Team)'}
          </h3>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold">
            {supporterApps.length}
          </span>
        </div>

        {supporterApps.length === 0 ? (
          <div className={`p-6 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <p className="text-xs">
              {isDe ? 'Aktuell gibt es keine offenen Supporter-Bewerbungen.' : 'Currently no pending supporter applications.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supporterApps.map((app) => (
              <div key={app.id} className={`p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
                      {app.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{app.username}</h4>
                      <p className="text-[10px] text-slate-400">{app.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold">
                    {isDe ? 'Wartet auf Prüfung' : 'Pending review'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                      {isDe ? 'Motivation:' : 'Motivation:'}
                    </span>
                    <p className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
                      "{app.reason}"
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                      {isDe ? 'Erfahrung / Moderation:' : 'Experience / Moderation:'}
                    </span>
                    <p className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
                      {app.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleRejectSupporter(app.id, app.username)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isDe ? 'Ablehnen' : 'Reject'}</span>
                  </button>
                  <button
                    onClick={() => handleApproveSupporter(app.id, app.username)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDe ? 'Annehmen & ins SZ Portal Team' : 'Accept & join team'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reported Posts Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            {isDe ? 'Gemeldete Beiträge' : 'Reported Posts'}
          </h3>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold">
            {reportedPosts.length}
          </span>
        </div>

        {reportedPosts.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">
              {isDe ? 'Keine gemeldeten Beiträge' : 'No reported posts'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {isDe ? 'Der Support-Channel ist sauber. Aktuell gibt es keine offenen Meldungen.' : 'The support channel is clean. There are currently no open reports.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reportedPosts.map((post) => (
              <div key={post.id} className="space-y-3">
                {/* Report Details Banner */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                        {isDe ? `${post.reports?.length || 0} Meldung(en) erhalten` : `${post.reports?.length || 0} report(s) received`}
                      </h4>
                      <div className="text-xs space-y-1 opacity-90">
                        {post.reports?.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold">@{r.username}:</span>
                            <span>"{r.reason}"</span>
                            <span className="text-[10px] opacity-75">
                              ({new Date(r.createdAt).toLocaleDateString(isDe ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleDismiss(post.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                    >
                      {isDe ? 'Meldungen verwerfen (Sicher)' : 'Dismiss Reports (Safe)'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow-md shadow-rose-600/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Beitrag löschen' : 'Delete Post'}</span>
                    </button>
                  </div>
                </div>

                {/* The Post Itself */}
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  isBookmarked={false}
                  onBookmarkToggle={() => {}}
                  onToast={onToast}
                  isLight={isLight}
                  language={language}
                  onViewProfile={onViewProfile}
                  onPostDeleted={refresh}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
