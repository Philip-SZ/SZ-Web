import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, releaseUser, removeUser } from '../storage';
import { UserCheck, UserX, Clock, ShieldCheck, Mail, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApprovalPanelProps {
  currentUser: User | null;
  onUserReleased: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({ currentUser, onUserReleased, onToast }) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const allUsers = getUsers();
  const isPhillipDev = currentUser?.role === 'admin' || currentUser?.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';

  if (!isPhillipDev) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
        <UserX className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Access Restricted</h3>
        <p className="text-xs text-slate-400 mt-1">
          Only Phillip Dev can view and release pending user requests.
        </p>
      </div>
    );
  }

  const handleApprove = (user: User) => {
    const ok = releaseUser(user.id);
    if (ok) {
      onToast(`User "${user.username}" has been released! Downloads & posts are now unlocked for them.`, 'success');
      onUserReleased();
    } else {
      onToast('Failed to release user.', 'error');
    }
  };

  const handleReject = (user: User) => {
    const ok = removeUser(user.id);
    if (ok) {
      onToast(`Registration request for "${user.username}" was removed.`, 'info');
      onUserReleased();
    } else {
      onToast('Failed to reject user.', 'error');
    }
  };

  // Filter logic
  const filteredUsers = allUsers.filter((u) => {
    // Exclude Phillip Dev self from approval list
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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">User Access Release Management</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
                  Phillip Dev Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Approve newly registered accounts to grant access to post messages, file downloads, and bookmarks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'approved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved Members</span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Users
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registered users by name or email..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* User Requests List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No user requests match this filter</p>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'pending'
                ? 'All registered users have been released by Phillip Dev.'
                : 'Try clearing the search query or switching filters.'}
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
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    user.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {user.username.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100 text-sm">{user.username}</h3>
                    {user.status === 'pending' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Release
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Released Member
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {user.email}
                    </span>
                    <span>•</span>
                    <span>
                      Registered{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {user.status === 'pending' ? (
                  <button
                    onClick={() => handleApprove(user)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Release User</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                    Full Access Granted
                  </span>
                )}

                <button
                  onClick={() => handleReject(user)}
                  className="px-3 py-2 bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-medium transition-colors"
                  title="Remove account"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
