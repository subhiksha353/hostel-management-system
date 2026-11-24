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
  User,
  UserCog,
  Stethoscope,
  Shield,
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
            href="tel:108"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-rose-800 font-bold hover:bg-rose-50 shadow transition-all"
          >
            <PhoneCall className="w-4 h-4" /> Ambulance: 108
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/60 text-white font-semibold border border-white/20 hover:bg-rose-950"
          >
            <Shield className="w-4 h-4" /> Police / Fire: 112
          </a>
          <a
            href="tel:101"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-800/70 text-white font-semibold border border-white/20 hover:bg-orange-900"
          >
            <Flame className="w-4 h-4" /> Fire Brigade: 101
          </a>
        </div>
      </div>

      {/* Important Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chief Warden</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Dr. R. Meenakshi</p>
            <a href="tel:+919443200100" className="text-xs text-blue-600 font-semibold hover:underline mt-0.5 inline-block">
              +91 94432 00100
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">Available 24 × 7 for emergencies</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lady Warden (Girls Hostel)</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Mrs. S. Kavitha</p>
            <a href="tel:+919443200200" className="text-xs text-violet-600 font-semibold hover:underline mt-0.5 inline-block">
              +91 94432 00200
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">Girls hostel block – round-the-clock</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <UserCog className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Associate Director (AD)</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Dr. P. Sundaram</p>
            <a href="tel:+919443200300" className="text-xs text-emerald-600 font-semibold hover:underline mt-0.5 inline-block">
              +91 94432 00300
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">Campus administration & discipline</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Health Centre</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Dr. A. Priya (Medical Officer)</p>
            <a href="tel:+919443200400" className="text-xs text-rose-600 font-semibold hover:underline mt-0.5 inline-block">
              +91 94432 00400
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">In-campus clinic – open 8 AM – 10 PM</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-amber-200 shadow-sm p-4 flex items-start gap-3 sm:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Security Desk (24 × 7)</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Security Control Room</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <a href="tel:+919443200500" className="text-xs text-amber-600 font-semibold hover:underline">
                +91 94432 00500
              </a>
              <span className="text-xs text-slate-400">|</span>
              <a href="tel:04422000222" className="text-xs text-amber-600 font-semibold hover:underline">
                Ext. 222 (Intercom)
              </a>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Main gate security – round-the-clock patrol</p>
          </div>
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
