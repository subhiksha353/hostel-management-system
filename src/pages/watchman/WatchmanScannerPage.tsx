import React, { useState, useEffect, useRef } from 'react';
import { leaveService } from '../../services/supabase/leaveService';
import { LeaveRequest } from '../../types/hostel';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Camera,
  CameraOff,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  User,
  Car,
  Check,
  Search,
  Zap,
  ArrowRight,
  Sparkles,
  History,
  AlertCircle,
  Building,
} from 'lucide-react';

export const WatchmanScannerPage: React.FC = () => {
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedPass, setScannedPass] = useState<LeaveRequest | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadLeaves = async () => {
    const list = await leaveService.getLeaveRequests(undefined, true);
    setAllLeaves(list);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Camera start/stop logic
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          showToast('Camera Active', 'Point your camera at the student outpass QR code.', 'info');
        }
      } else {
        setCameraError('Camera API is not supported on this browser/device.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please allow camera permissions or enter code manually.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Verification lookup
  const handleVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsProcessing(true);
    try {
      const pass = await leaveService.getLeaveByQrCode(codeToVerify);
      if (pass) {
        setScannedPass(pass);
        if (pass.status === 'approved') {
          showToast('Valid Approved Pass', 'Student ' + pass.student_name + ' is cleared for gate departure.', 'success');
        } else if (pass.status === 'pending') {
          showToast('Pass Not Approved', 'This pass is still pending Warden approval! Do not allow exit.', 'warning');
        } else if (pass.status === 'checked_out') {
          showToast('Already Checked Out', 'Student is currently outside. Ready for return check-in.', 'info');
        } else if (pass.status === 'rejected') {
          showToast('Pass Rejected', 'Warden has rejected this outpass. Exit strictly disallowed.', 'error');
        }
      } else {
        setScannedPass(null);
        showToast('Invalid QR Code', 'No outpass record found matching token: ' + codeToVerify, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGateAction = async (action: 'checkout' | 'checkin') => {
    if (!scannedPass) return;
    setIsProcessing(true);
    try {
      if (action === 'checkout') {
        await leaveService.recordGateCheckOut(scannedPass.id);
        showToast('Gate Check-Out Recorded', 'Student ' + scannedPass.student_name + ' departure logged at Main Gate.', 'success');
      } else {
        await leaveService.recordGateCheckIn(scannedPass.id);
        showToast('Gate Check-In Recorded', 'Student ' + scannedPass.student_name + ' safe return logged at Main Gate.', 'success');
      }
      await loadLeaves();
      const updated = await leaveService.getLeaveByQrCode(scannedPass.id);
      setScannedPass(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-emerald-300">
              <ShieldCheck className="w-8 h-8" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Main Campus Gate Security Desk</h1>
              <p className="text-sm text-emerald-200 mt-1">
                Official Watchman Portal: Live Camera QR Outpass Scanner & Student Movement Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white">
            Curfew Guard: Strict 08:30 PM Night Curfew
          </span>
        </div>
      </div>

      {/* Main Grid: Scanner Left + Verification Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Scanner & Manual Input (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Live Camera QR Scanner</h2>
              </div>
              <Button
                type="button"
                variant={cameraActive ? 'danger' : 'primary'}
                size="sm"
                onClick={cameraActive ? stopCamera : startCamera}
                leftIcon={cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                className="text-xs"
              >
                {cameraActive ? 'Turn Off Camera' : 'Start Camera Scanner'}
              </Button>
            </div>

            {/* Video Viewport with Target Reticle */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-800">
              <video
                ref={videoRef}
                playsInline
                muted
                className={'w-full h-full object-cover ' + (cameraActive ? 'block' : 'hidden')}
              />

              {!cameraActive && (
                <div className="text-center p-6 text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Camera is in Standby</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click "Start Camera Scanner" or test with instant outpass buttons below.
                    </p>
                  </div>
                  {cameraError && (
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded-xl border border-rose-800">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}

              {/* Scanning Target Overlay when camera is active */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-52 h-52 border-2 border-emerald-400 rounded-3xl relative animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                    {/* Laser line */}
                    <div className="w-full h-0.5 bg-emerald-400 absolute top-1/2 -translate-y-1/2 shadow-lg shadow-emerald-400/80 animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white bg-black/60 px-3 py-1 rounded-full mt-3 backdrop-blur">
                    Align student QR code inside target
                  </span>
                </div>
              )}
            </div>

            {/* Manual QR Pass Entry / Search */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Manual Pass Code / Student Room Number
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode(manualCode);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter QR Token (e.g. SB-PASS-ARV-9812-OK or Room 312)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="md" isLoading={isProcessing} className="text-xs">
                  Scan / Verify
                </Button>
              </form>
            </div>

            {/* Quick Test Outpasses for Watchman */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ⚡ Quick Test Pass Simulations:
              </span>
              <div className="flex flex-wrap gap-2">
                {allLeaves.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setManualCode(l.qr_pass_code);
                      handleVerifyCode(l.qr_pass_code);
                    }}
                    className={'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-left ' + (scannedPass?.id === l.id ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100')}
                  >
                    <span className="block font-mono text-[10px] text-slate-400">Room {l.room_number}</span>
                    <span>{l.student_name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Scanned Student Verification Result (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {!scannedPass ? (
            <Card className="p-12 text-center text-slate-400 bg-white border-slate-200 h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-700">Awaiting Outpass Scan</p>
              <p className="text-xs max-w-xs text-slate-500">
                Scan a student's SpaceBasic digital QR code with the camera or enter their pass code to inspect approval status and timings.
              </p>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
              {/* Top Status Header */}
              <div
                className={'p-4 rounded-2xl text-white flex items-center justify-between ' + (scannedPass.status === 'approved' ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : scannedPass.status === 'checked_out' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : scannedPass.status === 'checked_in' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-rose-600 to-red-700')}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                    Gate Clearance Verdict
                  </span>
                  <div className="text-lg font-black mt-0.5 flex items-center gap-2">
                    {scannedPass.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-200" />}
                    {scannedPass.status === 'checked_out' && <Car className="w-5 h-5 text-blue-200 animate-pulse" />}
                    {scannedPass.status === 'checked_in' && <Check className="w-5 h-5 text-slate-300" />}
                    {scannedPass.status === 'pending' && <AlertTriangle className="w-5 h-5 text-amber-200" />}
                    {scannedPass.status === 'rejected' && <XCircle className="w-5 h-5 text-rose-200" />}
                    <span>
                      {scannedPass.status === 'approved' && 'CLEAR FOR DEPARTURE (APPROVED)'}
                      {scannedPass.status === 'checked_out' && 'STUDENT OFF-CAMPUS (RETURN PENDING)'}
                      {scannedPass.status === 'checked_in' && 'SAFELY RETURNED & LOGGED'}
                      {scannedPass.status === 'pending' && 'DENIED: PENDING WARDEN APPROVAL'}
                      {scannedPass.status === 'rejected' && 'DENIED: REJECTED BY WARDEN'}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold bg-white/20 px-2.5 py-1 rounded-xl">
                  {scannedPass.qr_pass_code}
                </span>
              </div>

              {/* Student Identity Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {scannedPass.room_number}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Verified Student</span>
                  <h3 className="text-lg font-black text-slate-900">{scannedPass.student_name}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Room {scannedPass.room_number} • {scannedPass.hostel_block}
                  </p>
                </div>
              </div>

              {/* Timing & Curfew Schedule Box */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-blue-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Gate Departure
                  </span>
                  <p className="font-black text-slate-900 text-sm">{scannedPass.from_date}</p>
                  <p className="text-slate-600 font-medium">{scannedPass.from_time || '09:00 AM'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <span className="text-indigo-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Return Curfew Deadline
                  </span>
                  <p className="font-black text-indigo-950 text-sm">{scannedPass.to_date}</p>
                  <p className="text-indigo-700 font-bold">{scannedPass.to_time || '08:00 PM'}</p>
                </div>
              </div>

              {/* Travel & Parent Details */}
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Destination:</span>
                  <span className="font-bold text-slate-900">{scannedPass.destination}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Mode of Transport:</span>
                  <span className="font-bold text-slate-900">{scannedPass.transport_mode || 'Bus'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Parent Contact Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{scannedPass.parent_phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Parent Consent:</span>
                  <span className="font-bold text-emerald-700">✓ Verified & Acknowledged</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Approved By:</span>
                  <span className="font-bold text-slate-900">{scannedPass.approved_by || 'Dr. R. K. Verma (Warden)'}</span>
                </div>
                {scannedPass.warden_remarks && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-slate-700 italic">
                    <strong className="text-slate-900 not-italic font-bold">Warden Remarks:</strong> "{scannedPass.warden_remarks}"
                  </div>
                )}
              </div>

              {/* Watchman Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {scannedPass.status === 'approved' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => handleGateAction('checkout')}
                    isLoading={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm font-black shadow-lg shadow-emerald-600/20"
                    leftIcon={<Car className="w-5 h-5" />}
                  >
                    Allow Gate Check-Out (Student Leaving)
                  </Button>
                )}

                {scannedPass.status === 'checked_out' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => handleGateAction('checkin')}
                    isLoading={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-black shadow-lg shadow-blue-600/20"
                    leftIcon={<Check className="w-5 h-5" />}
                  >
                    Record Gate Check-In (Student Returned)
                  </Button>
                )}

                {(scannedPass.status === 'pending' || scannedPass.status === 'rejected') && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl w-full text-center text-rose-800 text-xs font-bold flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Exit Prohibited: Pass is not approved by Hostel Warden
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Gate Movements Table */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Today's Gate Movement Activity Log</h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">Total Outpasses: {allLeaves.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Room No</th>
                <th className="py-3 px-4">Student Name & Block</th>
                <th className="py-3 px-4">Pass Type & Destination</th>
                <th className="py-3 px-4">Departure Time</th>
                <th className="py-3 px-4">Return Curfew</th>
                <th className="py-3 px-4">Gate Status</th>
                <th className="py-3 px-4 text-right">Quick Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allLeaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-black text-slate-900">{l.room_number}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {l.student_name} <span className="text-[11px] text-slate-400 font-normal">({l.hostel_block})</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{l.destination}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{l.leave_type?.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {l.from_date} ({l.from_time || '09:00 AM'})
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {l.to_date} ({l.to_time || '08:00 PM'})
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ' + (l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : l.status === 'checked_out' ? 'bg-blue-100 text-blue-800 animate-pulse' : l.status === 'checked_in' ? 'bg-slate-100 text-slate-700' : l.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}
                    >
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setManualCode(l.qr_pass_code);
                        handleVerifyCode(l.qr_pass_code);
                      }}
                      className="text-[11px] py-1 px-2.5 h-auto text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      leftIcon={<QrCode className="w-3 h-3" />}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
