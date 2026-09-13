import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'privacy' | 'urgent';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-sm',
    elevated: 'bg-white border border-slate-100 shadow-soft',
    glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-sm',
    privacy: 'bg-emerald-50/50 border border-emerald-200/80 shadow-sm',
    urgent: 'bg-rose-50/60 border border-rose-200 shadow-sm',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        variantStyles[variant],
        hoverEffect && 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
