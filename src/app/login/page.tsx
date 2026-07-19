"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "login", email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03000a] px-4 font-sans relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Glow Mesh */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-purple-700/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-700/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <Card className="w-full max-w-md p-8 bg-slate-950/40 border border-purple-950/30 backdrop-blur-xl rounded-3xl shadow-2xl relative z-10">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to home
          </a>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome back</h1>
          <p className="text-xs text-slate-400 font-medium">Sign in to your clikurl account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 bg-purple-950/10 border-purple-950/35 text-slate-100 placeholder-slate-600 focus:border-purple-500/80 focus:bg-purple-950/20 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 bg-purple-950/10 border-purple-950/35 text-slate-100 placeholder-slate-600 focus:border-purple-500/80 focus:bg-purple-950/20 rounded-xl"
            />
          </div>

          {error && (
            <p className={cn("text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 font-medium")}>
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/15 hover:shadow-purple-600/25 transition-all cursor-pointer border border-purple-500/20">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-8 font-medium">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2">
            Create one
          </a>
        </p>
      </Card>
    </div>
  );
}
