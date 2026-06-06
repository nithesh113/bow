"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile({
      ...data,
      email: user.email,
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Account Profile
        </h1>
        <p className="text-sm text-gray-400">
          Manage your personal credentials, identity tags, and system sessions.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="max-w-2xl rounded-2xl border border-gray-800/80 bg-gray-900/20 backdrop-blur-md overflow-hidden">
        
        {/* Banner Section inside the card */}
        <div className="h-20 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border-b border-gray-800/40 p-6 flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-400">
            {profile?.username ? profile.username.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-white">User Identification</h3>
            <p className="text-[11px] text-gray-400">Logged in via Supabase Security</p>
          </div>
        </div>

        {/* Info Rows Content */}
        <div className="p-6 space-y-5">
          
          {/* Username Grid Row */}
          <div className="grid grid-cols-3 py-1 border-b border-gray-800/30 pb-4 items-center">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Username
            </span>
            <span className="col-span-2 text-sm font-medium text-white">
              {profile?.username || "—"}
            </span>
          </div>

          {/* Email Address Grid Row */}
          <div className="grid grid-cols-3 py-1 border-b border-gray-800/30 pb-4 items-center">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Email Address
            </span>
            <span className="col-span-2 text-sm font-medium text-white break-all">
              {profile?.email || "—"}
            </span>
          </div>

          {/* Core App Currency Row */}
          <div className="grid grid-cols-3 py-1 items-center">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Workspace Currency
            </span>
            <span className="col-span-2 text-sm font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-xs font-bold border border-emerald-500/20">
                {profile?.currency || "¥"}
              </span>
              Active Configuration Base
            </span>
          </div>

        </div>

        {/* Action Triggers Footer Panel */}
        <div className="bg-gray-950/20 p-6 border-t border-gray-800/60 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Need to take a break? Securely close your active browser session.
          </p>

          <button
            onClick={logout}
            className="h-10 px-5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-transparent active:scale-[0.99] shadow-lg shadow-red-900/10 shrink-0"
          >
            Logout Session
          </button>
        </div>

      </div>

    </div>
  );
}