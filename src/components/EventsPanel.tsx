import React, { useState } from 'react';
import { User, AppEvent } from '../types';
import { getAppEvents, addAppEvent, isDeveloper } from '../storage';
import {
  Calendar,
  Sparkles,
  Plus,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Megaphone,
  ShieldCheck,
  X,
  Layers,
} from 'lucide-react';

interface EventsPanelProps {
  currentUser: User | null;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  isLight?: boolean;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  currentUser,
  onToast,
  language = 'de',
  isLight = false,
}) => {
  const isDe = language === 'de';
  const isPhillipDev = isDeveloper(currentUser);

  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'added' | 'updated' | 'removed' | 'announcement'
  >('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'added' | 'updated' | 'removed' | 'announcement'>('added');
  const [version, setVersion] = useState('');

  const [events, setEvents] = useState<AppEvent[]>(getAppEvents());

  const filteredEvents = events.filter((ev) => {
    if (categoryFilter === 'all') return true;
    return ev.category === categoryFilter;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      onToast(
        isDe
          ? 'Bitte Titel und Beschreibung ausfüllen.'
          : 'Please enter title and description.',
        'error'
      );
      return;
    }

    const newEv = addAppEvent(title, description, category, version);
    setEvents(getAppEvents());
    setTitle('');
    setDescription('');
    setVersion('');
    setShowAddModal(false);
    onToast(
      isDe ? `System-Event "${newEv.title}" veröffentlicht!` : `Event "${newEv.title}" published!`,
      'success'
    );
  };

  const getCategoryBadge = (cat: AppEvent['category']) => {
    switch (cat) {
      case 'added':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
            <Plus className="w-3 h-3" /> {isDe ? 'Neu hinzugefügt' : 'Added'}
          </span>
        );
      case 'updated':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {isDe ? 'Aktualisiert' : 'Updated'}
          </span>
        );
      case 'removed':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {isDe ? 'Entfernt' : 'Removed'}
          </span>
        );
      case 'announcement':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> {isDe ? 'Ankündigung' : 'Announcement'}
          </span>
        );
    }
  };

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
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {isDe ? 'System Events & Updates Log' : 'System Events & Updates Log'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded uppercase">
                  {isDe ? 'Changelog' : 'Changelog'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDe
                  ? 'Übersicht über hinzugefügte Funktionen, entfernte Module und Systemnachrichten'
                  : 'Overview of added features, removed modules, and platform announcements'}
              </p>
            </div>
          </div>

          {/* Phillip Dev Add Event button */}
          {isPhillipDev && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 self-start sm:self-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDe ? 'Event hinzufügen' : 'Post Event'}</span>
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="overflow-x-auto no-scrollbar py-1 mt-4 pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDe ? 'Alle Updates' : 'All Updates'}
            </button>

            <button
              onClick={() => setCategoryFilter('added')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'added'
                  ? 'bg-emerald-600 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDe ? 'Neu hinzugefügt' : 'Added'}
            </button>

            <button
              onClick={() => setCategoryFilter('updated')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'updated'
                  ? 'bg-indigo-600 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDe ? 'Aktualisiert' : 'Updated'}
            </button>

            <button
              onClick={() => setCategoryFilter('removed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'removed'
                  ? 'bg-rose-600 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDe ? 'Entfernt' : 'Removed'}
            </button>

            <button
              onClick={() => setCategoryFilter('announcement')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'announcement'
                  ? 'bg-amber-600 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDe ? 'Ankündigungen' : 'Announcements'}
            </button>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {filteredEvents.length === 0 ? (
        <div
          className={`border rounded-2xl p-8 text-center ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <Calendar className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
          <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {isDe ? 'Keine Events für diese Kategorie' : 'No events in this category'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800/80">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all relative pl-12 sm:pl-14 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Timeline marker node */}
              <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-slate-950 shadow-md shadow-indigo-600/40" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {ev.title}
                  </h3>
                  {ev.version && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {ev.version}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getCategoryBadge(ev.category)}
                  <span className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(ev.date).toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {ev.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Phillip Dev Create Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {isDe ? 'Neues System-Event erstellen' : 'Post New System Event'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isDe ? 'Titel' : 'Title'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isDe ? 'z. B. Neues Feature X hinzugefügt' : 'e.g. Added Feature X'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isDe ? 'Kategorie' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as 'added' | 'updated' | 'removed' | 'announcement')
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="added">{isDe ? 'Neu hinzugefügt' : 'Added'}</option>
                    <option value="updated">{isDe ? 'Aktualisiert' : 'Updated'}</option>
                    <option value="removed">{isDe ? 'Entfernt' : 'Removed'}</option>
                    <option value="announcement">{isDe ? 'Ankündigung' : 'Announcement'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isDe ? 'Version (Optional)' : 'Version (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="z. B. v2.8.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isDe ? 'Beschreibung' : 'Description'}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isDe ? 'Detailinformationen zum Update...' : 'Details about the update...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  {isDe ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30"
                >
                  {isDe ? 'Event veröffentlichen' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
