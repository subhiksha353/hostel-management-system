import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'urgent' | 'success' | 'blue' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const iconVariants = {
    default: 'bg-slate-100 text-slate-700',
    urgent: 'bg-rose-100 text-rose-600',
    success: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card hoverEffect className="p-5 flex items-start justify-between">
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-bold pt-1',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', iconVariants[variant])}>
        {icon}
      </div>
    </Card>
  );
};
