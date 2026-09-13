import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types/database';
import { ComplaintFilterOptions } from '../../types/complaint';
import { complaintService } from '../../services/supabase/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFilters } from '../../components/complaints/ComplaintFilters';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { PlusCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export const MyComplaints: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilterOptions>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    priority: 'all',
    sortBy: 'newest',
  });

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints(filters, 'student', user?.id);
      setComplaints(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const handleUpvote = async (id: string) => {
    const res = await complaintService.upvoteComplaint(id, user?.id || 'demo-student');
    if (res.success) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, upvote_count: res.newCount, has_user_upvoted: !c.has_user_upvoted } : c))
      );
      showToast('Support Updated', 'Your issue support has been logged.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            My Submitted Grievances & Queries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track status transitions, responses, and real-time maintenance updates
          </p>
        </div>

        <Link to="/student/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Grievance
          </Button>
        </Link>
      </div>

      {/* Filter Component */}
      <ComplaintFilters filters={filters} onChange={setFilters} />

      {/* Complaints List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No grievances matching criteria"
          description="Try clearing your search query or submit a new grievance."
          actionLabel="Submit New Grievance"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onUpvote={handleUpvote}
              baseLink="/student/complaints"
            />
          ))}
        </div>
      )}
    </div>
  );
};
