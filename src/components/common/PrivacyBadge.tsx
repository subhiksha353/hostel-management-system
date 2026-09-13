import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyBadge: React.FC<{ linkToCenter?: boolean }> = ({ linkToCenter = true }) => {
  const content = (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm hover:bg-emerald-100/80 transition-colors">
      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
      <span>Zero-Knowledge Identity Vault Active</span>
    </div>
  );

  if (linkToCenter) {
    return (
      <Link to="/student/privacy" title="Click to view Privacy Architecture Details">
        {content}
      </Link>
    );
  }

  return content;
};
