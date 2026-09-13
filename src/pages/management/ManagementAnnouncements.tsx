import React, { useState, useEffect } from 'react';
import { Announcement, Department } from '../../types/database';
import { announcementService } from '../../services/supabase/announcementService';
import { MOCK_DEPARTMENTS } from '../../services/supabase/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Megaphone, PlusCircle, AlertTriangle, Users, Clock } from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';

export const ManagementAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [departmentId, setDepartmentId] = useState<string>(MOCK_DEPARTMENTS[0].id);
  const [targetAudience, setTargetAudience] = useState('all');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [isPublishing, setIsPublishing] = useState(false);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);
    try {
      const created = await announcementService.createAnnouncement({
        title,
        content,
        departmentId,
        targetAudience,
        priority,
        createdBy: user?.profile.name || 'Campus Administration',
      });

      setAnnouncements((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      showToast('Announcement Published', 'Broadcast notice delivered to students.', 'success');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-600" />
            Campus Broadcast Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish maintenance schedules, emergency safety notices, and institutional updates
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Publish Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No Announcements Published"
          description="Click above to broadcast a notice to students and hostels."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card
              key={a.id}
              className={`p-6 bg-white border space-y-3 ${
                a.priority === 'urgent' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {a.department_name || 'Administration'}
                  </span>
                  {a.priority === 'urgent' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent Notice
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {formatDateRelative(a.created_at)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{a.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {a.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Target Audience: <strong className="text-slate-600 capitalize">{a.target_audience}</strong>
                </span>
                <span>Author: <strong className="text-slate-600">{a.created_by}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Broadcast Announcement"
        description="Deliver a notice across student dashboard feeds."
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title / Subject *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Water Tank Cleaning in Block A & B"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issuing Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="all">All Campus Students</option>
                <option value="hostel">Hostel Residents Only</option>
                <option value="day_scholars">Day Scholars Only</option>
                <option value="block_a">Block A Residents</option>
                <option value="block_b">Block B Residents</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="normal">Normal Broadcast</option>
                <option value="urgent">🚨 Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Announcement Message Body *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide exact timings, affected blocks, and instructions for students..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isPublishing}>
              Broadcast Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
