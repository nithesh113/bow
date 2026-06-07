"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Job = {
  id: string;
  shop_name: string;
  hourly_rate: number;
  night_rate: number;
  day_start_time: string;
  day_end_time: string;
};

type WorkLog = {
  id: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_minutes: number;
  hours_worked: number;
  night_hours: number;
  job_id: string;
  jobs: {
    shop_name: string;
    hourly_rate: number;
    night_rate: number;
    day_start_time: string;
    day_end_time: string;
  };
};

export default function ShiftsCalendarPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calendar & Month Tracking States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Form Inputs State
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("30");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: logsData } = await supabase
      .from("work_logs")
      .select(`
        *,
        jobs (
          shop_name,
          hourly_rate,
          night_rate,
          day_start_time,
          day_end_time
        )
      `)
      .eq("user_id", user.id);

    setJobs(jobsData || []);
    setLogs(logsData || []);

    if (jobsData?.length && !selectedJobId) {
      setSelectedJobId(jobsData[0].id);
    }
    setLoading(false);
  }

  // Calculate earnings for any singular work log entry
  const calculateLogEarnings = (log: WorkLog) => {
    const baseRate = log.jobs?.hourly_rate || 0;
    const premiumRate = log.jobs?.night_rate || baseRate * 1.25;
    const totalHrs = Number(log.hours_worked) || 0;
    const nightHrs = Number(log.night_hours) || 0;
    const dayHrs = Math.max(totalHrs - nightHrs, 0);
    return Math.round((dayHrs * baseRate) + (nightHrs * premiumRate));
  };

  // Dynamic monthly aggregates block filtering by current month view context
  const monthlyMetrics = (() => {
    const targetYear = currentMonth.getFullYear();
    const targetMonth = currentMonth.getMonth(); // 0-11

    let totalEarnings = 0;
    let totalHours = 0;

    logs.forEach((log) => {
      const logDate = new Date(log.work_date);
      if (logDate.getFullYear() === targetYear && logDate.getMonth() === targetMonth) {
        totalHours += Number(log.hours_worked) || 0;
        totalEarnings += calculateLogEarnings(log);
      }
    });

    return {
      earnings: totalEarnings.toLocaleString(),
      hours: totalHours.toFixed(2),
    };
  })();

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    
    const dateString = date.toLocaleDateString("sv-SE");
    const existingLog = logs.find((l) => l.work_date === dateString);

    if (existingLog) {
      setEditingLogId(existingLog.id);
      setSelectedJobId(existingLog.job_id);
      setClockIn(existingLog.clock_in ? existingLog.clock_in.slice(0, 5) : "");
      setClockOut(existingLog.clock_out ? existingLog.clock_out.slice(0, 5) : "");
      setBreakMinutes(existingLog.break_minutes.toString());
    } else {
      setEditingLogId(null);
      setClockIn("");
      setClockOut("");
      setBreakMinutes("30");
      if (jobs.length > 0) setSelectedJobId(jobs[0].id);
    }
    setIsModalOpen(true);
  };

  // Live Popup Form Calculator Engine
  const shiftBreakdown = (() => {
    if (!clockIn || !clockOut) {
      return { totalHours: "0.00", standardHours: 0, nightHours: 0, formattedTime: "0h 0m", estimatedPay: 0 };
    }

    const [inH, inM] = clockIn.split(":").map(Number);
    const [outH, outM] = clockOut.split(":").map(Number);

    let startMin = inH * 60 + inM;
    let endMin = outH * 60 + outM;

    if (endMin < startMin) endMin += 24 * 60;

    const totalMinutes = endMin - startMin;
    const breakMin = Number(breakMinutes) || 0;
    const netMinutes = Math.max(totalMinutes - breakMin, 0);

    const displayHours = Math.floor(netMinutes / 60);
    const displayMins = netMinutes % 60;
    const humanReadableTime = `${displayHours}h ${displayMins}m`;

    const activeJob = jobs.find((j) => j.id === selectedJobId);
    const dayStartStr = activeJob?.day_start_time || "06:00:00";
    const dayEndStr = activeJob?.day_end_time || "22:00:00";
    const baseRate = activeJob?.hourly_rate || 0;
    const nightRate = activeJob?.night_rate || baseRate * 1.25;

    const [dsH, dsM] = dayStartStr.split(":").map(Number);
    const [deH, deM] = dayEndStr.split(":").map(Number);
    const dayStartBoundary = dsH * 60 + dsM;
    const dayEndBoundary = deH * 60 + deM;

    let calculatedDayMin = 0;
    for (let min = startMin; min < endMin; min++) {
      const normalizedMin = min % 1440;
      if (dayStartBoundary <= dayEndBoundary) {
        if (normalizedMin >= dayStartBoundary && normalizedMin < dayEndBoundary) calculatedDayMin++;
      } else {
        if (normalizedMin >= dayStartBoundary || normalizedMin < dayEndBoundary) calculatedDayMin++;
      }
    }

    const calculatedNightMin = Math.max(totalMinutes - calculatedDayMin, 0);
    let finalNightMin = calculatedNightMin;
    let finalDayMin = calculatedDayMin;

    if (totalMinutes > 0 && breakMin > 0) {
      const nightFraction = calculatedNightMin / totalMinutes;
      finalNightMin = Math.max(calculatedNightMin - breakMin * nightFraction, 0);
      finalDayMin = Math.max(netMinutes - finalNightMin, 0);
    }

    const finalNightHours = finalNightMin / 60;
    const finalStandardHours = finalDayMin / 60;
    const finalTotalHours = netMinutes / 60;

    const totalPay = (finalStandardHours * baseRate) + (finalNightHours * nightRate);

    return {
      totalHours: finalTotalHours.toFixed(2),
      standardHours: finalStandardHours,
      nightHours: finalNightHours,
      formattedTime: humanReadableTime,
      estimatedPay: Math.round(totalPay),
    };
  })();

  async function handleSaveShift() {
    if (!selectedJobId || !clockIn || !clockOut || !selectedDate) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateString = selectedDate.toLocaleDateString("sv-SE");

    const payload = {
      user_id: user.id,
      job_id: selectedJobId,
      work_date: dateString,
      clock_in: clockIn,
      clock_out: clockOut,
      break_minutes: Number(breakMinutes),
      hours_worked: Number(shiftBreakdown.totalHours),
      night_hours: Number(shiftBreakdown.nightHours),
    };

    const { error } = editingLogId
      ? await supabase.from("work_logs").update(payload).eq("id", editingLogId)
      : await supabase.from("work_logs").insert(payload);

    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }

    setIsModalOpen(false);
    await loadData();
    setSaving(false);
  }

  async function handleDeleteShift() {
    if (!editingLogId) return;
    const confirmDelete = window.confirm("Remove this shift log entry?");
    if (!confirmDelete) return;

    await supabase.from("work_logs").delete().eq("id", editingLogId);
    setIsModalOpen(false);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 animate-fade-in">
      
      {/* Top Header & Dynamic Total Metrics Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900/20 border border-gray-800 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Shifts Calendar</h1>
          <p className="text-xs text-gray-400 mt-1">Click calendar cells to manage schedules and logs.</p>
        </div>
        
        {/* Dynamic Top Overview Badges */}
        <div className="flex items-center gap-4">
          <div className="bg-gray-950 border border-gray-800/80 rounded-xl px-4 py-2.5 min-w-[140px]">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Month Revenue</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">¥{monthlyMetrics.earnings}</p>
          </div>
          <div className="bg-gray-950 border border-gray-800/80 rounded-xl px-4 py-2.5 min-w-[120px]">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Month Hours</p>
            <p className="text-xl font-black text-blue-400 font-mono mt-0.5">{monthlyMetrics.hours}h</p>
          </div>
        </div>
      </div>

      {/* Main shadcn Calendar Interactive Dashboard */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 backdrop-blur-md shadow-xl flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth} // Listens to arrow pagination updates to sync dynamic stats!
          className="w-full bg-transparent text-white"
          classNames={{
            months: "w-full space-y-4",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-base font-black text-gray-100 tracking-wide uppercase",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-gray-950 border border-gray-800 rounded-lg p-0 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "grid grid-cols-7 w-full text-center font-bold text-gray-500 text-xs mb-3 uppercase tracking-wider",
            head_cell: "w-full",
            row: "grid grid-cols-7 w-full mt-2 gap-1.5",
            cell: "w-full text-center relative p-0 focus-within:relative focus-within:z-20 min-h-[90px] border border-gray-800/40 rounded-xl overflow-hidden bg-gray-950/40 hover:bg-gray-900/50 transition-colors",
            day: "h-full w-full p-2.5 flex flex-col justify-between items-start font-normal text-gray-400 aria-selected:opacity-100 min-h-[90px]",
            day_selected: "bg-blue-600/10 border-2 border-blue-500 text-white font-semibold",
            day_today: "bg-gray-900 text-white border border-gray-700",
            day_outside: "opacity-10 text-gray-700 pointer-events-none bg-transparent border-none",
          }}
          components={{
            DayRender: ({ date, ...props }) => {
              const formattedString = date.toLocaleDateString("sv-SE");
              const matchingLog = logs.find((l) => l.work_date === formattedString);

              return (
                <div className="w-full h-full flex flex-col justify-between items-start text-left group-hover:scale-[1.02] transition-transform">
                  <span className="text-xs font-bold text-gray-500 tracking-mono">{date.getDate()}</span>
                  
                  {matchingLog && (
                    <div className="w-full mt-1.5 bg-gray-900/80 border border-gray-800/50 p-1.5 rounded-lg space-y-0.5 shadow-inner">
                      {/* Name / Location Text */}
                      <p className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-wide">
                        {matchingLog.jobs?.shop_name || "Shift"}
                      </p>
                      {/* Dynamic Calculated Amount */}
                      <p className="text-[11px] font-black text-emerald-400 font-mono tracking-wide">
                        ¥{calculateLogEarnings(matchingLog).toLocaleString()}
                      </p>
                      {/* Hours Summary and night indicator */}
                      <p className="text-[9px] font-medium font-mono text-gray-500 flex items-center justify-between">
                        <span>{matchingLog.hours_worked.toFixed(2)}h</span>
                        {matchingLog.night_hours > 0 && <span className="text-purple-400 text-[10px]">🌙</span>}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
          }}
        />
      </div>

      {/* Pop-up Scheduler Form Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-gray-950 border border-gray-800 text-white rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-wide">
              {editingLogId ? "Modify Shift Entry" : "Record New Time Card"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Target Date: <span className="text-blue-400 font-mono font-bold">{selectedDate?.toLocaleDateString("en-US", { dateStyle: "long" })}</span>
            </DialogDescription>
          </DialogHeader>

          {jobs.length === 0 ? (
            <p className="text-xs text-red-400 py-4">Register a profile on the Workplaces configuration page first.</p>
          ) : (
            <div className="space-y-4 py-3">
              {/* Workplace Selection Dropdown Input */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Workplace</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger className="w-full bg-gray-900 border-gray-800 text-sm text-white rounded-xl focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white rounded-xl">
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id} className="focus:bg-gray-800 focus:text-white text-xs">
                        {job.shop_name} (¥{job.hourly_rate}/h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clock Ranges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Clock In</Label>
                  <Input
                    type="time"
                    value={clockIn}
                    onChange={(e) => setClockIn(e.target.value)}
                    className="bg-gray-900 border-gray-800 text-white rounded-xl focus:ring-1 focus:ring-blue-500 text-sm h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Clock Out</Label>
                  <Input
                    type="time"
                    value={clockOut}
                    onChange={(e) => setClockOut(e.target.value)}
                    className="bg-gray-900 border-gray-800 text-white rounded-xl focus:ring-1 focus:ring-blue-500 text-sm h-10"
                  />
                </div>
              </div>

              {/* Break Inputs */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Deducted Break (Minutes)</Label>
                <Input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  placeholder="30"
                  className="bg-gray-900 border-gray-800 text-white rounded-xl focus:ring-1 focus:ring-blue-500 text-sm h-10 font-mono"
                />
              </div>

              {/* Instant Telemetry Summary Card */}
              <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Net Work Duration:</span>
                  <span className="font-bold text-white font-mono bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                    {shiftBreakdown.formattedTime} <span className="text-gray-500 text-[10px]">({shiftBreakdown.totalHours}h)</span>
                  </span>
                </div>
                {Number(shiftBreakdown.totalHours) > 0 && (
                  <>
                    <div className="pt-1.5 border-t border-gray-800/80 grid grid-cols-2 text-[10px] font-mono text-gray-500">
                      <span>☀️ Day: {shiftBreakdown.standardHours.toFixed(2)}h</span>
                      <span className="text-right">🌙 Night: {shiftBreakdown.nightHours.toFixed(2)}h</span>
                    </div>
                    <div className="pt-2 border-t border-gray-800/80 flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-400">Estimated Shift Earnings:</span>
                      <span className="text-emerald-400 text-sm font-mono">¥{shiftBreakdown.estimatedPay.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2 mt-2 w-full pt-2 border-t border-gray-900">
            {editingLogId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteShift}
                className="bg-red-950/40 border border-red-900/40 hover:bg-red-900 text-red-400 hover:text-white rounded-xl text-xs h-9"
              >
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={saving || !clockIn || !clockOut || jobs.length === 0}
                onClick={handleSaveShift}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs h-9 px-4 font-bold"
              >
                {saving ? "Saving..." : editingLogId ? "Save Changes" : "Commit Shift"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}