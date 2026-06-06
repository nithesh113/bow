"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [currency, setCurrency] = useState("¥");
  const [currencyPosition, setCurrencyPosition] = useState("before");
  const [weeklyLimit, setWeeklyLimit] = useState(28);
  const [savingsGoal, setSavingsGoal] = useState(180000);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select(`
        currency,
        currency_position,
        weekly_limit,
        savings_goal
      `)
      .eq("id", user.id)
      .single();

    if (data) {
      setCurrency(data.currency || "¥");
      setCurrencyPosition(data.currency_position || "before");
      setWeeklyLimit(data.weekly_limit || 28);
      setSavingsGoal(data.savings_goal || 180000);
    }

    setLoading(false);
  }

  async function saveSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        currency,
        currency_position: currencyPosition,
        weekly_limit: weeklyLimit,
        savings_goal: savingsGoal,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-gray-400 tracking-wide">Loading workspace parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Workspace Settings
        </h1>
        <p className="text-sm text-gray-400">
          Tailor compliance thresholds, targeted saving reserves, and global application localization parameters.
        </p>
      </div>

      {/* Main Structural Splitting Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* Left Side: Major Inputs Section Box */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800/80 bg-gray-900/20 p-6 backdrop-blur-md space-y-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-white border-b border-gray-800/60 pb-3">
            <span className="text-blue-400">⚙️</span> Configuration Rules
          </h2>

          <div className="space-y-5">
            {/* Preferred Currency Dropdown Select Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Preferred Currency
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="¥" className="bg-[#0f172a] text-white py-2">¥ Japanese Yen (JPY)</option>
                  <option value="₹" className="bg-[#0f172a] text-white py-2">₹ Indian Rupee (INR)</option>
                  <option value="$" className="bg-[#0f172a] text-white py-2">$ US Dollar (USD)</option>
                  <option value="€" className="bg-[#0f172a] text-white py-2">€ Euro (EUR)</option>
                  <option value="£" className="bg-[#0f172a] text-white py-2">£ British Pound (GBP)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Currency Positioning Option Select Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Currency Display Position
              </label>
              <div className="relative">
                <select
                  value={currencyPosition}
                  onChange={(e) => setCurrencyPosition(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="before" className="bg-[#0f172a] text-white py-2">Symbol Before Amount ({currency}1,200)</option>
                  <option value="after" className="bg-[#0f172a] text-white py-2">Symbol After Amount (1,200 {currency})</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Weekly Legal Work Limit Input Box Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Weekly Work Limit (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
              <p className="text-[11px] text-gray-500">
                Standard legal limit for student status holders inside Japan is strictly restricted to **28 hours**.
              </p>
            </div>

            {/* Target Monthly Savings Goal Input Box Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Monthly Savings Target
              </label>
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Action Trigger Buttons and Event Status Alerts */}
          <div className="pt-4 border-t border-gray-800/40 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={saveSettings}
              className="relative group h-11 px-6 rounded-xl bg-blue-600 font-semibold text-xs text-white transition-all duration-300 hover:bg-blue-500 active:scale-[0.99] shadow-lg shadow-blue-600/20"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              <span className="relative z-10">Save Settings</span>
            </button>

            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400 animate-fade-in">
                <span className="text-sm">✨</span>
                <p className="font-medium">Changes safely synchronized with profile data storage.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Real-Time Sticky Preview Dashboard Card */}
        <div className="sticky top-24 rounded-2xl border border-gray-800/80 bg-gradient-to-b from-gray-900/40 to-gray-950/40 p-5 space-y-5 backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white">Live System Preview</h3>
            <p className="text-xs text-gray-400">See how layout metrics format metrics visually</p>
          </div>

          <div className="space-y-4">
            {/* Metric Example 1: Shift Gross Pay Display format demo */}
            <div className="p-3.5 rounded-xl bg-gray-950/40 border border-gray-800/60 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wage Render Layout</span>
              <p className="text-xl font-black text-white">
                {currencyPosition === "before" ? `${currency}1,200` : `1,200 ${currency}`}
                <span className="text-xs font-normal text-gray-400 ml-1">/ hour</span>
              </p>
            </div>

            {/* Metric Example 2: Target threshold limit indicator tracking progress bar demo */}
            <div className="p-3.5 rounded-xl bg-gray-950/40 border border-gray-800/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weekly Target Cap</span>
                <span className="text-xs font-bold text-blue-400">{weeklyLimit} hrs max</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 w-2/3" />
              </div>
            </div>

            {/* Metric Example 3: Device Savings Goal metric indicator demo */}
            <div className="p-3.5 rounded-xl bg-gray-950/40 border border-gray-800/60 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Savings Allocation Target</span>
              <p className="text-base font-bold text-emerald-400">
                {currencyPosition === "before" 
                  ? `${currency}${savingsGoal.toLocaleString()}` 
                  : `${savingsGoal.toLocaleString()} ${currency}`}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}