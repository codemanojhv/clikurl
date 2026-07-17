"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function TextSharingDashboard() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    const code = "txt-" + Math.random().toString(36).substring(2, 7);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `${window.location.origin}/txt/${code}`,
          customAlias: code,
          textContent: content.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to share snippet");
      }

      setResult(data.shortUrl);
    } catch (err: any) {
      setError(err.message || "Failed to share snippet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Share Text</h1>
        <p className="text-xs text-slate-400 mt-1">Paste code, notes, or snippets and share them instantly via short links.</p>
      </div>

      <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-5">
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Snippet Content</label>
            <textarea
              placeholder="Paste raw text, logs, or code snippets here..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/10 cursor-pointer"
          >
            {loading ? "Generating link..." : "Share Snippet"}
          </button>
        </form>

        {result && (
          <div className="pt-4 border-t border-slate-100 space-y-2 animate-fade-up">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Snippet Link Generated</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 bg-slate-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert("Copied snippet link!");
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
