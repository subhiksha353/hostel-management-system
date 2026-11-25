import React, { useState, useEffect } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/supabase/complaintService';
import { Complaint } from '../../types/database';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { firestoreService } from '../../services/firebase/firestoreService';
import { isFirebaseConfigured, firebaseConfig } from '../../lib/firebase';
import {
  Shield,
  ShieldCheck,
  Trash2,
  Sparkles,
  Building,
  GraduationCap,
  Megaphone,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Search,
  Eye,
  Palette,
  Image as ImageIcon,
  Database,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { branding, updateBranding, resetBranding } = useBranding();
  const { showToast } = useToast();

  // Branding Form State
  const [siteName, setSiteName] = useState(branding.siteName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [collegeName, setCollegeName] = useState(branding.collegeName);
  const [logoType, setLogoType] = useState(branding.logoType);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '');

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    critical: 0,
    emergency: 0,
    todayCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    try {
      const res = await firestoreService.seedInitialComplaints();
      showToast('Firebase Synchronized', `Successfully synced ${res.count} complaints to Cloud Firestore!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast('Sync Failed', err?.message || 'Could not seed Firestore', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const loadData = async () => {
    const list = await complaintService.getComplaints(undefined, 'admin');
    setComplaints(list);
    const stats = await complaintService.getComplaintMetrics();
    setMetrics(stats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      siteName,
      tagline,
      collegeName,
      logoType: logoType as any,
      logoUrl: logoUrl.trim() || null,
    });
    showToast('Branding Updated', 'Website name updated to "' + siteName + '" and logo applied globally!', 'success');
  };

  const handleResetBranding = () => {
    if (window.confirm('Reset all website branding, logo and names back to defaults?')) {
      resetBranding();
      setSiteName('CampusVoice');
      setTagline('Your Voice. Your Privacy. Better Campus.');
      setCollegeName('National Institute of Technology');
      setLogoType('shield');
      setLogoUrl('');
      showToast('Branding Reset', 'Website identity restored to default CampusVoice.', 'info');
    }
  };

  const handleDeleteComplaint = async (id: string, isFake: boolean = false) => {
    const reason = isFake ? 'Fake/Spam complaint detected' : 'Admin manual removal';
    if (window.confirm('Are you sure you want to delete this complaint? This action is immediate.')) {
      setIsDeleting(id);
      await complaintService.deleteComplaint(id, reason);
      showToast('Complaint Deleted', isFake ? 'Fake complaint removed permanently.' : 'Complaint deleted.', 'success');
      await loadData();
      setIsDeleting(null);
    }
  };

  const handleClearAllDefault = async () => {
    if (window.confirm('Clear all default/seed complaints from the system? You can restore them anytime.')) {
      await complaintService.resetDefaultComplaints();
      showToast('Complaints Cleared', 'All complaints have been reset to zero.', 'info');
      await loadData();
    }
  };

  const handleRestoreDefault = async () => {
    await complaintService.restoreDemoComplaints();
    showToast('Demo Restored', 'Default campus complaints loaded successfully.', 'success');
    await loadData();
  };

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.public_tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-indigo-300">
              <ShieldCheck className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">University Administration Portal</h1>
              <p className="text-sm text-indigo-200 mt-1">
                Full institutional control: Manage site branding, audit live complaint metrics & purge fake reports
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefault}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Load Sample Data
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearAllDefault}
            className="text-xs"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All Seed Data
          </Button>
        </div>
      </div>

      {/* 1. Live Complaints Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Total Campus Grievances & Metrics
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            Real-Time Audit Count
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Total Complaints</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</p>
            <span className="text-[10px] text-slate-400">Total submitted</span>
          </Card>

          <Card className="p-4 bg-white border-amber-200 bg-amber-50/30">
            <p className="text-xs text-amber-700 font-medium">Pending / Open</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{metrics.open}</p>
            <span className="text-[10px] text-amber-600">Awaiting action</span>
          </Card>

          <Card className="p-4 bg-white border-blue-200 bg-blue-50/30">
            <p className="text-xs text-blue-700 font-medium">Under Investigation</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{metrics.investigating}</p>
            <span className="text-[10px] text-blue-600">In-progress</span>
          </Card>

          <Card className="p-4 bg-white border-emerald-200 bg-emerald-50/30">
            <p className="text-xs text-emerald-700 font-medium">Resolved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.resolved}</p>
            <span className="text-[10px] text-emerald-600">Successfully closed</span>
          </Card>

          <Card className="p-4 bg-white border-rose-200 bg-rose-50/30">
            <p className="text-xs text-rose-700 font-medium">Critical Priority</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{metrics.critical}</p>
            <span className="text-[10px] text-rose-600">High severity</span>
          </Card>

          <Card className="p-4 bg-white border-red-200 bg-red-50/30">
            <p className="text-xs text-red-700 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Emergencies
            </p>
            <p className="text-2xl font-black text-red-600 mt-1">{metrics.emergency}</p>
            <span className="text-[10px] text-red-600">Immediate priority</span>
          </Card>
        </div>
      </div>

      {/* 2. Dynamic Branding & Logo Customization Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Palette className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Website Name & Logo Customization</h2>
                  <p className="text-xs text-slate-500">
                    Change institution name, portal title, tagline, and brand logo in real-time
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetBranding}
                className="text-xs text-slate-600"
              >
                Reset Default
              </Button>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-5">
              {/* Site Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Platform / Website Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. CampusVoice, NIT Care, St. Joseph Grievance Hub"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-semibold text-slate-900 bg-slate-50/50"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Appears in header, navbar, student portal, browser tab title, and generated receipts.
                </p>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Platform Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Your Voice. Your Privacy. Better Campus."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>

              {/* College / University Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / University Name
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Trichy"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>

              {/* Logo Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Portal Brand Logo Icon
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'shield', label: 'Shield', icon: Shield },
                    { id: 'graduation-cap', label: 'College', icon: GraduationCap },
                    { id: 'sparkles', label: 'Modern', icon: Sparkles },
                    { id: 'building', label: 'Campus', icon: Building },
                    { id: 'megaphone', label: 'Voice', icon: Megaphone },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = logoType === item.id && !logoUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLogoType(item.id as any);
                          setLogoUrl('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-400'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Logo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Custom Image Logo URL (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Overrides icon when provided</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/your-college-logo.png"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm text-slate-800 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Save & Apply Branding Globally
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Brand Preview Card */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Live Header & Brand Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Real-time
                </span>
              </div>

              {/* Mock Header Preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-10 h-10 rounded-xl object-contain bg-white p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                      {logoType === 'shield' && <Shield className="w-5 h-5" />}
                      {logoType === 'graduation-cap' && <GraduationCap className="w-5 h-5" />}
                      {logoType === 'sparkles' && <Sparkles className="w-5 h-5" />}
                      {logoType === 'building' && <Building className="w-5 h-5" />}
                      {logoType === 'megaphone' && <Megaphone className="w-5 h-5" />}
                    </div>
                  )}

                  <div>
                    <p className="text-base font-black text-white tracking-tight">{siteName || 'CampusVoice'}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{tagline || 'Your Voice. Your Privacy.'}</p>
                  </div>
                </div>

                <div className="text-xs text-indigo-200/90 font-medium pt-2 border-t border-white/10 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{collegeName || 'National Institute of Technology'}</span>
                </div>
              </div>

              {/* Privacy Guarantee Badge in Admin */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                  Zero Identity Leakage Guard
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  As university administrator, you have permission to delete fake tickets and customize branding, but
                  student identity hashes remain cryptographically sealed.
                </p>
              </div>
            </div>

            <div className="pt-6 text-[11px] text-slate-400 text-center font-mono">
              Branding Engine v2.0 • Instant DOM Synchronization
            </div>
          </Card>
        </div>
      </div>

      {/* Firebase Database Status & Sync Card */}
      <Card className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Cloud Firestore Database</h3>
              {isFirebaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync ({firebaseConfig.projectId})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Local Memory Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Syncing live student grievances, digital hostel leave passes, and daily mess attendance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedFirestore}
            isLoading={isSeeding}
            disabled={!isFirebaseConfigured}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold bg-white border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            Seed Initial Data to Firestore
          </Button>
        </div>
      </Card>

      {/* 3. Delete Fake Complaints & Moderation Table */}
      <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Grievance Moderation & Delete Fake Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrators can permanently delete malicious, test, or spam complaints to maintain data integrity
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No complaints found</p>
            <p className="text-xs">All fake complaints have been purged or no tickets match the query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Student Pseudonym</th>
                  <th className="py-3 px-4">Category & Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{c.public_tracking_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {c.anonymous_public_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {c.category} • {c.location}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteComplaint(c.id, true)}
                          disabled={isDeleting === c.id}
                          className="text-[11px] py-1 px-2.5 h-auto"
                          leftIcon={<Trash2 className="w-3 h-3" />}
                        >
                          Delete as Fake
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
