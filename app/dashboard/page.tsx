"use client";

export default function DashboardPage() {
  // Mock data representing a typical user's tracking state
  const metrics = {
    weeklyHours: 18.5,
    maxHours: 28,
    estimatedEarnings: 24350, // in Yen
    monthlySavings: 45000,
    savingsGoal: 180000,
  };

  // Calculations for safe layout meters
  const hoursPercentage = Math.min((metrics.weeklyHours / metrics.maxHours) * 100, 100);
  const savingsPercentage = Math.min((metrics.monthlySavings / metrics.savingsGoal) * 100, 100);

  const recentShifts = [
    { id: 1, store: "FamilyMart Nerima", date: "June 6, 2026", hours: "5.0 hrs", pay: "¥6,250", nightShift: true },
    { id: 2, store: "7-Eleven Tokyo", date: "June 4, 2026", hours: "6.5 hrs", pay: "¥7,800", nightShift: false },
    { id: 3, store: "FamilyMart Nerima", date: "June 2, 2026", hours: "7.0 hrs", pay: "¥10,300", nightShift: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            Welcome back! Here is your work limit status and auto-earnings tracking overview.
          </p>
        </div>
        
        {/* Dynamic Status Pill */}
        <div className="inline-flex items-center self-start gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Within Safe 28h Work Limits
        </div>
      </div>

      {/* Grid Layout for Critical Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* CARD 1: Legal Hours safety limit tracking */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">⏰</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Hours Limit</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{metrics.weeklyHours}</span>
            <span className="text-sm font-medium text-gray-500">/ {metrics.maxHours} hrs</span>
          </div>
          
          {/* Custom Track Bar */}
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-950">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${hoursPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{metrics.maxHours - metrics.weeklyHours} hours remaining</span>
              <span className="font-semibold text-blue-400">{Math.round(hoursPercentage)}% used</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Payout estimation */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💴</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Estimated Weekly Pay</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">¥{metrics.estimatedEarnings.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-medium ml-2">Gross Payout</span>
          </div>
          <p className="mt-6 text-[11px] text-gray-400 leading-relaxed">
            Includes your configured base hourly wages and auto-added night premiums.
          </p>
        </div>

        {/* CARD 3: Savings Goals Tracking */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🎯</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Target Savings Progress</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">¥{metrics.monthlySavings.toLocaleString()}</span>
            <span className="text-sm font-medium text-gray-500">/ ¥{metrics.savingsGoal.toLocaleString()}</span>
          </div>

          {/* Custom Track Bar */}
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-950">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${savingsPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Goal device target allocation</span>
              <span className="font-semibold text-emerald-400">{Math.round(savingsPercentage)}% hit</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Two-Column Informational Block */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns: Recent Work Shifts History Table */}
        <div className="rounded-2xl border border-gray-800/80 bg-gray-900/10 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Work Logs</h3>
              <p className="text-xs text-gray-400">Your latest recorded active branch entries</p>
            </div>
            <button className="text-xs font-semibold text-blue-400 transition hover:text-blue-300 hover:underline">
              View All Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-medium">Workplace Location</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Log Time</th>
                  <th className="pb-3 font-medium text-right">Calc Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm text-gray-300">
                {recentShifts.map((shift) => (
                  <tr key={shift.id} className="group hover:bg-gray-950/20 transition-colors">
                    <td className="py-3.5 font-medium text-white flex items-center gap-2">
                      {shift.store}
                      {shift.nightShift && (
                        <span className="inline-flex items-center rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                          🌙 Premium
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-gray-400">{shift.date}</td>
                    <td className="py-3.5 text-gray-400">{shift.hours}</td>
                    <td className="py-3.5 text-right font-semibold text-emerald-400">{shift.pay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Column: Mini Quick Tips Panel */}
        <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-gray-900/30 to-gray-950/30 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Compliance Insights</h3>
            <p className="text-xs text-gray-400 mb-5">Legal safety rules guidelines inside Japan</p>
            
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-950/40 border border-gray-800/60 p-3">
                <span className="text-sm font-semibold text-amber-400">⚠️ Strict 28h Rule</span>
                <p className="text-xs text-gray-400 mt-1">
                  Student/Specific visa categories are required by Immigration laws to stay under 28 hours per week.
                </p>
              </div>

              <div className="rounded-xl bg-gray-950/40 border border-gray-800/60 p-3">
                <span className="text-sm font-semibold text-blue-400">🌙 Night Premium Multiplier</span>
                <p className="text-xs text-gray-400 mt-1">
                  Shifts worked between 22:00 and 05:00 automatically qualify for a baseline 25% statutory pay premium expansion.
                </p>
              </div>
            </div>
          </div>

          <button className="mt-6 h-10 w-full rounded-xl bg-blue-600/15 border border-blue-500/20 text-xs font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white">
            Configure Job Wages
          </button>
        </div>

      </div>

    </div>
  );
}