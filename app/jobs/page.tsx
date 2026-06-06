"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  shop_name: string;
  hourly_rate: number;
  night_rate: number;
};

export default function JobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [shopName, setShopName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [nightRate, setNightRate] = useState("");

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
  }

  async function addJob() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("jobs").insert({
      user_id: user.id,
      shop_name: shopName,
      hourly_rate: Number(hourlyRate),
      night_rate: Number(nightRate || 0),
    });

    setShopName("");
    setHourlyRate("");
    setNightRate("");

    loadJobs();
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Section Headers */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Manage Jobs
        </h1>
        <p className="text-sm text-gray-400">
          Add or adjust your active workplace properties, flat base wages, and late night premiums.
        </p>
      </div>

      {/* Modern High-End Form Card */}
      <div className="rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <span className="text-blue-400">💼</span> Add New Workplace Location
        </h2>

        <div className="grid gap-5 md:grid-cols-3 items-end">
          
          {/* Shop Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Shop Name
            </label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g., FamilyMart Nerima"
              className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Regular Hourly Rate input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Base Hourly Rate (¥)
            </label>
            <input
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g., 1200"
              type="number"
              className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Night Premium Hourly Rate input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Night Premium Rate (¥)
            </label>
            <input
              value={nightRate}
              onChange={(e) => setNightRate(e.target.value)}
              placeholder="e.g., 1500"
              type="number"
              className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              onClick={addJob}
              className="relative group h-11 px-6 rounded-xl bg-blue-600 font-semibold text-xs text-white transition-all duration-300 hover:bg-blue-500 active:scale-[0.99] shadow-lg shadow-blue-600/20"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              <span className="relative z-10 flex items-center gap-1.5">
                <span>＋</span> Add Workplace
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Grid Feed Section for Logged Jobs */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Active Job Contracts ({jobs.length})
        </h3>
        
        {jobs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-gray-800 text-gray-500 text-sm">
            No registered workplaces found. Add your first job above to start logging hours!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/10 p-5 backdrop-blur-md hover:border-gray-700 transition-all duration-300"
              >
                {/* Visual Accent Top Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-indigo-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <h4 className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  {job.shop_name}
                </h4>

                <div className="mt-4 space-y-2 border-t border-gray-800/60 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Standard Rate:</span>
                    <span className="font-semibold text-gray-200">¥{job.hourly_rate.toLocaleString()}/hr</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <span>🌙</span> Night Premium:
                    </span>
                    <span className="font-semibold text-indigo-400">¥{job.night_rate.toLocaleString()}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}