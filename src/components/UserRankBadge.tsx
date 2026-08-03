import React from 'react';
import { UserRank } from '../types';
import { Crown, Terminal, Sparkles, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';

interface UserRankBadgeProps {
  rank?: UserRank;
  language?: 'de' | 'en';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const UserRankBadge: React.FC<UserRankBadgeProps> = ({
  rank = 'normal',
  language = 'de',
  size = 'sm',
  showLabel = true,
}) => {
  const isDe = language === 'de';

  const getRankConfig = () => {
    switch (rank) {
      case 'admin':
        return {
          label: isDe ? 'Admin' : 'Admin',
          icon: <Crown className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'developer':
        return {
          label: isDe ? 'Entwickler' : 'Developer',
          icon: <Terminal className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      case 'supporter':
        return {
          label: isDe ? 'Supporter' : 'Supporter',
          icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'creator':
        return {
          label: isDe ? 'Ersteller' : 'Creator',
          icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'not_granted':
        return {
          label: isDe ? 'Nicht gewährt' : 'Not granted',
          icon: <Lock className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
        };
      case 'normal':
      default:
        return {
          label: isDe ? 'Normal' : 'Normal',
          icon: <UserIcon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          classes: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const config = getRankConfig();

  const sizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px]'
      : size === 'md'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`font-semibold rounded border inline-flex items-center gap-1 ${config.classes} ${sizeClasses}`}
      title={`${isDe ? 'Rang' : 'Rank'}: ${config.label}`}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
