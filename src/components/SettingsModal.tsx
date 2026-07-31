import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Globe,
  Type,
  LayoutGrid,
  RotateCcw,
  Check,
  Sparkles,
  Sliders
} from 'lucide-react';

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: 'normal' | 'large';
  compactView: boolean;
  language: 'de' | 'en';
  autoDownload: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetStorage?: () => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStorage,
  onToast,
}) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {settings.language === 'de' ? 'Einstellungen' : 'Settings'}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {settings.language === 'de' ? 'Erscheinungsbild & Optionen' : 'Appearance & Preferences'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1: Light and Dark Mode */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2.5 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                {settings.language === 'de' ? 'Erscheinungsbild (Theme)' : 'Theme Mode'}
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Dark Mode Option */}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-md'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs font-bold">
                      {settings.language === 'de' ? 'Dunkelmodus' : 'Dark Mode'}
                    </div>
                    <div className="text-[10px] opacity-75">Dark Theme</div>
                  </div>
                  {settings.theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                {/* Light Mode Option */}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    settings.theme === 'light'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-600 font-semibold shadow-md'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs font-bold">
                      {settings.language === 'de' ? 'Hellmodus' : 'Light Mode'}
                    </div>
                    <div className="text-[10px] opacity-75">Light Theme</div>
                  </div>
                  {settings.theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>
            </div>

            {/* Section 2: More Settings */}
            <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                {settings.language === 'de' ? 'Weitere Einstellungen' : 'More Settings'}
              </label>

              <div className="space-y-3">
                {/* Language selection */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold">
                        {settings.language === 'de' ? 'Sprache' : 'Language'}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {settings.language === 'de' ? 'Deutsch / Englisch' : 'German / English'}
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-slate-800/40 p-0.5 rounded-lg border border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ language: 'de' })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        settings.language === 'de'
                          ? 'bg-indigo-600 text-white shadow'
                          : isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      DE
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ language: 'en' })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        settings.language === 'en'
                          ? 'bg-indigo-600 text-white shadow'
                          : isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Type className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold">
                        {settings.language === 'de' ? 'Schriftgröße' : 'Font Size'}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {settings.fontSize === 'large' ? 'Groß (110%)' : 'Normal (100%)'}
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-slate-800/40 p-0.5 rounded-lg border border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ fontSize: 'normal' })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        settings.fontSize === 'normal'
                          ? 'bg-indigo-600 text-white shadow'
                          : isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ fontSize: 'large' })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        settings.fontSize === 'large'
                          ? 'bg-indigo-600 text-white shadow'
                          : isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {settings.language === 'de' ? 'Groß' : 'Large'}
                    </button>
                  </div>
                </div>

                {/* Compact View Toggle */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold">
                        {settings.language === 'de' ? 'Kompakte Kartenansicht' : 'Compact View Mode'}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {settings.language === 'de' ? 'Weniger Abstand zwischen Beiträgen' : 'Slimmer spacing for posts'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ compactView: !settings.compactView })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      settings.compactView ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.compactView ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reset Local Storage Button */}
                {onResetStorage && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-900/40'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="text-xs font-semibold text-rose-300">
                          {settings.language === 'de' ? 'Daten zurücksetzen' : 'Reset Local Cache'}
                        </div>
                        <div className="text-[10px] text-rose-400/80">
                          {settings.language === 'de' ? 'Setzt Testdaten auf Standard zurück' : 'Restores standard seed data'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(settings.language === 'de' ? 'Möchtest du wirklich alle Daten zurücksetzen?' : 'Reset all demo data?')) {
                          onResetStorage();
                          if (onToast) onToast(settings.language === 'de' ? 'Daten zurückgesetzt.' : 'Storage reset successfully.', 'success');
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {settings.language === 'de' ? 'Zurücksetzen' : 'Reset'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              {settings.language === 'de' ? 'Fertig' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
