import React from 'react';
import { ShieldCheck, Lock, Shield, GraduationCap, Sparkles, Building, Megaphone, Phone, User, UserCog, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';

export const Footer: React.FC = () => {
  const { branding } = useBranding();

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
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                {renderLogoIcon()}
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{branding.siteName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              “{branding.tagline}”
            </p>
            <div className="text-xs text-slate-400">
              Campus: <strong className="text-slate-200">{branding.collegeName}</strong>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-xl">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Cryptographic separation of student identity from grievance data.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Students & Hostels</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/student/create" className="hover:text-blue-400 transition-colors">Report a Grievance (Anonymous)</Link></li>
              <li><Link to="/student/leave/requests" className="hover:text-blue-400 transition-colors">Digital Outpass & Leave Pass</Link></li>
              <li><Link to="/student/food-count" className="hover:text-blue-400 transition-colors">Mess Attendance Count</Link></li>
              <li><Link to="/student/emergency" className="hover:text-rose-400 transition-colors">🚨 Emergency SOS Report</Link></li>
              <li><Link to="/student/privacy" className="hover:text-blue-400 transition-colors">Student Privacy Center</Link></li>
            </ul>
          </div>

          {/* Administration & Mess */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/admin" className="hover:text-indigo-400 transition-colors font-bold text-indigo-300">University Admin Portal</Link></li>
              <li><Link to="/chef/dashboard" className="hover:text-amber-400 transition-colors font-bold text-amber-300">Mess Chef & Kitchen Dashboard</Link></li>
              <li><Link to="/management/leave-approvals" className="hover:text-blue-400 transition-colors">Warden Outpass Approvals</Link></li>
              <li><Link to="/management/complaints" className="hover:text-blue-400 transition-colors">Grievance Audit & Moderation</Link></li>
              <li><Link to="/management/analytics" className="hover:text-blue-400 transition-colors">Campus Hotspot Heatmap</Link></li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Privacy Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built on PostgreSQL Row Level Security (RLS) guaranteeing that administrators and wardens cannot retrieve student identities.
            </p>
            <div className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} {branding.siteName}. All rights reserved.
            </div>
          </div>

          {/* Important Contacts */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">📞 Important Contacts</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-rose-300 font-bold">Ambulance</p>
                  <a href="tel:108" className="text-white font-semibold hover:text-rose-300">108</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-blue-300 font-bold">Chief Warden</p>
                  <a href="tel:+919443200100" className="text-white font-semibold hover:text-blue-300">+91 94432 00100</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-violet-300 font-bold">Lady Warden</p>
                  <a href="tel:+919443200200" className="text-white font-semibold hover:text-violet-300">+91 94432 00200</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCog className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-300 font-bold">Associate Director (AD)</p>
                  <a href="tel:+919443200300" className="text-white font-semibold hover:text-emerald-300">+91 94432 00300</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-pink-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-pink-300 font-bold">Health Centre</p>
                  <a href="tel:+919443200400" className="text-white font-semibold hover:text-pink-300">+91 94432 00400</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-amber-300 font-bold">Security Desk (24×7)</p>
                  <a href="tel:+919443200500" className="text-white font-semibold hover:text-amber-300">+91 94432 00500</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{branding.collegeName} • Institutional Student Grievance System</p>
          <div className="flex items-center gap-6">
            <Link to="/student/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/student/privacy" className="hover:text-slate-300">Terms of Governance</Link>
            <Link to="/student/privacy" className="hover:text-slate-300">Zero-Knowledge Protocol</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
