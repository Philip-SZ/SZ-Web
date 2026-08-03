import React, { useState } from 'react';
import { User } from '../types';
import { submitSupporterApplication, getSupporterApplications } from '../storage';
import { ShieldCheck, Send, X, CheckCircle2 } from 'lucide-react';

interface SupporterApplicationModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
  isLight?: boolean;
}

export const SupporterApplicationModal: React.FC<SupporterApplicationModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onToast,
  language = 'de',
  isLight = false,
}) => {
  const isDe = language === 'de';
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const existingApps = getSupporterApplications();
  const myApp = existingApps.find(a => a.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !experience.trim()) {
      onToast(isDe ? 'Bitte fülle alle Pflichtfelder aus.' : 'Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      submitSupporterApplication(currentUser.id, currentUser.username, currentUser.email, reason, experience);
      onToast(
        isDe
          ? 'Deine Supporter-Bewerbung wurde erfolgreich eingereicht! Das SZ Portal Team wurde benachrichtigt.'
          : 'Your supporter application was submitted successfully! The SZ Portal Team has been notified.',
        'success'
      );
      setReason('');
      setExperience('');
      onClose();
    } catch {
      onToast(isDe ? 'Fehler beim Einreichen der Bewerbung.' : 'Error submitting application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isDe ? 'Bewerbung zum Supporter' : 'Supporter Application'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDe ? 'Werde Teil des SZ Portal Teams und hilf im Support-Channel' : 'Join the SZ Portal Team and help in the support channel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {myApp ? (
            <div className={`p-4 rounded-xl border ${
              myApp.status === 'approved'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : myApp.status === 'rejected'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                {myApp.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {myApp.status === 'approved'
                    ? (isDe ? 'Bewerbung genehmigt! Du bist Supporter.' : 'Application Approved! You are a Supporter.')
                    : myApp.status === 'rejected'
                    ? (isDe ? 'Bewerbung wurde leider abgelehnt.' : 'Application was rejected.')
                    : (isDe ? 'Supporter-Bewerbung in Bearbeitung...' : 'Supporter application is pending review...')}
                </span>
              </div>
              <p className="text-xs opacity-90">
                {isDe
                  ? `Eingereicht am: ${new Date(myApp.createdAt).toLocaleDateString()}`
                  : `Submitted on: ${new Date(myApp.createdAt).toLocaleDateString()}`}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-300">
                {isDe ? 'Warum möchtest du Supporter im SZ Portal Team werden?' : 'Why do you want to become a supporter in the SZ Portal Team?'}
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={isDe ? 'Deine Motivation (z.B. Community unterstützen, Beiträge prüfen)...' : 'Your motivation (e.g. support community, check posts)...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-300">
                {isDe ? 'Welche Erfahrung hast du im Bereich Moderation / Community?' : 'What experience do you have in moderation / community?'}
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={isDe ? 'z.B. Bereits aktiv in Foren, hilfsbereit, Teamfähigkeit' : 'e.g. Active in forums, helpful, teamwork'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isDe ? 'Abbrechen' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? (isDe ? 'Wird gesendet...' : 'Submitting...') : (isDe ? 'Supporter-Bewerbung absenden' : 'Submit Supporter Application')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
