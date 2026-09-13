import React from 'react';
import { ComplaintStatus } from '../../types/database';
import { STATUS_LABELS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const conf = STATUS_LABELS[status] || STATUS_LABELS.submitted;

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
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {conf.label}
    </span>
  );
};
