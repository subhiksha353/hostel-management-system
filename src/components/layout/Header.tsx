import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../context/BrandingContext';
import { NotificationBell } from '../common/NotificationBell';
import { PrivacyBadge } from '../common/PrivacyBadge';
import { ROLE_LABELS } from '../../lib/constants';
import { ShieldCheck, LogOut, User, Menu, Shield, GraduationCap, Sparkles, Building, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, role, logout, isGuest } = useAuth();
  const { branding } = useBranding();
  const roleInfo = ROLE_LABELS[isGuest ? 'guest_student' : role] || ROLE_LABELS.student;

  const renderLogoIcon = () => {
    if (branding.logoUrl) {
      return <img src={branding.logoUrl} alt="Logo" className="w-5 h-5 object-contain" />;
    }
    switch (branding.logoType) {
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'building':
        return <Building className="w-5 h-5" />;
      case 'megaphone':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              {renderLogoIcon()}
            </div>
            <span className="font-extrabold text-slate-900 text-sm truncate max-w-[120px]">{branding.siteName}</span>
          </Link>
          <div className="hidden sm:block">
            <PrivacyBadge linkToCenter />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />

        {/* User Pill / Role Display */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>

          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {isGuest ? 'Anonymous Guest' : user?.profile?.name || 'User'}
            </p>
            <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded ' + roleInfo.badge}>
              {roleInfo.label}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
