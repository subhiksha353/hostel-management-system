import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../context/BrandingContext';
import { ShieldCheck, Lock, Mail, ArrowRight, GraduationCap, Sparkles, Building, Megaphone, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UserRole } from '../types/database';

export const Login: React.FC = () => {
  const { branding } = useBranding();
  const [email, setEmail] = useState('student.demo@campus.edu');
  const [password, setPassword] = useState('demo123');
  const [activeTab, setActiveTab] = useState<'student' | 'warden' | 'college_management' | 'chef' | 'watchman' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const { login, continueAsGuest, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab: 'student' | 'warden' | 'college_management' | 'chef' | 'watchman' | 'admin') => {
    setActiveTab(tab);
    if (tab === 'student') setEmail('student.demo@campus.edu');
    if (tab === 'warden') setEmail('warden.blocka@campus.edu');
    if (tab === 'college_management') setEmail('management@campus.edu');
    if (tab === 'chef') setEmail('chef.mess@campus.edu');
    if (tab === 'watchman') setEmail('watchman.gate@campus.edu');
    if (tab === 'admin') setEmail('campus.admin@campus.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const success = await login(email, password, activeTab as any);
      if (success) {
        if (activeTab === 'student') {
          navigate('/student/dashboard');
        } else if (activeTab === 'college_management') {
          navigate('/college-management/dashboard');
        } else if (activeTab === 'chef') {
          navigate('/chef/dashboard');
        } else if (activeTab === 'watchman') {
          navigate('/watchman/scanner');
        } else if (activeTab === 'admin') {
          navigate('/admin');
        } else {
          navigate('/management/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    navigate('/student/dashboard');
  };

  const handleQuickDemo = (role: UserRole) => {
    switchDemoRole(role);
    if (role === 'student' || role === 'guest_student') {
      navigate('/student/dashboard');
    } else if (role === 'college_management') {
      navigate('/college-management/dashboard');
    } else if (role === 'chef') {
      navigate('/chef/dashboard');
    } else if (role === 'watchman') {
      navigate('/watchman/scanner');
    } else if (role === 'admin' || role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/management/dashboard');
    }
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            {renderLogoIcon()}
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-slate-900 tracking-tight block">{branding.siteName}</span>
            <span className="text-xs text-blue-600 font-bold -mt-1 block">Zero-Identity Grievance Portal</span>
          </div>
        </Link>
        <h2 className="mt-6 text-xl sm:text-2xl font-black text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">{branding.collegeName} Authorized Access</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 space-y-4">
        {/* Guest Access Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Don't want to sign in?</p>
              <p className="text-[11px] text-slate-500">Submit grievances & check mess counts 100% anonymously.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGuestEntry}
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold shrink-0"
          >
            Enter as Guest
          </Button>
        </div>

        <Card className="p-6 sm:p-8 shadow-soft border-slate-200/80 bg-white">
          {/* Tab Selector: Student vs Warden vs Management vs Chef vs Watchman vs Admin */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('warden')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'warden' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              🛡️ Warden
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('college_management')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'college_management' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              🏢 Management
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('chef')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'chef' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              👨‍🍳 Chef
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('watchman')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'watchman' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              👮 Watchman
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={'py-2 rounded-lg transition-all text-center ' + (activeTab === 'admin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
            >
              👑 Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as {activeTab.replace('_', ' ').toUpperCase()}
            </Button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Instant 1-Click Persona Login
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>🎓 Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('college_management')}
                className="p-2 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>🏢 Management</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('warden')}
                className="p-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>🛡️ Warden</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('watchman')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>👮 Watchman</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('chef')}
                className="p-2 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>👨‍🍳 Chef</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>👑 Admin</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Signup Redirect */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Are you a new student?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
