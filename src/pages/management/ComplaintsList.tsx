import React, { useState, useEffect } from 'react';
import { Complaint, Department } from '../../types/database';
import { ComplaintFilterOptions } from '../../types/complaint';
import { complaintService } from '../../services/supabase/complaintService';
import { MOCK_DEPARTMENTS } from '../../services/supabase/mockData';
import { useAuth } from '../../hooks/useAuth';
import { ComplaintFilters } from '../../components/complaints/ComplaintFilters';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { LayoutGrid, List, FileSpreadsheet } from 'lucide-react';

export const ComplaintsList: React.FC = () => {
  const { role } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState<ComplaintFilterOptions>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    priority: 'all',
    departmentId: 'all',
    hostelBlock: 'all',
    sortBy: 'newest',
    emergencyOnly: false,
  });

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints(filters, role);
      setComplaints(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [filters, role]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Administrative Grievance Triage Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Decoupled anonymous tickets. Filter by category, department, or urgency level.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <ComplaintFilters
        filters={filters}
        onChange={setFilters}
        departments={departments}
        showDepartmentFilter={true}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>Showing {complaints.length} Grievance Records</span>
        <span className="text-emerald-700">🔒 Zero Identity Leakage Enforced</span>
      </div>

      {/* Render Table or Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No grievances matching filter criteria"
          description="Adjust your search query or reset filters to display more tickets."
        />
      ) : viewMode === 'table' ? (
        <ComplaintTable complaints={complaints} baseLink="/management/complaints" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              baseLink="/management/complaints"
              showUpvoteButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
