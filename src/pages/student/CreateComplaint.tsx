import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/supabase/complaintService';
import { aiService } from '../../services/ai';
import { COMPLAINT_CATEGORIES, HOSTEL_BLOCKS, PRIORITY_LABELS } from '../../lib/constants';
import { ComplaintPriority } from '../../types/database';
import { SimilarComplaintResult } from '../../types/complaint';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUploader, UploadedAttachmentItem } from '../../components/media/FileUploader';
import { AudioRecorder } from '../../components/media/AudioRecorder';
import { SimilarIssuesModal } from '../../components/complaints/SimilarIssuesModal';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Flame,
  FileCheck,
  Building,
  Home,
  AlertTriangle,
} from 'lucide-react';

export const CreateComplaint: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<string>('Hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hostelBlock, setHostelBlock] = useState<string>(HOSTEL_BLOCKS[0]);
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [attachments, setAttachments] = useState<UploadedAttachmentItem[]>([]);

  // AI & Duplicate check state
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [similarIssues, setSimilarIssues] = useState<SimilarComplaintResult[]>([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success result state (Step 5)
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  const [anonymousId, setAnonymousId] = useState<string>('');

  // Handle Step 2 -> Step 3 check
  const handleProceedToStep3 = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      showToast('Missing Fields', 'Please fill in all required problem details.', 'warning');
      return;
    }

    // Run AI / keyword duplicate issue check
    setIsCheckingDuplicates(true);
    try {
      const allExisting = await complaintService.getComplaints();
      const duplicates = await aiService.findSimilarComplaints(title, description, allExisting);

      if (duplicates && duplicates.length > 0) {
        setSimilarIssues(duplicates);
        setIsDuplicateModalOpen(true);
        return;
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
    } finally {
      setIsCheckingDuplicates(false);
    }

    setCurrentStep(3);
  };

  const handleSupportExistingFromModal = async (issueId: string) => {
    setIsDuplicateModalOpen(false);
    const res = await complaintService.upvoteComplaint(issueId, user?.id || 'demo-student');
    if (res.success) {
      showToast('Supported Existing Issue', 'Your vote was added to accelerate resolution.', 'success');
      navigate(`/student/complaints/${issueId}`);
    }
  };

  const handleAudioReady = (blob: Blob, url: string) => {
    const audioItem: UploadedAttachmentItem = {
      file: blob,
      file_name: `Voice_Note_${Date.now()}.webm`,
      file_type: 'audio',
      file_size: blob.size,
      preview_url: url,
    };
    setAttachments((prev) => [...prev.filter((a) => a.file_type !== 'audio'), audioItem]);
    showToast('Voice Note Attached', 'Audio description saved to evidence package.', 'info');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await complaintService.createComplaint(
        {
          category,
          title,
          description,
          location: `${hostelBlock}, ${location}`,
          hostel_block: hostelBlock,
          priority,
          attachments,
        },
        user?.id
      );

      setCreatedComplaintId(result.id);
      setTrackingId(result.public_tracking_id);
      setAnonymousId(result.anonymous_public_id);
      setCurrentStep(5);
      showToast('Grievance Lodged', `Assigned Tracking ID: ${result.public_tracking_id}`, 'success');
    } catch (err) {
      showToast('Submission Error', 'Failed to submit grievance. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Category' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Evidence' },
    { num: 4, label: 'Privacy' },
    { num: 5, label: 'Confirmation' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Step Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === s.num
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                    currentStep === s.num
                      ? 'text-blue-600'
                      : currentStep > s.num
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-sm animate-in fade-in">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step 1 of 4</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Select Problem Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose the primary area your complaint or grievance relates to for automated routing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {COMPLAINT_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-sm ring-2 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs sm:text-sm block">{cat}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Problem Details
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PROBLEM DETAILS */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-5 bg-white border-slate-200 shadow-sm animate-in fade-in">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step 2 of 4</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Describe the Problem
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Category selected: <strong className="text-blue-700">{category}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Title / Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water leakage in hostel room ceiling"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, how long it has been occurring, and any hazard it creates..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hostel Block / Complex
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
                  Specific Location / Room / Corridor *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 3rd Floor Corridor & Room 312"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as ComplaintPriority[]).map((p) => {
                  const conf = PRIORITY_LABELS[p];
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        isSelected
                          ? `${conf.bg} ${conf.color} ring-2 ring-blue-500 font-extrabold shadow-sm`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleProceedToStep3}
              isLoading={isCheckingDuplicates}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Attach Evidence
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: ATTACH EVIDENCE & VOICE NOTE */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-sm animate-in fade-in">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step 3 of 4</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Attach Evidence (Optional)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Photos, short video clips, or recorded voice notes speed up maintenance inspection.
            </p>
          </div>

          <div className="space-y-6">
            {/* Audio Voice Note Module */}
            <AudioRecorder
              onAudioReady={handleAudioReady}
              onAudioRemoved={() => {
                setAttachments((prev) => prev.filter((a) => a.file_type !== 'audio'));
              }}
            />

            {/* General Multi-file Uploader */}
            <FileUploader
              attachments={attachments}
              onChange={(items) => setAttachments(items)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(4)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Privacy Confirmation
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: PRIVACY CONFIRMATION */}
      {currentStep === 4 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-sm animate-in fade-in">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Step 4 of 4</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-600" />
              Privacy & Anonymity Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please review how your identity is protected before transmitting this grievance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>🔐 Your identity will NOT be shown to management.</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-950">
              When submitted, the system assigns you a randomly generated pseudonym. Wardens, faculty, and IT technicians can communicate with you and address repairs without seeing your name or email.
            </p>
          </div>

          {/* Grievance Summary Preview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Submission Summary:</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div><strong className="text-slate-800">Category:</strong> {category}</div>
              <div><strong className="text-slate-800">Priority:</strong> {priority.toUpperCase()}</div>
              <div className="col-span-2"><strong className="text-slate-800">Title:</strong> {title}</div>
              <div className="col-span-2"><strong className="text-slate-800">Location:</strong> {hostelBlock}, {location}</div>
              <div className="col-span-2"><strong className="text-slate-800">Attachments:</strong> {attachments.length} items</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="privacy"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<FileCheck className="w-4 h-4" />}
            >
              Submit Anonymously
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: SUCCESS & RECEIPT */}
      {currentStep === 5 && (
        <Card className="p-8 sm:p-10 text-center space-y-6 bg-white border-emerald-200 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Grievance Successfully Lodged!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your report has entered the administrative triage queue. You can track progress and communicate anonymously at any time.
            </p>
          </div>

          {/* Generated ID badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left">
              <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Complaint Tracking ID</span>
              <span className="font-mono text-xl font-black text-blue-900 block mt-1">{trackingId}</span>
              <span className="text-[11px] text-blue-700 mt-1 block">Save this ID to track updates</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Anonymous Public Identity</span>
              <span className="font-mono text-sm font-extrabold text-emerald-900 block mt-1">{anonymousId}</span>
              <span className="text-[11px] text-emerald-700 mt-1 block">Visible to management</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to={`/student/complaints/${createdComplaintId}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Complaint Workspace
              </Button>
            </Link>
            <Link to="/student/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Duplicate detection modal */}
      <SimilarIssuesModal
        isOpen={isDuplicateModalOpen}
        onClose={() => {
          setIsDuplicateModalOpen(false);
          setCurrentStep(3);
        }}
        similarIssues={similarIssues}
        onSupportExisting={handleSupportExistingFromModal}
        onSubmitAnyway={() => {
          setIsDuplicateModalOpen(false);
          setCurrentStep(3);
        }}
      />
    </div>
  );
};
