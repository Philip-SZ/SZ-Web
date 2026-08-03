import React, { useState } from 'react';
import { User, UserRank, CreatorApplication } from '../types';
import {
  getUsers,
  releaseUser,
  removeUser,
  toggleVerifyUser,
  updateUserRank,
  canApproveUsers,
  getCreatorApplications,
  approveCreatorApplication,
  rejectCreatorApplication,
  sendCreatorSurveyToUsers,
} from '../storage';
import { UserRankBadge } from './UserRankBadge';
import {
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  Eye,
  Sparkles,
  Send,
  FileText,
} from 'lucide-react';

interface ApprovalPanelProps {
  currentUser: User | null;
  onUserReleased: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  onViewProfile?: (user: User) => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  currentUser,
  onUserReleased,
  onToast,
  language = 'de',
  onViewProfile,
}) => {
  const isDe = language === 'de';
  const [panelSection, setPanelSection] = useState<'users' | 'creator_apps'>('users');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const allUsers = getUsers();
  const canApprove = canApproveUsers(currentUser);
  const creatorApps = getCreatorApplications();

  if (!canApprove) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
        <UserX className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">
          {isDe ? 'Zugriff eingeschränkt' : 'Access Restricted'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isDe
            ? 'Nur Entwickler und Admins können ausstehende Benutzeranfragen und Creator-Bewerbungen einsehen.'
            : 'Only Developers and Admins can view pending user requests and creator applications.'}
        </p>
      </div>
    );
  }

  const handleApprove = (user: User) => {
    const ok = releaseUser(user.id);
    if (ok) {
      onToast(
        isDe
          ? `Benutzer "${user.username}" wurde freigeschaltet! Downloads und Beiträge sind jetzt verfügbar.`
          : `User "${user.username}" has been released! Downloads & posts are now unlocked for them.`,
        'success'
      );
      onUserReleased();
    } else {
      onToast(isDe ? 'Fehler beim Freischalten des Benutzers.' : 'Failed to release user.', 'error');
    }
  };

  const handleReject = (user: User) => {
    const ok = removeUser(user.id);
    if (ok) {
      onToast(
        isDe
          ? `Registrierungsanfrage für "${user.username}" wurde entfernt.`
          : `Registration request for "${user.username}" was removed.`,
        'info'
      );
      onUserReleased();
    } else {
      onToast(isDe ? 'Fehler beim Ablehnen des Benutzers.' : 'Failed to reject user.', 'error');
    }
  };

  const handleToggleVerify = (user: User) => {
    const res = toggleVerifyUser(user.id);
    if (res.success) {
      onToast(
        res.isVerified
          ? (isDe ? `Blauer Haken für "${user.username}" vergeben!` : `Blue checkmark granted to "${user.username}"!`)
          : (isDe ? `Blauer Haken für "${user.username}" entfernt.` : `Blue checkmark removed from "${user.username}".`),
        'info'
      );
      onUserReleased();
    }
  };

  const handleRankChange = (user: User, newRank: UserRank) => {
    const res = updateUserRank(user.id, newRank);
    if (res.success) {
      onToast(
        isDe
          ? `Rang von "${user.username}" auf "${newRank}" geändert.`
          : `Rank for "${user.username}" changed to "${newRank}".`,
        'success'
      );
      onUserReleased();
    }
  };

  const handleApproveApp = (appId: string) => {
    const success = approveCreatorApplication(appId);
    if (success) {
      onToast(isDe ? 'Creator-Bewerbung erfolgreich angenommen! Benutzer ist nun Creator.' : 'Creator application approved successfully!', 'success');
      onUserReleased();
    }
  };

  const handleRejectApp = (appId: string) => {
    const success = rejectCreatorApplication(appId);
    if (success) {
      onToast(isDe ? 'Creator-Bewerbung abgelehnt.' : 'Creator application rejected.', 'info');
      onUserReleased();
    }
  };

  const handleSendSurvey = () => {
    const count = sendCreatorSurveyToUsers();
    onToast(
      isDe
        ? `Creator-Befragung wurde an ${count} Mitglieder gesendet!`
        : `Creator survey sent to ${count} members!`,
      'success'
    );
  };

  // Filter logic
  const filteredUsers = allUsers.filter((u) => {
    if (u.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev') return false;
    if (filter === 'pending' && u.status !== 'pending') return false;
    if (filter === 'approved' && u.status !== 'approved') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = allUsers.filter(u => u.status === 'pending' && u.username.toLowerCase().replace(/\s+/g, '') !== 'phillipdev').length;
  const pendingAppsCount = creatorApps.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Section Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  {isDe ? 'Entwickler & Admin Verwaltung' : 'Developer & Admin Management'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                  {isDe ? 'Admin & Dev Panel' : 'Admin & Dev Panel'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isDe
                  ? 'Verwalte Benutzerzugriffe, verifiziere Konten, bewerte Creator-Bewerbungen und versende Umfragen.'
                  : 'Manage user access, verify accounts, evaluate creator applications, and send out surveys.'}
              </p>
            </div>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setPanelSection('users')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                panelSection === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isDe ? 'Mitglieder & Freigaben' : 'Users & Releases'}</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPanelSection('creator_apps')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                panelSection === 'creator_apps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDe ? 'Creator-Bewerbungen' : 'Creator Applications'}</span>
              {pendingAppsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {pendingAppsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section 1 Filters & Search */}
        {panelSection === 'users' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isDe ? 'Registrierte Benutzer nach Name oder E-Mail suchen...' : 'Search registered users by name or email...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 whitespace-nowrap">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{isDe ? 'Ausstehend' : 'Pending'}</span>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'approved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isDe ? 'Freigeschaltet' : 'Released'}
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isDe ? 'Alle' : 'All'}
              </button>
            </div>
          </div>
        )}

        {/* Section 2 Creator Survey Broadcast Button */}
        {panelSection === 'creator_apps' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                {isDe ? 'Creator-Befragung & Umfragen verwalten' : 'Manage Creator Surveys & Questionnaires'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDe
                  ? 'Sende Umfragen an Mitglieder oder bewerte eingegangene Creator-Bewerbungen für das Schreiben von Beiträgen.'
                  : 'Send surveys to members or review submitted creator applications for writing posts.'}
              </p>
            </div>

            <button
              onClick={handleSendSurvey}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDe ? 'Creator-Befragung senden' : 'Send Creator Survey'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area based on section */}
      {panelSection === 'users' ? (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                {isDe ? 'Keine Benutzeranfragen entsprechen diesem Filter' : 'No user requests match this filter'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  user.status === 'pending'
                    ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border-amber-800/50 shadow-lg'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    onClick={() => onViewProfile && onViewProfile(user)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer overflow-hidden ${
                      user.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => onViewProfile && onViewProfile(user)}
                        className="font-semibold text-slate-100 text-sm flex items-center gap-1.5 cursor-pointer hover:text-indigo-400 transition-colors"
                      >
                        <span>{user.username}</span>
                        {user.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                        )}
                      </h3>

                      <UserRankBadge rank={user.rank} language={language} size="sm" />

                      {user.status === 'pending' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {isDe ? 'Wartet auf Freischaltung' : 'Pending Release'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {isDe ? 'Freigeschaltet' : 'Released'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium px-1.5">{isDe ? 'Rang:' : 'Rank:'}</span>
                    <select
                      value={user.rank || 'normal'}
                      onChange={(e) => handleRankChange(user, e.target.value as UserRank)}
                      className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="not_granted">{isDe ? 'Nicht gewährt' : 'Not granted'}</option>
                      <option value="normal">Normal</option>
                      <option value="creator">Creator</option>
                      <option value="developer">Developer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onViewProfile && onViewProfile(user)}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isDe ? 'Profil' : 'Profile'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleVerify(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      user.isVerified
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <BadgeCheck className={`w-3.5 h-3.5 ${user.isVerified ? 'text-sky-400 fill-sky-400/20' : ''}`} />
                    <span>{user.isVerified ? (isDe ? 'Verifiziert' : 'Verified') : (isDe ? 'Verifizieren' : 'Verify')}</span>
                  </button>

                  {user.status === 'pending' ? (
                    <button
                      onClick={() => handleApprove(user)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Freischalten' : 'Release'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                      {isDe ? 'Freigeschaltet' : 'Released'}
                    </span>
                  )}

                  <button
                    onClick={() => handleReject(user)}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-medium transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Creator Applications Section */
        <div className="space-y-3">
          {creatorApps.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                {isDe ? 'Keine Creator-Bewerbungen vorhanden' : 'No creator applications available'}
              </p>
            </div>
          ) : (
            creatorApps.map((app) => (
              <div
                key={app.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  app.status === 'pending'
                    ? 'bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900 border-indigo-800/50 shadow-lg'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0 mt-0.5">
                    {app.username.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-100 text-sm">
                        {app.username}
                      </h3>
                      <span className="text-xs text-slate-400">({app.email})</span>
                      {app.status === 'pending' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                          {isDe ? 'Wartet auf Freigabe' : 'Pending Review'}
                        </span>
                      ) : app.status === 'approved' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                          {isDe ? 'Angenommen (Creator)' : 'Approved (Creator)'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                          {isDe ? 'Abgelehnt' : 'Rejected'}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                      <div>
                        <span className="text-indigo-400 font-semibold">{isDe ? 'Gewünschte Themen:' : 'Preferred Topics:'}</span>{' '}
                        <span className="text-slate-200">{app.topics}</span>
                      </div>
                      <div>
                        <span className="text-indigo-400 font-semibold">{isDe ? 'Motivation / Begründung:' : 'Motivation:'}</span>{' '}
                        <span className="text-slate-300">{app.reason}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      {isDe ? 'Eingereicht am: ' : 'Submitted on: '}
                      {new Date(app.createdAt).toLocaleString(isDe ? 'de-DE' : 'en-US')}
                    </p>
                  </div>
                </div>

                {/* Application Actions */}
                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleApproveApp(app.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Als Creator freigeben' : 'Approve as Creator'}</span>
                    </button>
                    <button
                      onClick={() => handleRejectApp(app.id)}
                      className="px-3 py-2 bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>{isDe ? 'Ablehnen' : 'Reject'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
