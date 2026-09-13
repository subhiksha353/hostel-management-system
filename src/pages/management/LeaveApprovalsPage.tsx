import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { leaveService } from '../../services/supabase/leaveService';
import { LeaveRequest, LeaveStatus } from '../../types/hostel';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  ShieldCheck,
  Search,
  Car,
  Check,
  UserCheck,
} from 'lucide-react';

export const LeaveApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadLeaves = async () => {
    const data = await leaveService.getLeaveRequests(undefined, true);
    setLeaves(data);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
    setProcessingId(id);
    const wardenRemarks = remarks[id] || (status === 'approved' ? 'Approved with standard campus curfew.' : 'Leave rejected by authority.');
    const wardenName = user?.profile?.name || 'Hostel Warden';

    const success = await leaveService.updateLeaveStatus(id, status, wardenRemarks, wardenName);
    if (success) {
      showToast(
        status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        `Request #${id.slice(-6)} updated and student notified.`,
        status === 'approved' ? 'success' : 'info'
      );
      await loadLeaves();
    } else {
      showToast('Error', 'Failed to update leave status.', 'error');
    }
    setProcessingId(null);
  };

  const handleGateAction = async (id: string, action: 'checkout' | 'checkin') => {
    setProcessingId(id);
    if (action === 'checkout') {
      await leaveService.recordGateCheckOut(id);
      showToast('Gate Check-Out Recorded', 'Student departure logged at main campus security gate.', 'info');
    } else {
      await leaveService.recordGateCheckIn(id);
      showToast('Gate Check-In Recorded', 'Student arrival logged safely back in hostel.', 'success');
    }
    await loadLeaves();
    setProcessingId(null);
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.student_name.toLowerCase().includes(q) ||
        l.room_number.toLowerCase().includes(q) ||
        l.hostel_block.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Hostel Leave & Digital Outpass Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            SpaceBasic Warden control desk: Review requests, enforce curfew hours, and audit gate check-out records
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-900">
            {leaves.filter((l) => l.status === 'pending').length} Pending Approvals
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'pending', 'approved', 'checked_out', 'checked_in', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, room, block..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Card>

      {/* Requests List */}
      {filteredLeaves.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No matching leave requests</p>
          <p className="text-xs">There are no student outpass applications for the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => (
            <Card key={leave.id} className="p-6 bg-white border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-base">
                    {leave.room_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{leave.student_name}</h3>
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-700">
                        {leave.hostel_block}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> Parent Phone: {leave.parent_phone}
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-medium">Consent Verified</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge & Code */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{leave.qr_pass_code}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      leave.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : leave.status === 'checked_out'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : leave.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : leave.status === 'checked_in'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {leave.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Leave Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Destination & Transport</span>
                  <p className="font-bold text-slate-900">{leave.destination}</p>
                  <p className="text-slate-500">{leave.transport_mode || 'Public Transport'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Outpass Schedule</span>
                  <p className="font-bold text-slate-900">
                    Depart: {leave.from_date} ({leave.from_time || '09:00 AM'})
                  </p>
                  <p className="font-bold text-indigo-700">
                    Return: {leave.to_date} ({leave.to_time || '08:00 PM'})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reason Stated</span>
                  <p className="text-slate-700 italic">"{leave.reason}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                {leave.status === 'pending' ? (
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add warden remarks or curfew conditions..."
                      value={remarks[leave.id] || ''}
                      onChange={(e) => setRemarks({ ...remarks, [leave.id]: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(leave.id, 'approved')}
                        disabled={processingId === leave.id}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                      >
                        Approve Outpass
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                        disabled={processingId === leave.id}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : leave.status === 'approved' ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Approved by {leave.approved_by || 'Warden'} • Ready for Main Gate Departure
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGateAction(leave.id, 'checkout')}
                      disabled={processingId === leave.id}
                      className="bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                      leftIcon={<Car className="w-3.5 h-3.5" />}
                    >
                      Scan Gate Check-Out
                    </Button>
                  </div>
                ) : leave.status === 'checked_out' ? (
                  <div className="flex items-center justify-between w-full bg-blue-50 p-3 rounded-2xl border border-blue-200">
                    <span className="text-xs text-blue-900 font-bold flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600 animate-pulse" /> Student is currently off-campus • Departed at{' '}
                      {new Date(leave.checked_out_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGateAction(leave.id, 'checkin')}
                      disabled={processingId === leave.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Scan Gate Check-In (Returned)
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-medium">
                    Status: <strong className="text-slate-800 uppercase">{leave.status}</strong>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
