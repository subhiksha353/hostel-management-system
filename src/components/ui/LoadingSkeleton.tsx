import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 w-24 bg-slate-200 rounded-full" />
      <div className="h-5 w-20 bg-slate-200 rounded-full" />
    </div>
    <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
    <div className="space-y-2">
      <div className="h-4 w-full bg-slate-100 rounded" />
      <div className="h-4 w-5/6 bg-slate-100 rounded" />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-8 w-20 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="border-b border-slate-100 animate-pulse">
    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded-full" /></td>
    <td className="py-4 px-4"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
    <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
    <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
    <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
    <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
  </tr>
);
