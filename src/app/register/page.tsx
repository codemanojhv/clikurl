"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
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
        body: JSON.stringify({ mode: "register", email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
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
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Mesh Gradients */}
      <div className="absolute top-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-[0.03]" />

      <Card className="w-full max-w-md p-8 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl relative z-10">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to home
          </a>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-slate-400">Get started with clikurl in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
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
              className="h-11 bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="h-11 bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl"
            />
          </div>

          {error && (
            <p className={cn("text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 font-medium")}>
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all cursor-pointer">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-8">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
}
