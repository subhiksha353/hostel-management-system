import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ComplaintFilterOptions } from '../../types/complaint';
import { COMPLAINT_CATEGORIES, HOSTEL_BLOCKS } from '../../lib/constants';
import { Department } from '../../types/database';

export interface ComplaintFiltersProps {
  filters: ComplaintFilterOptions;
  onChange: (filters: ComplaintFilterOptions) => void;
  departments?: Department[];
  showDepartmentFilter?: boolean;
}

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  filters,
  onChange,
  departments = [],
  showDepartmentFilter = false,
}) => {
  const update = (key: keyof ComplaintFilterOptions, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    (filters.category && filters.category !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.hostelBlock && filters.hostelBlock !== 'all') ||
    (filters.departmentId && filters.departmentId !== 'all') ||
    Boolean(filters.emergencyOnly);

  const resetFilters = () => {
    onChange({
      searchQuery: '',
      category: 'all',
      status: 'all',
      priority: 'all',
      departmentId: 'all',
      hostelBlock: 'all',
      sortBy: 'newest',
      emergencyOnly: false,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3.5">
      {/* Search & Main Sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keyword, tracking ID (e.g. CV-82K4P), or room..."
            value={filters.searchQuery || ''}
            onChange={(e) => update('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => update('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort by:</label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => update('sortBy', e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority_high">Highest Priority</option>
            <option value="most_supported">Most Supported 👍</option>
            <option value="longest_unresolved">Longest Unresolved</option>
          </select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={filters.category || 'all'}
          onChange={(e) => update('category', e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Categories</option>
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => update('status', e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="assigned">Assigned</option>
          <option value="investigating">Under Investigation</option>
          <option value="action_taken">Action Taken</option>
          <option value="resolved">Resolved</option>
          <option value="reopened">Reopened</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority || 'all'}
          onChange={(e) => update('priority', e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Priorities</option>
          <option value="critical">🚨 Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Location Block */}
        <select
          value={filters.hostelBlock || 'all'}
          onChange={(e) => update('hostelBlock', e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
        >
          <option value="all">All Locations</option>
          {HOSTEL_BLOCKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Department (for management) */}
        {showDepartmentFilter && departments.length > 0 && (
          <select
            value={filters.departmentId || 'all'}
            onChange={(e) => update('departmentId', e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 hover:bg-rose-50 rounded-lg ml-auto transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};
