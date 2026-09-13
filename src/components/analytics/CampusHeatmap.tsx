import React from 'react';
import { HostelBlockHeatmapData } from '../../types/analytics';
import { Card } from '../ui/Card';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface CampusHeatmapProps {
  data: HostelBlockHeatmapData[];
}

export const CampusHeatmap: React.FC<CampusHeatmapProps> = ({ data }) => {
  const intensityColors = {
    critical: 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30',
    high: 'bg-amber-500 text-white border-amber-600 shadow-amber-500/30',
    medium: 'bg-blue-500 text-white border-blue-600 shadow-blue-500/30',
    low: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30',
  };

  const intensityBg = {
    critical: 'bg-rose-50 border-rose-200 text-rose-800',
    high: 'bg-amber-50 border-amber-200 text-amber-800',
    medium: 'bg-blue-50 border-blue-200 text-blue-800',
    low: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Campus & Hostel Problem Heatmap
          </h4>
          <p className="text-xs text-slate-500">Live geographic concentration of reported grievances</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Hotspot
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low/Resolved
          </span>
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm ${
              intensityBg[item.intensity]
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-bold text-sm leading-tight text-slate-900">{item.block}</h5>
                <span className="text-[11px] font-semibold opacity-75 capitalize">
                  {item.intensity} Intensity Zone
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow ${
                  intensityColors[item.intensity]
                }`}
              >
                {item.issuesCount}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10 text-xs font-semibold">
              <span className="flex items-center gap-1 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" />
                {item.criticalCount} Critical
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {item.resolvedCount} Resolved
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
