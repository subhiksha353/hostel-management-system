import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Flame,
  Calendar,
  UtensilsCrossed,
  BarChart3,
  Lock,
} from 'lucide-react';

interface MobileNavItem {
  to: string;
  label: string;
  icon: any;
  isMain?: boolean;
  isUrgent?: boolean;
}

export const MobileNav: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'student';

  const studentItems: MobileNavItem[] = [
    { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/student/leave/requests', label: 'Leave', icon: Calendar },
    { to: '/student/create', label: 'Report', icon: PlusCircle, isMain: true },
    { to: '/student/food-count', label: 'Mess', icon: UtensilsCrossed },
    { to: '/student/my-reports', label: 'Tickets', icon: FileText },
  ];

  const managementItems: MobileNavItem[] = [
    { to: '/management/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/management/complaints', label: 'Tickets', icon: FileText },
    { to: '/management/leave-approvals', label: 'Leaves', icon: Calendar },
    { to: '/management/food-count', label: 'Mess', icon: UtensilsCrossed },
    { to: '/management/emergency-queue', label: 'Urgent', icon: Flame, isUrgent: true },
  ];

  const items = isStudent ? studentItems : managementItems;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6" />
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : item.isUrgent
                    ? 'text-rose-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
