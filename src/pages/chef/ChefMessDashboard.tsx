import React, { useState, useEffect } from 'react';
import { foodService } from '../../services/supabase/foodService';
import { MessHeadcountSummary, RawMaterialEstimate, DailyMenuItem } from '../../types/hostel';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  UtensilsCrossed,
  Users,
  TrendingDown,
  ChefHat,
  Coffee,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  Clock,
  Search,
  CheckSquare,
  Square,
  Edit3,
  Save,
  Scale,
} from 'lucide-react';

export const ChefMessDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<MessHeadcountSummary | null>(null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialEstimate[]>([]);
  const [menu, setMenu] = useState<DailyMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'headcount' | 'materials' | 'menu' | 'scanner'>('headcount');
  
  // Student Roll-Call Tally
  const [searchStudent, setSearchStudent] = useState('');
  const [verifiedStudents, setVerifiedStudents] = useState<Record<string, boolean>>({
    '312': true,
    '204': true,
  });

  // Mock Active Student List for Roll Call
  const [sampleStudents] = useState([
    { room: '312', name: 'Aarav Sharma', block: 'Block A', status: 'Eating (Veg)', time: '08:15 AM' },
    { room: '204', name: 'Sowmiya R.', block: 'Block C', status: 'Eating (Veg)', time: '08:22 AM' },
    { room: '108', name: 'Karthik N.', block: 'Block B', status: 'On Leave (Away)', time: '-' },
    { room: '405', name: 'Rohan Mehra', block: 'Block A', status: 'Eating (Non-Veg)', time: 'Pending' },
    { room: '219', name: 'Divya Prakash', block: 'Block C', status: 'Eating (Veg)', time: 'Pending' },
    { room: '512', name: 'Vikram Joshi', block: 'Block B', status: 'Eating (Special Jain)', time: 'Pending' },
    { room: '102', name: 'Priya Sundaram', block: 'Block C', status: 'On Leave (Away)', time: '-' },
    { room: '304', name: 'Ananya Gupta', block: 'Block B', status: 'Eating (Veg)', time: 'Pending' },
  ]);

  useEffect(() => {
    const load = async () => {
      const s = await foodService.getMessHeadcountSummary();
      setSummary(s);
      const rm = await foodService.getRawMaterialEstimates(s.eatingTodayCount);
      setRawMaterials(rm);
      const m = await foodService.getDailyMenu();
      setMenu(m);
    };
    load();
  }, []);

  const handleToggleVerify = (room: string) => {
    setVerifiedStudents((prev) => {
      const next = { ...prev, [room]: !prev[room] };
      showToast(
        next[room] ? 'Meal Verified' : 'Verification Revoked',
        'Room ' + room + ' meal ticket marked ' + (next[room] ? 'Claimed' : 'Unclaimed') + '.',
        'info'
      );
      return next;
    });
  };

  const handleSaveMenu = async () => {
    await foodService.updateDailyMenu(menu);
    showToast('Menu Updated', 'Today mess menu has been broadcasted to all student portals.', 'success');
  };

  const handleUpdateMenuItem = (index: number, newText: string) => {
    const updated = [...menu];
    updated[index].items = newText.split(',').map((s) => s.trim());
    setMenu(updated);
  };

  if (!summary) {
    return <div className="p-8 text-center text-slate-500">Loading Chef & Mess Portal...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-amber-100">
              <ChefHat className="w-8 h-8" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Mess Authority & Chef Portal</h1>
              <p className="text-sm text-amber-100/90 mt-1">
                SpaceBasic-style live meal headcounts, kitchen raw material scaling, and food waste reduction
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-200">Next Meal Window</div>
            <div className="text-sm font-black text-white">Lunch: 12:30 PM - 02:30 PM</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
        {[
          { id: 'headcount', label: '📊 Meal Headcounts', icon: Users },
          { id: 'materials', label: '⚖️ Kitchen Raw Materials', icon: Scale },
          { id: 'scanner', label: '🎟️ Student Roll-Call Tally', icon: CheckSquare },
          { id: 'menu', label: '📝 Daily Menu Manager', icon: Edit3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-600 text-amber-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Headcount */}
      {activeTab === 'headcount' && (
        <div className="space-y-6">
          {/* Top 4 Meal Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Breakfast */}
            <Card className="p-5 bg-white border-slate-200 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Coffee className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-3">Breakfast Attendees</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{summary.breakfastCount}</p>
              <p className="text-[11px] text-slate-400 mt-1">7:30 AM - 9:30 AM (Idli & Vada)</p>
            </Card>

            {/* Lunch */}
            <Card className="p-5 bg-white border-amber-300 bg-amber-50/20 relative overflow-hidden shadow-sm ring-1 ring-amber-400">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-orange-100 text-orange-700">
                  <Sun className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  Cooking Now
                </span>
              </div>
              <p className="text-xs text-orange-800 font-bold mt-3">Lunch Confirmed Count</p>
              <p className="text-3xl font-black text-orange-950 mt-0.5">{summary.lunchCount}</p>
              <p className="text-[11px] text-orange-700 font-medium mt-1">12:30 PM - 2:30 PM (Paneer / Chicken)</p>
            </Card>

            {/* Snacks */}
            <Card className="p-5 bg-white border-slate-200 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Sunset className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-3">Evening Snacks Count</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{summary.snacksCount}</p>
              <p className="text-[11px] text-slate-400 mt-1">5:00 PM - 6:15 PM (Pakoda & Chai)</p>
            </Card>

            {/* Dinner */}
            <Card className="p-5 bg-white border-slate-200 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                  <Moon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Cutoff 6:00 PM
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-3">Dinner Estimated Count</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{summary.dinnerCount}</p>
              <p className="text-[11px] text-slate-400 mt-1">7:30 PM - 9:30 PM (Phulka & Sweet)</p>
            </Card>
          </div>

          {/* Diet Split & Savings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                Diet Preference Breakdown (Today's Lunch)
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">🥬 Pure Vegetarian</span>
                    <span className="font-mono text-slate-900">{summary.vegCount} students (66%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '66%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700">🍗 Non-Vegetarian (Chicken Option)</span>
                    <span className="font-mono text-slate-900">{summary.nonVegCount} students (31%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-purple-700">🥗 Special Diet (Jain / Medical)</span>
                    <span className="font-mono text-slate-900">{summary.specialDietCount} students (3%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Waste Reduction Metrics */}
            <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> SpaceBasic Food Waste Prevention Impact
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Live ROI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-emerald-200">Students on Leave</p>
                  <p className="text-3xl font-black text-white mt-1">{summary.awayCount}</p>
                  <p className="text-[10px] text-emerald-300 mt-1">Marked attendance NOT eating</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-emerald-200">Food Waste Saved</p>
                  <p className="text-3xl font-black text-emerald-300 mt-1">{summary.estimatedFoodReductionKg} kg</p>
                  <p className="text-[10px] text-emerald-200 mt-1">Cooked food saved from disposal</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-emerald-200">Mess Budget Saved</p>
                  <p className="text-3xl font-black text-amber-300 mt-1">₹{summary.estimatedMoneySaved.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-200 mt-1">Direct raw material savings today</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Material Scaling Calculator */}
      {activeTab === 'materials' && (
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                Raw Material Batch Preparation Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Calculates precise ingredient scaling for {summary.eatingTodayCount} attendees
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 font-mono">
              Scaled for {summary.eatingTodayCount} Plates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Ingredient / Item</th>
                  <th className="py-3 px-4">Required Batch Amount</th>
                  <th className="py-3 px-4">Amount Saved (Absent Students)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawMaterials.map((rm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                        {rm.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rm.item}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700 text-sm">
                      {rm.requiredAmount} {rm.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                      +{rm.savingsAmount} {rm.unit} saved
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Prep
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Student Roll Call Tally Scanner */}
      {activeTab === 'scanner' && (
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-600" />
                Live Mess Entry & Meal Token Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Search student room number to check meal token status or mark attendance at dining entrance
              </p>
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search Room or Student Name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Room No</th>
                  <th className="py-3 px-4">Student Name & Block</th>
                  <th className="py-3 px-4">Meal Status / Preference</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4 text-right">Plate Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleStudents
                  .filter(
                    (s) =>
                      s.room.includes(searchStudent) ||
                      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      s.block.toLowerCase().includes(searchStudent.toLowerCase())
                  )
                  .map((st) => {
                    const isClaimed = !!verifiedStudents[st.room];
                    const isAway = st.status.includes('Leave');
                    return (
                      <tr key={st.room} className={`hover:bg-slate-50/80 ${isAway ? 'bg-slate-50/40 text-slate-400' : ''}`}>
                        <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">{st.room}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {st.name} <span className="text-[11px] text-slate-400 font-normal">({st.block})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAway
                                ? 'bg-rose-100 text-rose-700'
                                : st.status.includes('Non-Veg')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{st.time}</td>
                        <td className="py-3 px-4 text-right">
                          {isAway ? (
                            <span className="text-[11px] text-rose-600 font-medium">Away (No Plate)</span>
                          ) : (
                            <Button
                              variant={isClaimed ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleToggleVerify(st.room)}
                              className="text-[11px] py-1 px-3 h-auto"
                              leftIcon={isClaimed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5" />}
                            >
                              {isClaimed ? 'Plate Claimed' : 'Mark Entry'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Daily Menu Manager */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Live Mess Menu Editor
              </h2>
              <p className="text-xs text-slate-500">
                Update today's meals; changes instantly display on student dashboards and mobile feeds
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleSaveMenu} leftIcon={<Save className="w-4 h-4" />}>
              Save & Broadcast Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu.map((m, idx) => (
              <Card key={idx} className="p-6 bg-white border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    {m.meal}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{m.timing}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Food Items (comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={m.items.join(', ')}
                    onChange={(e) => handleUpdateMenuItem(idx, e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Chef Special Notes
                  </label>
                  <input
                    type="text"
                    value={m.chefNotes || ''}
                    onChange={(e) => {
                      const updated = [...menu];
                      updated[idx].chefNotes = e.target.value;
                      setMenu(updated);
                    }}
                    placeholder="e.g. Extra sweet available; dinner cutoff strictly 9:30 PM"
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
