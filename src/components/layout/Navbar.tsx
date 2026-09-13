import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Shield, GraduationCap, Sparkles, Building, Megaphone, Menu, X, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useBranding } from '../../context/BrandingContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useBranding();

  const renderLogoIcon = () => {
    if (branding.logoUrl) {
      return <img src={branding.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />;
    }
    switch (branding.logoType) {
      case 'graduation-cap':
        return <GraduationCap className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'building':
        return <Building className="w-6 h-6" />;
      case 'megaphone':
        return <Megaphone className="w-6 h-6" />;
      default:
        return <ShieldCheck className="w-6 h-6" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              {renderLogoIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">{branding.siteName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 tracking-wider">
                  Secure
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">{branding.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
              Student Hub
            </Link>
            <Link to="/student/food-count" className="hover:text-blue-600 transition-colors">
              Mess Attendance
            </Link>
            <Link to="/student/leave/requests" className="hover:text-blue-600 transition-colors">
              Leave & Outpass
            </Link>
            <Link to="/student/privacy" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Privacy Center
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/student/create">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Report a Problem
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
            <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">
              Student Hub
            </Link>
            <Link to="/student/food-count" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">
              Mess Attendance
            </Link>
            <Link to="/student/leave/requests" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">
              Leave & Outpass
            </Link>
            <Link to="/student/privacy" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              Privacy Center
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link to="/student/create" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Report a Problem Anonymously
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/management/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full">
                  Staff / Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
