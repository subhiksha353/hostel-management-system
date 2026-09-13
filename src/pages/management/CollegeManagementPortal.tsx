import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/supabase/complaintService';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types/database';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../lib/constants';
import {
  Building2,
  GraduationCap,
  MonitorPlay,
  FlaskConical,
  MessageSquare,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Send,
  BookOpen,
  MapPin,
  ChevronRight,
  RefreshCw,
  Megaphone,
  Lock,
  Layers,
} from 'lucide-react';

interface ClassroomStatus {
  roomNumber: string;
  block: string;
  type: 'classroom' | 'lab' | 'seminar' | 'auditorium';
  equipment: {
    projector: 'working' | 'faulty' | 'maintenance';
    audio: 'working' | 'faulty' | 'maintenance';
    airConditioning: 'working' | 'faulty' | 'maintenance';
    workstations?: 'working' | 'faulty' | 'maintenance';
    furniture: 'working' | 'faulty' | 'maintenance';
  };
  activeComplaints: number;
}

const CLASSROOM_DATABASE: ClassroomStatus[] = [
  {
    roomNumber: 'Room 304',
    block: 'Academic Main Block (3rd Floor)',
    type: 'classroom',
    equipment: {
      projector: 'faulty',
      audio: 'faulty',
      airConditioning: 'working',
      furniture: 'working',
    },
    activeComplaints: 1,
  },
  {
    roomNumber: 'CS Lab 3',
    block: 'Science & Tech Block (2nd Floor)',
    type: 'lab',
    equipment: {
      projector: 'working',
      audio: 'working',
      airConditioning: 'faulty',
      workstations: 'faulty',
      furniture: 'working',
    },
    activeComplaints: 1,
  },
  {
    roomNumber: 'Room LH-201',
    block: 'Lecture Complex (2nd Floor)',
    type: 'classroom',
    equipment: {
      projector: 'working',
      audio: 'working',
      airConditioning: 'working',
      furniture: 'maintenance',
    },
    activeComplaints: 1,
  },
  {
    roomNumber: 'Mechanical Seminar Hall',
    block: 'Mechanical Wing (Ground Floor)',
    type: 'seminar',
    equipment: {
      projector: 'working',
      audio: 'maintenance',
      airConditioning: 'working',
      furniture: 'working',
    },
    activeComplaints: 0,
  },
  {
    roomNumber: 'Electronics Lab 2',
    block: 'Science & Tech Block (1st Floor)',
    type: 'lab',
    equipment: {
      projector: 'working',
      audio: 'working',
      airConditioning: 'working',
      workstations: 'working',
      furniture: 'working',
    },
    activeComplaints: 0,
  },
  {
    roomNumber: 'Room 102 (Smart Classroom)',
    block: 'Academic Main Block (1st Floor)',
    type: 'classroom',
    equipment: {
      projector: 'working',
      audio: 'working',
      airConditioning: 'working',
      furniture: 'working',
    },
    activeComplaints: 0,
  },
];

export const CollegeManagementPortal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'college' | 'anonymous_messages' | 'work_orders'>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected complaint for modal / quick reply
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatusChange, setSelectedStatusChange] = useState<ComplaintStatus>('investigating');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Dispatch technician modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<string>('Room 304');
  const [dispatchDept, setDispatchDept] = useState('IT & AV Support');
  const [dispatchNote, setDispatchNote] = useState('Inspect HDMI connector and ceiling projector lamp urgently.');

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints(undefined, 'college_management');
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filtered lists
  const classroomIssues = complaints.filter(
    (c) =>
      c.category === 'Classroom & Lecture Hall' ||
      c.category === 'Laboratory & Equipment' ||
      c.location?.toLowerCase().includes('room') ||
      c.location?.toLowerCase().includes('lab') ||
      c.location?.toLowerCase().includes('hall') ||
      c.hostel_block?.toLowerCase().includes('academic') ||
      c.hostel_block?.toLowerCase().includes('science') ||
      c.hostel_block?.toLowerCase().includes('lecture')
  );

  const anonymousMessages = complaints.filter(
    (c) =>
      c.category === 'Anonymous Message to Management' ||
      c.category === 'Academics' ||
      c.category === 'Faculty' ||
      c.title?.toLowerCase().includes('query') ||
      c.title?.toLowerCase().includes('anonymous')
  );

  const collegeInfrastructureIssues = complaints.filter(
    (c) =>
      c.category === 'College Infrastructure' ||
      c.category === 'Infrastructure' ||
      c.category === 'Wi-Fi/Internet' ||
      c.category === 'Security' ||
      c.category === 'Fees' ||
      c.hostel_block?.toLowerCase().includes('library') ||
      c.hostel_block?.toLowerCase().includes('campus')
  );

  const displayedList =
    activeTab === 'classrooms'
      ? classroomIssues
      : activeTab === 'anonymous_messages'
      ? anonymousMessages
      : activeTab === 'college'
      ? collegeInfrastructureIssues
      : complaints;

  const filteredComplaints = displayedList.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.public_tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleUpdateStatusAndReply = async () => {
    if (!selectedComplaint) return;
    setIsSubmittingAction(true);
    try {
      if (selectedStatusChange !== selectedComplaint.status) {
        await complaintService.updateComplaintStatus(
          selectedComplaint.id,
          selectedStatusChange,
          'college_management',
          `Updated by College Management: ${replyMessage || 'Status updated.'}`
        );
      }

      if (replyMessage.trim()) {
        await complaintService.addMessage(
          selectedComplaint.id,
          replyMessage,
          'college_management',
          'College Management Office',
          []
        );
      }

      showToast('Action Logged', 'Complaint status & 2-way message dispatched to student.', 'success');
      setReplyMessage('');
      setSelectedComplaint(null);
      await fetchComplaints();
    } catch (e) {
      showToast('Error', 'Failed to update issue.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDispatchTechnician = () => {
    showToast(
      'Work Order Dispatched 🛠️',
      `Assigned ${dispatchDept} technician to ${dispatchTarget}. ETA: 45 minutes.`,
      'success'
    );
    setDispatchModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5" /> College Management & Academic Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              College & Classroom Problems Command Center 🏢
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Direct triage for classroom AV/smartboard faults, laboratory equipment failures, college-wide infrastructure, and 100% anonymous student queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDispatchModalOpen(true)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold"
              leftIcon={<Wrench className="w-4 h-4 text-cyan-400" />}
            >
              Dispatch Classroom Technician
            </Button>
            <Link to="/management/announcements">
              <Button
                variant="primary"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                leftIcon={<Megaphone className="w-4 h-4" />}
              >
                Broadcast Notice
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-time KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Classroom Faults</span>
              <MonitorPlay className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{classroomIssues.length}</span>
              <span className="text-[10px] text-amber-400 font-semibold">AV / AC / Smartboards</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Lab Equipment</span>
              <FlaskConical className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-white">
                {complaints.filter((c) => c.category === 'Laboratory & Equipment').length}
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold">CS & Science Labs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Anonymous Queries</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-white">{anonymousMessages.length}</span>
              <span className="text-[10px] text-purple-300 font-semibold">Zero-Identity Inquiries</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Campus Facilities</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-white">{collegeInfrastructureIssues.length}</span>
              <span className="text-[10px] text-emerald-300 font-semibold">Library / Wi-Fi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>All College Grievances ({complaints.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classrooms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'classrooms'
              ? 'bg-white text-amber-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <MonitorPlay className="w-4 h-4 text-amber-600" />
          <span>Classroom & Lab Issues ({classroomIssues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anonymous_messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'anonymous_messages'
              ? 'bg-white text-purple-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span>Anonymous Student Messages ({anonymousMessages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('college')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'college'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>College Infrastructure ({collegeInfrastructureIssues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('work_orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'work_orders'
              ? 'bg-white text-cyan-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Wrench className="w-4 h-4 text-cyan-600" />
          <span>Classroom Hardware Status Grid</span>
        </button>
      </div>

      {/* Classroom Hardware Status Grid View */}
      {activeTab === 'work_orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Classroom & Laboratory Hardware Health</h2>
              <p className="text-xs text-slate-500">Live operational status of projectors, smartboards, audio mics & AC units</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDispatchModalOpen(true)}
              leftIcon={<Wrench className="w-4 h-4" />}
            >
              Dispatch New Work Order
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLASSROOM_DATABASE.map((room) => (
              <Card key={room.roomNumber} className="p-5 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {room.type.toUpperCase()}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{room.roomNumber}</h3>
                    <p className="text-xs text-slate-500">{room.block}</p>
                  </div>
                  {room.activeComplaints > 0 ? (
                    <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {room.activeComplaints} Fault Reported
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Operational
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Projector & Smartboard:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        room.equipment.projector === 'working'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {room.equipment.projector.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Audio Amplifier & Mic:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        room.equipment.audio === 'working'
                          ? 'bg-emerald-50 text-emerald-700'
                          : room.equipment.audio === 'maintenance'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {room.equipment.audio.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Air Conditioning:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        room.equipment.airConditioning === 'working'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {room.equipment.airConditioning.toUpperCase()}
                    </span>
                  </div>

                  {room.equipment.workstations && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Workstation PCs:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          room.equipment.workstations === 'working'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {room.equipment.workstations.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTarget(room.roomNumber);
                      setDispatchModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Dispatch Technician
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('classrooms');
                      setSearchQuery(room.roomNumber);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    View Tickets →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Filter & Grievance Table View */}
      {activeTab !== 'work_orders' && (
        <Card className="p-6 border-slate-200 bg-white shadow-soft">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classroom, ticket ID, keywords..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical / Urgent</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="investigating">Under Investigation</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchComplaints}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Table List */}
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading college grievances...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No issues found matching your filter</p>
              <p className="text-xs text-slate-400 mt-1">All classroom and college grievances are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Ticket & Category</th>
                    <th className="py-3 px-4">Problem Details & Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Anonymous Student ID</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredComplaints.map((item) => {
                    const statusConf = STATUS_LABELS[item.status] || {
                      label: item.status,
                      color: 'text-slate-700',
                      bg: 'bg-slate-100',
                    };
                    const prioConf = PRIORITY_LABELS[item.priority] || {
                      label: item.priority,
                      color: 'text-slate-700',
                      bg: 'bg-slate-100',
                    };

                    const isClassroom =
                      item.category === 'Classroom & Lecture Hall' || item.category === 'Laboratory & Equipment';
                    const isAnonMessage = item.category === 'Anonymous Message to Management';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs font-bold text-blue-600">{item.public_tracking_id}</div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                              isClassroom
                                ? 'bg-amber-100 text-amber-800'
                                : isAnonMessage
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${prioConf.bg} ${prioConf.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${prioConf.dot}`} />
                            {prioConf.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusConf.bg} ${statusConf.color}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-mono text-[11px] text-slate-800 font-bold">
                                {item.anonymous_public_id}
                              </p>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                                Identity Vault Protected
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedComplaint(item);
                                setSelectedStatusChange(item.status);
                              }}
                              className="text-xs font-bold"
                            >
                              Triage & Reply
                            </Button>
                            <Link to={`/management/complaints/${item.id}`}>
                              <Button variant="ghost" size="sm" className="p-2">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Triage & 2-Way Anonymous Reply Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Ticket #{selectedComplaint.public_tracking_id}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedComplaint.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Privacy First:</strong> You are responding to{' '}
                  <span className="font-mono font-bold">{selectedComplaint.anonymous_public_id}</span>. The student's real identity is cryptographically quarantined.
                </span>
              </div>

              {/* Original Description */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Problem Description</p>
                <p className="text-xs text-slate-800 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Change Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Official Status
                </label>
                <select
                  value={selectedStatusChange}
                  onChange={(e) => setSelectedStatusChange(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="assigned">Assigned to Maintenance/IT</option>
                  <option value="investigating">Under Investigation</option>
                  <option value="action_taken">Action Taken / Fix in Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* 2-Way Message Thread to Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dispatch Official Response to Student (2-Way Anonymous Thread)
                </label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="e.g. IT technician has inspected Classroom 304 and replaced the HDMI cable..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Existing Message History */}
              {selectedComplaint.messages && selectedComplaint.messages.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conversation Log</p>
                  <div className="space-y-2">
                    {selectedComplaint.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs ${
                          m.sender_role === 'student'
                            ? 'bg-blue-50/80 border border-blue-200 text-blue-900'
                            : 'bg-slate-100 border border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                          <span>{m.sender_display_name}</span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p>{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmittingAction}
                onClick={handleUpdateStatusAndReply}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Save Status & Dispatch Response
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dispatch Technician Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Dispatch Classroom Technician</h3>
              </div>
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Classroom / Lab
                </label>
                <select
                  value={dispatchTarget}
                  onChange={(e) => setDispatchTarget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Room 304">Academic Main Block - Room 304</option>
                  <option value="CS Lab 3">Science & Tech Block - CS Lab 3</option>
                  <option value="Room LH-201">Lecture Complex - Room LH-201</option>
                  <option value="Mechanical Seminar Hall">Mechanical Wing - Seminar Hall 1</option>
                  <option value="Electronics Lab 2">Science & Tech Block - Electronics Lab 2</option>
                  <option value="Central Library">Central Library - Book Bank & Study Hall</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Maintenance Unit
                </label>
                <select
                  value={dispatchDept}
                  onChange={(e) => setDispatchDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="IT & AV Support">IT & AV Support (Projectors, Smartboards, Wi-Fi)</option>
                  <option value="Electrical & Power">Electrical & Power (AC, Fans, Power Outlets)</option>
                  <option value="Civil & Carpentry">Civil & Carpentry (Benches, Writing Desks, Doors)</option>
                  <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Order Priority
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    High Priority - Class in Session Today
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technician Instructions
                </label>
                <textarea
                  rows={3}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <Button variant="ghost" size="sm" onClick={() => setDispatchModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDispatchTechnician}
                className="bg-cyan-600 hover:bg-cyan-500"
                rightIcon={<Wrench className="w-3.5 h-3.5" />}
              >
                Dispatch Work Order
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};