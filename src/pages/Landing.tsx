import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  Zap,
  Sparkles,
  Paperclip,
  Building2,
  CheckCircle2,
  ArrowRight,
  Flame,
  BarChart2,
  EyeOff,
  UserCheck,
  ChevronRight,
  Calendar,
  UtensilsCrossed,
  ChefHat,
  Scale,
  QrCode,
  Sliders,
  Trash2,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { branding } = useBranding();
  const { continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestEntry = () => {
    continueAsGuest();
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{branding.collegeName} • Official Portal</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Speak freely. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Stay private.
              </span>{' '}
              Better campus.
            </h1>

            {/* Tagline & Subtext */}
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              {branding.tagline} Submit anonymous grievances, request digital gate outpasses, and track daily mess attendance without ever revealing your student identity.
            </p>

            {/* Guest vs Login CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link to="/student/create" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full shadow-lg shadow-blue-600/20" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Report Grievance Anonymously
                </Button>
              </Link>
              
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-800 hover:bg-emerald-100 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <EyeOff className="w-4 h-4 text-emerald-600" />
                Enter as Anonymous Guest (No Login)
              </button>

              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Sign In (All Roles)
                </Button>
              </Link>
            </div>

            {/* Privacy Highlight pill */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Zero Identity Storage in Complaints
              </span>
              <span>•</span>
              <span>SpaceBasic Outpass Workflow</span>
              <span>•</span>
              <span>Chef Food Waste Reduction</span>
            </div>
          </div>

          {/* 3 Core Unified Module Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 1. Anonymous Complaint Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:border-blue-300 hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">1. Anonymous Complaint Box</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  PostgreSQL RLS ensures management/wardens cannot trace who filed the grievance. AI duplicate detection & voice note support included.
                </p>
              </div>
              <Link to="/student/create" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                Submit a Problem <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2. SpaceBasic Digital Outpass & Leave */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:border-indigo-300 hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">2. SpaceBasic Outpass & Leave</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Digital day passes & weekend home leaves with parent consent confirmation, Warden 1-click approvals, and Gate QR scanning.
                </p>
              </div>
              <Link to="/student/leave/requests" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                Apply & Track Outpasses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3. Daily Mess Attendance & Chef Portal */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:border-amber-300 hover:shadow-xl transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">3. Mess Headcount & Chef Desk</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Students mark eating status; Chefs receive real-time headcount for Breakfast, Lunch & Dinner to scale raw materials and prevent food waste.
                </p>
              </div>
              <Link to="/student/food-count" className="text-xs font-bold text-amber-700 flex items-center gap-1 hover:gap-2 transition-all">
                Mark Meal Presence <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Admin & Institutional Control Feature Strip */}
          <div className="mt-12 max-w-5xl mx-auto p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Institutional Administration
              </span>
              <h3 className="text-xl font-black">University Admin Control Room</h3>
              <p className="text-xs text-slate-400">
                Custom branding (Logo, Name, Slogan), total complaint audit metrics, and purge fake/spam complaints.
              </p>
            </div>
            <Link to="/admin">
              <Button variant="primary" size="md" className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-xs">
                Launch Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
