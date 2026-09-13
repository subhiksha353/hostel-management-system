import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/supabase/complaintService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HOSTEL_BLOCKS } from '../../lib/constants';
import {
  Flame,
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const EmergencyReport: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hostelBlock, setHostelBlock] = useState<string>(HOSTEL_BLOCKS[0]);
  const [location, setLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState('Electrical Hazard / Spark');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emergencyTypes = [
    'Fire / Smoke Hazard',
    'Electrical Hazard / Exposed Cable',
    'Serious Medical Emergency',
    'Acute Security / Harassment Concern',
    'Structural Collapse Risk / Falling Concrete',
    'Gas / Chemical Leak',
    'Other Urgent Life Safety',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      showToast('Missing details', 'Please describe the emergency and exact location.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await complaintService.createComplaint(
        {
          category: 'Security',
          title: `[EMERGENCY: ${emergencyType}] ${title}`,
          description,
          location: `${hostelBlock}, ${location}`,
          hostel_block: hostelBlock,
          priority: 'critical',
          is_emergency: true,
        },
        user?.id
      );

      showToast('Emergency SOS Dispatched', `Emergency Report ${res.public_tracking_id} flagged to all wardens.`, 'error');
      navigate(`/student/complaints/${res.id}`);
    } catch {
      showToast('Error', 'Failed to transmit emergency report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Red Alert Header */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-red-900 text-white p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7 text-white animate-bounce" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              Priority Red Channel
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">Campus Emergency Report</h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
          Emergency reports automatically bypass the standard review queue, trigger critical sound alerts on management dashboards, and dispatch immediate campus response teams.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-rose-800 font-bold hover:bg-rose-50 shadow transition-all"
          >
            <PhoneCall className="w-4 h-4" /> Immediate Police / Ambulance: 112
          </a>
          <a
            href="tel:000"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/60 text-white font-semibold border border-white/20 hover:bg-rose-950"
          >
            Campus Security Desk: Ext. 222
          </a>
        </div>
      </div>

      {/* Emergency Form */}
      <Card className="p-6 sm:p-8 bg-white border-rose-200 shadow-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Type of Emergency Hazard *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emergencyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEmergencyType(type)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    emergencyType === type
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Emergency Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sparking high voltage line outside hostel gate"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hostel Block / Area *
              </label>
              <select
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
              >
                {HOSTEL_BLOCKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exact Location / Landmark *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ground floor main entrance / near transformer"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description of Immediate Danger & Casualties *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the immediate threat so emergency responders can bring proper safety gear..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your identity remains anonymized. Emergency staff receive live coordinates and description.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link to="/student/dashboard" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Cancel
            </Link>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Flame className="w-4 h-4 fill-current" />}
            >
              Dispatch Critical Emergency Alert 🚨
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
