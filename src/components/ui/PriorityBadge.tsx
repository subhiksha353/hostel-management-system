import React from 'react';
import { ComplaintPriority } from '../../types/database';
import { PRIORITY_LABELS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Flame } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: ComplaintPriority;
  className?: string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className, size = 'md' }) => {
  const conf = PRIORITY_LABELS[priority] || PRIORITY_LABELS.medium;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide',
        conf.bg,
        conf.color,
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
        className
      )}
    >
      {priority === 'critical' ? (
        <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
      ) : (
        <span className={cn('w-1.5 h-1.5 rounded-full', conf.dot)} />
      )}
      {conf.label}
    </span>
  );
};
