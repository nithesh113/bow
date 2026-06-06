"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#030712] font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Decorative Grid and Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/0 blur-[160px] will-change-transform" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-emerald-500/15 to-blue-500/0 blur-[160px] will-change-transform" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-5">

          {/* LEFT SIDE - Features Branding Panel */}
          <div className="relative hidden lg:flex flex-col justify-between p-12 lg:col-span-2 bg-gradient-to-b from-gray-900/50 to-gray-950/50 border-r border-gray-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#3b82f605,transparent_45%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
                  BOW SYSTEM
                </span>
              </div>

              <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
                Welcome
                <span className="block mt-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  Back
                </span>
              </h1>

              <p className="mt-4 text-gray-400 text-base leading-relaxed">
                Continue tracking your work hours, optimizing automated limits, and hitting your metrics effortlessly.
              </p>
            </div>

            {/* Feature Checklist Recap */}
            <div className="relative space-y-5 mt-12">
              {[
                { icon: "📊", title: "Monitor Weekly Shifts", desc: "Check current totals at a glance" },
                { icon: "💴", title: "Automated Wages", desc: "Real-time updates to expected payouts" },
                { icon: "🌙", title: "Night Premium Math", desc: "Correct multipliers for late shifts" },
                { icon: "🎯", title: "Legal 28h Safety Net", desc: "Ensuring you stay fully safe & legal" }
              ].map((item, idx) => (
                <div key={idx} className="group flex items-start gap-4 p-3 rounded-2xl border border-transparent hover:border-gray-800 hover:bg-gray-950/40 transition-all duration-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-lg group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">{item.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative text-xs text-gray-500 pt-6 border-t border-gray-800/60">
              © {new Date().getFullYear()} Budget On Work. All rights reserved.
            </div>
          </div>

          {/* RIGHT SIDE - Clean Form Panel */}
          <div className="p-8 sm:p-12 lg:col-span-3 flex flex-col justify-center bg-gray-900/10">
            <div className="mx-auto w-full max-w-md">

              <div className="lg:hidden mb-6 flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  BOW
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Access your dashboard and manage your workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 text-sm text-white placeholder-gray-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 animate-fade-in">
                    <span className="text-sm">⚠️</span>
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group mt-2 h-12 w-full overflow-hidden rounded-xl bg-blue-600 font-semibold text-sm text-white transition-all duration-300 hover:bg-blue-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </button>

                {/* Footer redirection link */}
                <p className="text-center text-xs text-gray-400 mt-4">
                  Don't have an account yet?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-400 transition hover:text-blue-300 underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}