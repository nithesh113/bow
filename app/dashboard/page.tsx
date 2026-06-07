"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LiveMetrics = {
  weeklyHours: number;
  maxHours: number;
  estimatedEarnings: number;
  monthlySavings: number; // Linked directly to global user savings goal metric setting
  savingsGoal: number;
};

type LiveShiftRecord = {
  id: string;
  work_date: string;
  hours_worked: number;
  night_hours: number;
  clock_in: string;
  clock_out: string;
  jobs: {
    shop_name: string;
    hourly_rate: number;
    night_rate: number;
  };
};

export default function DashboardPage() {
  const supabase = createClient();

  const [metrics, setMetrics] = useState<LiveMetrics>({
    weeklyHours: 0,
    maxHours: 28,
    estimatedEarnings: 0,
    monthlySavings: 0,
    savingsGoal: 180000, // Defers to saved user settings configurations if found
  });

  const [recentShifts, setRecentShifts] = useState<LiveShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDynamicDashboardTelemetry();
  }, []);

  async function fetchDynamicDashboardTelemetry() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Calculate the precise boundaries for the current calendar week (Monday -> Sunday)
      const now = new Date();
      const currentDay = now.getDay(); // 0: Sunday, 1: Monday, etc.
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const startOfWeekISO = startOfWeek.toLocaleDateString("sv-SE");
      const endOfWeekISO = endOfWeek.toLocaleDateString("sv-SE");

      // 2. Query configurations settings to fetch the user's custom target financial goals
      const { data: settingsData } = await supabase
        .from("settings")
        .select("savings_goal")
        .eq("user_id", user.id)
        .single();

      const userTargetGoal = settingsData?.savings_goal ? Number(settingsData.savings_goal) : 180000;

      // 3. Query all historical timecard shifts matching the user profile
      const { data: logsData, error: logsError } = await supabase
        .from("work_logs")
        .select(`
          id,
          work_date,
          hours_worked,
          night_hours,
          clock_in,
          clock_out,
          jobs (
            shop_name,
            hourly_rate,
            night_rate
          )
        `)
        .eq("user_id", user.id)
        .order("work_date", { ascending: false });

      if (logsError) throw logsError;

      const records: LiveShiftRecord[] = (logsData as any) || [];

      // 4. Calculate live aggregates across the data stack
      let currentWeeklyHours = 0;
      let currentWeeklyEarnings = 0;
      let calculatedCumulativeIncomePool = 0;

      records.forEach((shift) => {
        const baseRate = shift.jobs?.hourly_rate || 0;
        const nightPremiumRate = shift.jobs?.night_rate || baseRate * 1.25;
        const totalHrs = Number(shift.hours_worked) || 0;
        const nightHrs = Number(shift.night_hours) || 0;
        const dayHrs = Math.max(totalHrs - nightHrs, 0);

        const shiftIncome = Math.round((dayHrs * baseRate) + (nightHrs * nightPremiumRate));
        
        // Sum total income across all shifts to simulate savings progression metrics
        calculatedCumulativeIncomePool += shiftIncome;

        // Contextual filter checking if shift date belongs explicitly inside the running Monday-Sunday track
        if (shift.work_date >= startOfWeekISO && shift.work_date <= endOfWeekISO) {
          currentWeeklyHours += totalHrs;
          currentWeeklyEarnings += shiftIncome;
        }
      });

      setMetrics({
        weeklyHours: currentWeeklyHours,
        maxHours: 28,
        estimatedEarnings: currentWeeklyEarnings,
        monthlySavings: Math.min(calculatedCumulativeIncomePool, userTargetGoal), // Caps progress naturally at goal target limits
        savingsGoal: userTargetGoal,
      });

      // Keep only the 3 most recent work entries for short list display widget
      setRecentShifts(records.slice(0, 3));

    } catch (err) {
      console.error("Critical error building live analytical dashboard telemetry:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate layout meters dynamically safely
  const hoursPercentage = Math.min((metrics.weeklyHours / metrics.maxHours) * 100, 100);
  const savingsPercentage = Math.min((metrics.monthlySavings / metrics.savingsGoal) * 100, 100);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
        
        {/* Dynamic Status Compliance Pill */}
        {metrics.weeklyHours > metrics.maxHours ? (
          <div className="inline-flex items-center self-start gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Legal 28h Work Hours Exceeded!
          </div>
        ) : metrics.weeklyHours >= 24 ? (
          <div className="inline-flex items-center self-start gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Approaching Legal Hours Threshold Limit
          </div>
        ) : (
          <div className="inline-flex items-center self-start gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Within Safe 28h Work Limits
          </div>
        )}
      </div>

      {/* Grid Layout for Critical Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* CARD 1: Legal Hours safety limit tracking */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">⏰</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Hours Limit</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono">{metrics.weeklyHours.toFixed(2)}</span>
            <span className="text-sm font-medium text-gray-500">/ {metrics.maxHours} hrs</span>
          </div>
          
          {/* Custom Track Bar */}
          <div className="mt-5 space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-950">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.weeklyHours > metrics.maxHours 
                    ? "bg-gradient-to-r from-red-500 to-orange-500" 
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${hoursPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>
                {metrics.weeklyHours > metrics.maxHours 
                  ? `${(metrics.weeklyHours - metrics.maxHours).toFixed(2)} hrs over limit`
                  : `${(metrics.maxHours - metrics.weeklyHours).toFixed(2)} hours remaining`
                }
              </span>
              <span className={`font-semibold ${metrics.weeklyHours > metrics.maxHours ? "text-red-400" : "text-blue-400"}`}>
                {Math.round(hoursPercentage)}% used
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Payout estimation */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💴</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Estimated Weekly Pay</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-black text-white font-mono">¥{metrics.estimatedEarnings.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-medium ml-2">Gross Payout</span>
          </div>
          <p className="mt-6 text-[11px] text-gray-400 leading-relaxed">
            Calculated directly from your active work week split values (Monday - Sunday) using custom employer time zone frames.
          </p>
        </div>

        {/* CARD 3: Savings Goals Tracking */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🎯</div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Target Savings Progress</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono">¥{metrics.monthlySavings.toLocaleString()}</span>
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
              <span>Cumulative lifecycle earnings milestone</span>
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
            <a href="/shifts" className="text-xs font-semibold text-blue-400 transition hover:text-blue-300 hover:underline">
              View All Logs
            </a>
          </div>

          <div className="overflow-x-auto">
            {recentShifts.length === 0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">
                No active work logs recorded yet. Visit the Shifts page to start scheduling.
              </div>
            ) : (
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
                  {recentShifts.map((shift) => {
                    const baseRate = shift.jobs?.hourly_rate || 0;
                    const premiumRate = shift.jobs?.night_rate || baseRate * 1.25;
                    const totalHrs = Number(shift.hours_worked) || 0;
                    const nightHrs = Number(shift.night_hours) || 0;
                    const dayHrs = Math.max(totalHrs - nightHrs, 0);
                    const totalPay = Math.round((dayHrs * baseRate) + (nightHrs * premiumRate));

                    return (
                      <tr key={shift.id} className="group hover:bg-gray-950/20 transition-colors">
                        <td className="py-3.5 font-medium text-white flex items-center gap-2">
                          {shift.jobs?.shop_name || "Unknown Workplace"}
                          {nightHrs > 0 && (
                            <span className="inline-flex items-center rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                              🌙 Premium
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-gray-400">{shift.work_date}</td>
                        <td className="py-3.5 text-gray-400 font-mono text-xs">
                          {shift.clock_in ? shift.clock_in.slice(0, 5) : "--:--"} - {shift.clock_out ? shift.clock_out.slice(0, 5) : "--:--"}
                          <span className="ml-1 text-gray-600">({totalHrs.toFixed(2)}h)</span>
                        </td>
                        <td className="py-3.5 text-right font-semibold text-emerald-400 font-mono">
                          ¥{totalPay.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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
                  Student/Specific visa categories are required by Immigration laws to stay under 28 hours per calendar week.
                </p>
              </div>

              <div className="rounded-xl bg-gray-950/40 border border-gray-800/60 p-3">
                <span className="text-sm font-semibold text-blue-400">🌙 Night Premium Multiplier</span>
                <p className="text-xs text-gray-400 mt-1">
                  Your shifts dynamically calculate custom windows safely on a per-job basis automatically.
                </p>
              </div>
            </div>
          </div>

          <a href="/jobs" className="mt-6 flex h-10 w-full items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/20 text-xs font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white">
            Configure Job Wages
          </a>
        </div>

      </div>

    </div>
  );
}