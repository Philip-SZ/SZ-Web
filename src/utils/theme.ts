export type AccentColor = 'indigo' | 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

export interface AccentClasses {
  name: string;
  bg: string;
  solidBg: string;
  hoverBg: string;
  text: string;
  border: string;
  ring: string;
  badgeBg: string;
  gradient: string;
  shadow: string;
  selection: string;
}

export function getAccentClasses(accent: string = 'indigo'): AccentClasses {
  switch (accent) {
    case 'emerald':
      return {
        name: 'emerald',
        bg: 'bg-emerald-600 hover:bg-emerald-500',
        solidBg: 'bg-emerald-600',
        hoverBg: 'hover:bg-emerald-500',
        text: 'text-emerald-500 dark:text-emerald-400',
        border: 'border-emerald-500/50 hover:border-emerald-500',
        ring: 'ring-emerald-500/30',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
        shadow: 'shadow-emerald-500/20',
        selection: 'selection:bg-emerald-500 selection:text-white',
      };
    case 'sky':
      return {
        name: 'sky',
        bg: 'bg-sky-600 hover:bg-sky-500',
        solidBg: 'bg-sky-600',
        hoverBg: 'hover:bg-sky-500',
        text: 'text-sky-500 dark:text-sky-400',
        border: 'border-sky-500/50 hover:border-sky-500',
        ring: 'ring-sky-500/30',
        badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
        gradient: 'from-sky-600 via-sky-500 to-cyan-400',
        shadow: 'shadow-sky-500/20',
        selection: 'selection:bg-sky-500 selection:text-white',
      };
    case 'violet':
      return {
        name: 'violet',
        bg: 'bg-violet-600 hover:bg-violet-500',
        solidBg: 'bg-violet-600',
        hoverBg: 'hover:bg-violet-500',
        text: 'text-violet-500 dark:text-violet-400',
        border: 'border-violet-500/50 hover:border-violet-500',
        ring: 'ring-violet-500/30',
        badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
        gradient: 'from-violet-600 via-violet-500 to-purple-400',
        shadow: 'shadow-violet-500/20',
        selection: 'selection:bg-violet-500 selection:text-white',
      };
    case 'amber':
      return {
        name: 'amber',
        bg: 'bg-amber-600 hover:bg-amber-500',
        solidBg: 'bg-amber-600',
        hoverBg: 'hover:bg-amber-500',
        text: 'text-amber-500 dark:text-amber-400',
        border: 'border-amber-500/50 hover:border-amber-500',
        ring: 'ring-amber-500/30',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        gradient: 'from-amber-600 via-amber-500 to-yellow-400',
        shadow: 'shadow-amber-500/20',
        selection: 'selection:bg-amber-500 selection:text-white',
      };
    case 'rose':
      return {
        name: 'rose',
        bg: 'bg-rose-600 hover:bg-rose-500',
        solidBg: 'bg-rose-600',
        hoverBg: 'hover:bg-rose-500',
        text: 'text-rose-500 dark:text-rose-400',
        border: 'border-rose-500/50 hover:border-rose-500',
        ring: 'ring-rose-500/30',
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        gradient: 'from-rose-600 via-rose-500 to-pink-400',
        shadow: 'shadow-rose-500/20',
        selection: 'selection:bg-rose-500 selection:text-white',
      };
    case 'indigo':
    default:
      return {
        name: 'indigo',
        bg: 'bg-indigo-600 hover:bg-indigo-500',
        solidBg: 'bg-indigo-600',
        hoverBg: 'hover:bg-indigo-500',
        text: 'text-indigo-500 dark:text-indigo-400',
        border: 'border-indigo-500/50 hover:border-indigo-500',
        ring: 'ring-indigo-500/30',
        badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        gradient: 'from-indigo-600 via-indigo-500 to-sky-400',
        shadow: 'shadow-indigo-500/20',
        selection: 'selection:bg-indigo-500 selection:text-white',
      };
  }
}

