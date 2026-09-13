import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CategoryDistribution, MonthlyTrend, PriorityBreakdown, DepartmentPerformance } from '../../types/analytics';
import { Card } from '../ui/Card';

export const MonthlyTrendsChart: React.FC<{ data: MonthlyTrend[] }> = ({ data }) => {
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">Grievance Trends & Resolution Velocity</h4>
          <p className="text-xs text-slate-500">Submitted vs Resolved over time</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="submitted"
              name="Submitted Issues"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSubmitted)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved Issues"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorResolved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const CategoryBarChart: React.FC<{ data: CategoryDistribution[] }> = ({ data }) => {
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900">Issues by Category</h4>
        <p className="text-xs text-slate-500">Distribution across campus operational domains</p>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="category"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              angle={-25}
              textAnchor="end"
            />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" name="Total Reports" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="resolvedCount" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const PriorityPieChart: React.FC<{ data: PriorityBreakdown[] }> = ({ data }) => {
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900">Priority Breakdown</h4>
        <p className="text-xs text-slate-500">Urgency level distribution across all active complaints</p>
      </div>

      <div className="h-64 sm:h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="count"
              nameKey="priority"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const DepartmentPerformanceTable: React.FC<{ data: DepartmentPerformance[] }> = ({ data }) => {
  return (
    <Card className="p-5 sm:p-6 space-y-4 overflow-hidden">
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900">Department Resolution SLA & Satisfaction</h4>
        <p className="text-xs text-slate-500">Accountability metrics per responsible campus body</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Assigned</th>
              <th className="py-3 px-3">Resolved</th>
              <th className="py-3 px-3">Avg Turnaround</th>
              <th className="py-3 px-3 text-right">Student Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((d, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-3 px-3 font-semibold text-slate-800">{d.department}</td>
                <td className="py-3 px-3 font-mono text-slate-600">{d.totalAssigned}</td>
                <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{d.resolvedCount}</td>
                <td className="py-3 px-3 font-mono text-slate-600">{d.avgHours}h</td>
                <td className="py-3 px-3 text-right">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {d.satisfactionRate}% ⭐
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
