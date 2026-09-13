import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/supabase/leaveService';
import { LeaveRequest } from '../../types/hostel';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  ShieldCheck,
  Home,
  Sun,
  Moon,
  AlertTriangle,
  Car,
  Check,
} from 'lucide-react';

export const MyLeaveRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedPass, setSelectedPass] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await leaveService.getLeaveRequests(user?.id || 'u-student-001');
      setLeaves(data);
    };
    load();
  }, [user]);

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Ready
          </span>
        );
      case 'checked_out':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
            <Car className="w-3.5 h-3.5" /> Checked Out at Gate
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
            <Check className="w-3.5 h-3.5" /> Safely Returned
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5" /> Pending Warden Approval
          </span>
        );
    }
  };

  const getLeaveTypeIcon = (type: LeaveRequest['leave_type']) => {
    switch (type) {
      case 'day_pass':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'night_out':
        return <Moon className="w-4 h-4 text-purple-500" />;
      default:
        return <Home className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            My Gate Outpasses & Leave History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            SpaceBasic digital gate pass verification for campus security checkpoints
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/student/leave/apply')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Apply New Outpass
        </Button>
      </div>

      {/* Outpass Cards List */}
      {leaves.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-base font-bold text-slate-700">No Leave Requests Found</p>
          <p className="text-xs max-w-sm mx-auto">
            You haven't applied for any outpasses yet. When you plan a home visit or city outing, submit an application here.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/student/leave/apply')} className="mt-2">
            Apply Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <Card
              key={leave.id}
              className={`p-6 border transition-all ${
                leave.status === 'approved'
                  ? 'border-emerald-200 bg-white hover:border-emerald-400 shadow-sm'
                  : leave.status === 'checked_out'
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold capitalize">
                      {getLeaveTypeIcon(leave.leave_type)}
                      {leave.leave_type?.replace('_', ' ') || 'Home Visit'}
                    </span>
                    {getStatusBadge(leave.status)}
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">{leave.qr_pass_code}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{leave.reason}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{leave.destination || 'Home Destination'}</span>
                      <span className="text-slate-300">•</span>
                      <span>Transport: {leave.transport_mode || 'Bus'}</span>
                    </p>
                  </div>

                  {/* Timing & Dates */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Out: <strong>{leave.from_date}</strong> ({leave.from_time || '09:00 AM'})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        In: <strong>{leave.to_date}</strong> ({leave.to_time || '08:00 PM'})
                      </span>
                    </div>
                  </div>

                  {leave.warden_remarks && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <strong className="text-slate-900 font-bold">Warden Note:</strong> {leave.warden_remarks}
                    </div>
                  )}
                </div>

                {/* Right Action: SpaceBasic Pass Trigger */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setSelectedPass(leave)}
                    className="w-full sm:w-auto bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold"
                    leftIcon={<QrCode className="w-4 h-4" />}
                  >
                    View Digital Pass Card
                  </Button>
                  <span className="text-[10px] text-slate-400 font-mono">SpaceBasic ID: #{leave.id.slice(-6)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SpaceBasic Digital Gate Outpass Card Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            {/* Top Pass Header */}
            <div
              className={`p-6 text-white text-center relative ${
                selectedPass.status === 'approved'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-700'
                  : selectedPass.status === 'checked_out'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-700'
                  : 'bg-gradient-to-tr from-slate-700 to-slate-900'
              }`}
            >
              <div className="text-[10px] uppercase font-black tracking-widest text-white/80">
                Official Campus Gate Pass
              </div>
              <h2 className="text-xl font-black mt-1">{selectedPass.student_name}</h2>
              <p className="text-xs text-white/90">
                Room {selectedPass.room_number} • {selectedPass.hostel_block}
              </p>

              <div className="mt-3 inline-block">{getStatusBadge(selectedPass.status)}</div>
            </div>

            {/* QR Code & Pass Details */}
            <div className="p-6 space-y-5 bg-white text-center">
              {/* Simulated SpaceBasic High-Density QR */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 inline-block mx-auto">
                <div className="w-40 h-40 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
                  <QrCode className="w-24 h-24 text-white" />
                  <span className="font-mono text-[9px] text-indigo-300 font-bold tracking-wider mt-1">
                    {selectedPass.qr_pass_code}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-bold text-slate-800">{selectedPass.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Departure:</span>
                  <span className="font-bold text-slate-800">
                    {selectedPass.from_date} ({selectedPass.from_time})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Return Curfew:</span>
                  <span className="font-bold text-slate-800">
                    {selectedPass.to_date} ({selectedPass.to_time})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parent Verified:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Yes ({selectedPass.parent_phone})
                  </span>
                </div>
                {selectedPass.approved_by && (
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-400">Signatory:</span>
                    <span className="font-semibold text-slate-900">{selectedPass.approved_by}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400">
                Show this digital QR code to Security Gate Officers when exiting or entering campus.
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={() => setSelectedPass(null)} className="w-full">
                  Close Pass
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
