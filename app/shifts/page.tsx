"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  shop_name: string;
  hourly_rate: number;
  night_rate: number;
};

type WorkLog = {
  id: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_minutes: number;
  hours_worked: number;
  is_night_shift: boolean;
  jobs: {
    shop_name: string;
  };
};

export default function WorkLogsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);

  const [selectedJob, setSelectedJob] = useState("");
  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("30");
  const [nightShift, setNightShift] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: logsData } = await supabase
      .from("work_logs")
      .select(
        `
        *,
        jobs (
          shop_name
        )
      `
      )
      .eq("user_id", user.id)
      .order("work_date", { ascending: false });

    setJobs(jobsData || []);
    setLogs(logsData || []);

    if (jobsData?.length) {
      setSelectedJob(jobsData[0].id);
    }

    setLoading(false);
  }

  const calculatedHours = (() => {
    if (!clockIn || !clockOut) return "0.00";

    const start = new Date(`2000-01-01T${clockIn}`);
    const end = new Date(`2000-01-01T${clockOut}`);

    let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // overnight shift support
    if (hours < 0) {
      hours += 24;
    }

    hours -= Number(breakMinutes) / 60;

    return Math.max(hours, 0).toFixed(2);
  })();

  async function addLog() {
    if (!selectedJob || !clockIn || !clockOut) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("work_logs").insert({
      user_id: user.id,
      job_id: selectedJob,
      work_date: workDate,
      clock_in: clockIn,
      clock_out: clockOut,
      break_minutes: Number(breakMinutes),
      hours_worked: Number(calculatedHours),
      is_night_shift: nightShift,
    });

    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }

    setClockIn("");
    setClockOut("");
    setBreakMinutes("30");
    setNightShift(false);

    await loadData();
    setSaving(false);
  }

  async function deleteLog(id: string) {
    await supabase.from("work_logs").delete().eq("id", id);
    loadData();
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-gray-400 tracking-wide">Loading time entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Work Logs</h1>
        <p className="text-sm text-gray-400">
          Log active branch shifts, track custom break periods, and manage historical timecards.
        </p>
      </div>

      {/* Main Container Grid Split */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* LEFT COLUMN: Input Form Panels */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800/60 pb-3">
            <span className="text-blue-400">⏱️</span> Record Active Shift
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Job Select Selection box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Job Contract</label>
              <div className="relative">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id} className="bg-[#0f172a] text-white py-2">
                      {job.shop_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Work Date Box Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Work Date</label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* Clock In Time Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Clock In</label>
              <input
                type="time"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* Clock Out Time Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Clock Out</label>
              <input
                type="time"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* Break selection block dropdown (Item 4) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Break Duration</label>
              <div className="relative">
                <select
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="0" className="bg-[#0f172a] text-white">No Break</option>
                  <option value="15" className="bg-[#0f172a] text-white">15 Minutes</option>
                  <option value="30" className="bg-[#0f172a] text-white">30 Minutes</option>
                  <option value="45" className="bg-[#0f172a] text-white">45 Minutes</option>
                  <option value="60" className="bg-[#0f172a] text-white">1 Hour</option>
                  <option value="90" className="bg-[#0f172a] text-white">1.5 Hours</option>
                  <option value="120" className="bg-[#0f172a] text-white">2 Hours</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger footer box layout */}
          <div className="pt-4 border-t border-gray-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Shift Type Button Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNightShift(!nightShift)}
                className={`h-11 px-5 rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 border select-none ${
                  nightShift
                    ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                    : "border-gray-800 bg-gray-950 text-gray-400 hover:text-gray-200"
                }`}
              >
                {nightShift ? "🌙 Night Premium Rate Applied" : "☀️ Standard Day Shift Rate"}
              </button>
            </div>

            <button
              onClick={addLog}
              disabled={saving}
              className="relative group h-11 px-6 rounded-xl bg-blue-600 font-semibold text-xs text-white transition-all duration-300 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              <span className="relative z-10">{saving ? "Saving Log Card..." : "Save Work Log"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Calculated Hours Visualizer Card (Item 5) */}
        <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-gray-900/40 to-gray-950/40 p-5 space-y-4 backdrop-blur-md lg:sticky lg:top-24">
          <div>
            <h3 className="text-sm font-bold text-white">Hours Visualizer</h3>
            <p className="text-xs text-gray-400">Dynamic shift computation math</p>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5 shadow-[0_0_20px_rgba(59,130,246,0.02)]">
            <p className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Calculated Work Time</p>
            <h3 className="mt-1.5 text-4xl font-black text-white tracking-tight">{calculatedHours} <span className="text-lg font-normal text-gray-400">hrs</span></h3>
            
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-gray-950 border border-gray-800 px-3 py-1 text-gray-300 font-medium">
                Break: {breakMinutes} min
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 font-semibold border border-emerald-500/10">
                Auto Calculated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL ENTRIES DATA VIEWPORTS (Items 8 & 9) */}
      <div className="rounded-2xl border border-gray-800/80 bg-gray-900/10 p-6 backdrop-blur-md">
        <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Historical Logs Feed
        </h2>

        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center text-gray-500 text-sm">
            No work logs recorded yet. Complete the configuration forms layout above to track entry items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-semibold">Job Workplace</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Clock In</th>
                  <th className="pb-3 font-semibold">Clock Out</th>
                  <th className="pb-3 font-semibold">Break</th>
                  <th className="pb-3 font-semibold">Hours</th>
                  <th className="pb-3 font-semibold">Shift Category</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/40 text-sm text-gray-300">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-gray-950/20 transition-colors">
                    <td className="py-4 font-semibold text-white">{log.jobs?.shop_name}</td>
                    <td className="py-4 text-gray-400">{log.work_date}</td>
                    <td className="py-4 text-gray-400">{log.clock_in}</td>
                    <td className="py-4 text-gray-400">{log.clock_out}</td>
                    <td className="py-4 text-gray-400">{log.break_minutes || 0} min</td>
                    <td className="py-4 font-bold text-blue-400">{log.hours_worked} hrs</td>
                    <td className="py-4">
                      {log.is_night_shift ? (
                        <span className="inline-flex items-center rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                          🌙 Night
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                          ☀️ Day
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="text-xs font-medium text-red-400/80 hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-500/10 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}