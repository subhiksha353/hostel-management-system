import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { leaveService } from '../../services/supabase/leaveService';
import { LeaveType } from '../../types/hostel';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Home,
  Sun,
  Moon,
  AlertTriangle,
  QrCode,
  ArrowRight,
} from 'lucide-react';

export const LeaveFormPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState<LeaveType>('weekend_home');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('04:30 PM');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('08:00 PM');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState<'Bus' | 'Train' | 'Flight' | 'Personal Vehicle' | 'Cab/Auto'>('Bus');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState('+91 ');
  const [parentConsent, setParentConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason || !destination) {
      showToast('Incomplete Form', 'Please fill in all mandatory departure and destination fields.', 'warning');
      return;
    }

    if (!parentConsent) {
      showToast('Parent Consent Required', 'Please confirm that your parents/guardian are aware of this leave.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.applyLeave({
        studentId: user?.id || 'u-student-001',
        studentName: user?.profile?.name || 'Anonymous Student',
        roomNumber: user?.profile?.room_number || '312',
        hostelBlock: user?.profile?.hostel_block || 'Block A (Men)',
        leaveType,
        fromDate,
        fromTime,
        toDate,
        toTime,
        destination,
        transportMode,
        reason,
        parentPhone,
        parentConsentConfirmed: parentConsent,
      });

      showToast('Outpass Requested', 'Your leave application has been submitted to the Warden for approval.', 'success');
      navigate('/student/leave/requests');
    } catch {
      showToast('Error', 'Failed to submit leave request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-blue-200">
              <FileText className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Hostel Leave & Outpass Application</h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                SpaceBasic-style instant gate outpass, digital approval & parent verification
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/leave/requests')}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs self-start sm:self-auto"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View My Outpasses
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Leave Type Selector */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Pass / Leave Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: 'day_pass',
                label: 'Day Outing Pass',
                desc: 'Same day return before 8:30 PM',
                icon: Sun,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                id: 'weekend_home',
                label: 'Home / Weekend',
                desc: 'Multi-day hometown visit',
                icon: Home,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                id: 'night_out',
                label: 'Night Out Pass',
                desc: 'Overnight stay in city',
                icon: Moon,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
              {
                id: 'emergency',
                label: 'Emergency / Medical',
                desc: 'Hospital or urgent leave',
                icon: AlertTriangle,
                color: 'text-rose-600 bg-rose-50 border-rose-200',
              },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = leaveType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLeaveType(t.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl border ${t.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-black">{t.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2. Departure & Return Schedule */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Outpass Schedule & Timing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departure */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Departure from Campus Gate
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Departure Date *</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Expected Gate Departure Time</label>
                <input
                  type="text"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  placeholder="e.g. 04:30 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Return */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Return Check-In to Hostel
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Return Date *</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Expected Hostel Gate In-Time</label>
                <input
                  type="text"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  placeholder="e.g. 08:00 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Destination, Reason & Transport */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Destination, Travel Mode & Reason
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination / Place of Visit *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Bengaluru / Home Address / City Center"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mode of Transport
              </label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50"
              >
                <option value="Bus">Public / Inter-City Bus</option>
                <option value="Train">Indian Railways (Train)</option>
                <option value="Flight">Flight</option>
                <option value="Personal Vehicle">Personal Vehicle / Bike</option>
                <option value="Cab/Auto">Cab / Auto Rickshaw</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose / Reason for Leave *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail your reason (e.g. Attending family function, medical appointment, hackathon, etc.)"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </Card>

        {/* 4. Parent Verification */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Parent / Guardian Consent & Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parent / Guardian Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50/50"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                An automatic SMS / WhatsApp notification will be logged to this number upon gate check-out.
              </p>
            </div>

            <div className="flex items-center">
              <label className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={parentConsent}
                  onChange={(e) => setParentConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-emerald-950 font-medium">
                  <strong className="block text-emerald-900">Parent Consent Confirmed</strong>
                  I hereby confirm that my parents/guardian are aware and have approved this travel and curfew timings.
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" size="md" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            leftIcon={<QrCode className="w-5 h-5" />}
          >
            {isSubmitting ? 'Submitting Application...' : 'Apply & Generate Outpass'}
          </Button>
        </div>
      </form>
    </div>
  );
};
