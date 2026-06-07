"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  shop_name: string;
  hourly_rate: number;
  night_rate: number;
  day_start_time: string;
  day_end_time: string;
};

export default function JobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [shopName, setShopName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [nightRate, setNightRate] = useState("");
  const [dayStartTime, setDayStartTime] = useState("06:00");
  const [dayEndTime, setDayEndTime] = useState("22:00");

  // State management variables for handling editing workflows
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setJobs(data || []);
    setLoading(false);
  }

  // Dual purpose submission handler: Switches between updating and creating entries smoothly
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopName || !hourlyRate || !nightRate || !dayStartTime || !dayEndTime) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
      user_id: user.id,
      shop_name: shopName,
      hourly_rate: Number(hourlyRate),
      night_rate: Number(nightRate),
      day_start_time: dayStartTime,
      day_end_time: dayEndTime,
    };

    if (editingJobId) {
      // Execute database modifications update path
      const { error } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", editingJobId);

      if (error) {
        console.error("Error executing workplace configuration updates:", error);
        setSaving(false);
        return;
      }
      setEditingJobId(null);
    } else {
      // Execute database append insert path
      const { error } = await supabase.from("jobs").insert(payload);

      if (error) {
        console.error("Error committing workspace configuration log card:", error);
        setSaving(false);
        return;
      }
    }

    // Reset input tracking parameters to initial defaults
    setShopName("");
    setHourlyRate("");
    setNightRate("");
    setDayStartTime("06:00");
    setDayEndTime("22:00");

    await loadJobs();
    setSaving(false);
  }

  // Pre-populates the input panel fields to trigger editing context adjustments
  function startEditing(job: Job) {
    setEditingJobId(job.id);
    setShopName(job.shop_name);
    setHourlyRate(job.hourly_rate.toString());
    setNightRate(job.night_rate.toString());
    
    // Normalize string parameters safely from database time variants (e.g. "06:00:00" -> "06:00")
    setDayStartTime(job.day_start_time ? job.day_start_time.slice(0, 5) : "06:00");
    setDayEndTime(job.day_end_time ? job.day_end_time.slice(0, 5) : "22:00");
  }

  function cancelEditing() {
    setEditingJobId(null);
    setShopName("");
    setHourlyRate("");
    setNightRate("");
    setDayStartTime("06:00");
    setDayEndTime("22:00");
  }

  async function deleteJob(id: string) {
    const confirmDelete = window.confirm("Are you sure you want to remove this job branch? Active historic shifts bound to this workspace may experience calculations drift.");
    if (!confirmDelete) return;

    await supabase.from("jobs").delete().eq("id", id);
    if (editingJobId === id) cancelEditing();
    loadJobs();
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 text-blue-500 rounded-full border-2 border-t-transparent" />
          <p className="text-sm font-medium text-gray-400 tracking-wide">Loading workplaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Main Heading block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Workplaces</h1>
        <p className="text-sm text-gray-400">
          Manage dynamic parameters, setup custom localized rate tables, and align legal operational frames.
        </p>
      </div>

      {/* Main Structural Layout Split Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT PANEL: Interactive Create/Edit Form Configuration Module */}
        <form onSubmit={handleSubmit} className={`lg:col-span-1 rounded-2xl border p-6 backdrop-blur-md space-y-4 shadow-xl transition-all ${
          editingJobId ? "border-amber-500/40 bg-amber-950/10" : "border-gray-800 bg-gray-900/50"
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {editingJobId ? "Modify Workplace" : "Register Workplace"}
            </h2>
            {editingJobId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="text-xs font-semibold text-amber-400 hover:underline hover:text-amber-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Shop Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Shop/Company Name</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g., Lawson Shinjuku"
              className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Hourly Rates Double Input Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Day Hourly Pay</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm text-gray-500">¥</span>
                <input
                  type="number"
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="1200"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 pl-8 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Night Hourly Pay</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm text-gray-500">¥</span>
                <input
                  type="number"
                  required
                  value={nightRate}
                  onChange={(e) => setNightRate(e.target.value)}
                  placeholder="1500"
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 pl-8 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Window Configuration Bounds Controls */}
          <div className="pt-2 border-t border-gray-800/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Day Rule Boundaries</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Define the specific period where standard day pay applies. Outside this range, night pay scales are automatically initiated.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Valid From</label>
                <input
                  type="time"
                  required
                  value={dayStartTime}
                  onChange={(e) => setDayStartTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Valid Until</label>
                <input
                  type="time"
                  required
                  value={dayEndTime}
                  onChange={(e) => setDayEndTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Submission Trigger Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full mt-2 rounded-xl p-3.5 text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-lg ${
              editingJobId 
                ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/10" 
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/10"
            }`}
          >
            {saving ? "Syncing Framework Changes..." : editingJobId ? "Save Workplace Changes" : "Register Location"}
          </button>
        </form>

        {/* RIGHT PANEL: Dynamic Records Overview Grid Component */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide">Registered Branches ({jobs.length})</h2>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-12 text-center text-sm text-gray-500 backdrop-blur-sm">
              No active job parameters mapped. Use the left configuration module to structure data tracking.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => {
                const formatTime = (t: string) => (t ? t.slice(0, 5) : "--:--");
                const tStart = formatTime(job.day_start_time);
                const tEnd = formatTime(job.day_end_time);

                return (
                  <div key={job.id} className={`group relative rounded-2xl border p-5 backdrop-blur-md shadow-md transition-all flex flex-col justify-between ${
                    editingJobId === job.id ? "border-amber-500 bg-amber-950/20 shadow-amber-500/5" : "border-gray-800 bg-gray-900/40 hover:border-gray-700/80"
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white tracking-wide truncate text-base">{job.shop_name}</h3>
                        
                        {/* Dynamic Management Trigger Options Button Panel */}
                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(job)}
                            className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Pay Rates Display cards breakdown element */}
                      <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800/40">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Day Base Rate</p>
                          <p className="text-lg font-extrabold text-blue-400 font-mono mt-0.5">¥{job.hourly_rate.toLocaleString()}<span className="text-xs font-normal text-gray-500 font-sans">/h</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Night Premium</p>
                          <p className="text-lg font-extrabold text-purple-400 font-mono mt-0.5">¥{job.night_rate.toLocaleString()}<span className="text-xs font-normal text-gray-500 font-sans">/h</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Lower Structural Elements: Double explicit timeframe visualization cards mapping rules */}
                    <div className="mt-4 pt-3 border-t border-gray-800/60 space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>☀️ Day Pay Window:</span>
                        <span className="font-mono bg-blue-500/10 border border-blue-500/15 text-blue-400 px-2 py-0.5 rounded-md font-medium">
                          {tStart} – {tEnd}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>🌙 Night Pay Window:</span>
                        <span className="font-mono bg-purple-500/10 border border-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md font-medium">
                          {tEnd} – {tStart}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}