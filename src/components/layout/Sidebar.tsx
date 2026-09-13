import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../context/BrandingContext';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Building,
  Megaphone,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Lightbulb,
  Lock,
  Flame,
  BarChart3,
  History,
  Settings,
  X,
  Calendar,
  UtensilsCrossed,
  ChefHat,
  Camera,
  Car,
  QrCode,
} from 'lucide-react';

export interface SidebarProps {
  onCloseMobile?: () => void;
}

interface SidebarNavItem {
  to: string;
  label: string;
  icon: any;
  highlight?: boolean;
  urgent?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role } = useAuth();
  const { branding } = useBranding();
  const isStudent = role === 'student';
  const isCollegeManagement = role === 'college_management';
  const isChef = role === 'chef';
  const isWatchman = role === 'watchman';
  const isAdmin = role === 'admin' || role === 'super_admin';

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

  const studentNav: SidebarNavItem[] = [
    { to: '/student/dashboard', label: 'Hostel Hub', icon: LayoutDashboard },
    { to: '/student/create', label: 'Complaint Box', icon: PlusCircle, highlight: true },
    { to: '/student/leave/requests', label: 'Leave & Outpass', icon: Calendar },
    { to: '/student/food-count', label: 'Food Attendance', icon: UtensilsCrossed },
    { to: '/student/emergency', label: 'Emergency SOS 🚨', icon: Flame, urgent: true },
    { to: '/student/my-reports', label: 'My Grievances', icon: FileText },
    { to: '/student/suggestions', label: 'Campus Ideas', icon: Lightbulb },
    { to: '/student/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/student/privacy', label: 'Privacy Center', icon: Lock },
  ];

  const collegeManagementNav: SidebarNavItem[] = [
    { to: '/college-management/dashboard', label: 'College & Classrooms', icon: Building, highlight: true },
    { to: '/management/complaints', label: 'All Grievances', icon: FileText },
    { to: '/management/announcements', label: 'Broadcast Bulletins', icon: Megaphone },
    { to: '/management/suggestions', label: 'Student Proposals', icon: Lightbulb },
    { to: '/management/analytics', label: 'Campus Analytics', icon: BarChart3 },
    { to: '/management/emergency-queue', label: 'Emergency Alerts 🚨', icon: Flame, urgent: true },
    { to: '/management/audit-logs', label: 'Security Audit Logs', icon: History },
  ];

  const watchmanNav: SidebarNavItem[] = [
    { to: '/watchman/scanner', label: 'Gate Camera Scanner', icon: Camera, highlight: true },
    { to: '/management/leave-approvals', label: 'All Approved Outpasses', icon: Calendar },
    { to: '/management/emergency-queue', label: 'Gate Emergency Alerts 🚨', icon: Flame, urgent: true },
    { to: '/management/announcements', label: 'Campus Bulletins', icon: Megaphone },
  ];

  const chefNav: SidebarNavItem[] = [
    { to: '/chef/dashboard', label: 'Mess Headcounts', icon: ChefHat, highlight: true },
    { to: '/management/food-count', label: 'Food Waste Audit', icon: UtensilsCrossed },
    { to: '/management/announcements', label: 'Dining Notices', icon: Megaphone },
    { to: '/management/suggestions', label: 'Food Feedback', icon: Lightbulb },
  ];

  const adminNav: SidebarNavItem[] = [
    { to: '/admin', label: 'Admin Control Room', icon: ShieldCheck, highlight: true },
    { to: '/college-management/dashboard', label: 'College & Classrooms', icon: Building },
    { to: '/watchman/scanner', label: 'Gate Security Scanner', icon: Camera },
    { to: '/management/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/management/complaints', label: 'Audit Grievances', icon: FileText },
    { to: '/management/leave-approvals', label: 'Leave Approvals', icon: Calendar },
    { to: '/management/food-count', label: 'Mess Headcount', icon: UtensilsCrossed },
    { to: '/chef/dashboard', label: 'Chef Kitchen Portal', icon: ChefHat },
    { to: '/management/emergency-queue', label: 'Emergency Alerts 🚨', icon: Flame, urgent: true },
    { to: '/management/analytics', label: 'Campus Heatmap', icon: BarChart3 },
    { to: '/management/audit-logs', label: 'Security Audit Logs', icon: History },
    { to: '/management/settings', label: 'System Settings', icon: Settings },
  ];

  const wardenNav: SidebarNavItem[] = [
    { to: '/management/dashboard', label: 'Warden Overview', icon: LayoutDashboard },
    { to: '/management/complaints', label: 'Hostel Grievances', icon: FileText },
    { to: '/management/leave-approvals', label: 'Outpass Approvals', icon: Calendar, highlight: true },
    { to: '/watchman/scanner', label: 'Security Gate Scanner', icon: Camera },
    { to: '/management/food-count', label: 'Mess Attendance', icon: UtensilsCrossed },
    { to: '/management/emergency-queue', label: 'Emergency Queue 🚨', icon: Flame, urgent: true },
    { to: '/management/announcements', label: 'Hostel Broadcasts', icon: Megaphone },
    { to: '/management/suggestions', label: 'Student Ideas', icon: Lightbulb },
  ];

  const navItems = isStudent
    ? studentNav
    : isCollegeManagement
    ? collegeManagementNav
    : isWatchman
    ? watchmanNav
    : isChef
    ? chefNav
    : isAdmin
    ? adminNav
    : wardenNav;

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col h-full border-r border-navy-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-navy-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            {renderLogoIcon()}
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight block truncate max-w-[130px]">
              {branding.siteName}
            </span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
              {isStudent
                ? 'Student Portal'
                : isCollegeManagement
                ? 'College Management'
                : isWatchman
                ? 'Gate Security'
                : isChef
                ? 'Mess Authority'
                : isAdmin
                ? 'University Admin'
                : 'Staff Portal'}
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          {isStudent
            ? 'HostelConnect Suite'
            : isCollegeManagement
            ? 'College & Classrooms'
            : isWatchman
            ? 'Campus Gate Security'
            : isChef
            ? 'Kitchen Management'
            : isAdmin
            ? 'Institutional Governance'
            : 'Hostel Oversight'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ' +
                (isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : item.urgent
                  ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                  : item.highlight
                  ? 'text-blue-300 hover:bg-blue-900/40 hover:text-white'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800')
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Privacy Guarantee Footer Info */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/60">
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 text-[11px]">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">Security Gate Guard</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Only authorized gate officers can scan & log outpass movements.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
