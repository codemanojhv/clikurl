"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

type ShortResult = {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
};

type SavedLink = {
  code: string;
  url: string;
  createdAt: string;
  clicks: number;
  ownerEmail?: string | null;
};

const BASE = "https://clikurl.vercel.app";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ShortResult[]>([]);
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useScrollReveal();

  const loadSession = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setAuthUser(data.user ?? null);
    } catch {
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const loadSavedLinks = async () => {
    try {
      const response = await fetch("/api/me/links", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setSavedLinks(data.links ?? []);
    } catch {}
  };

  useEffect(() => {
    if (authUser?.email) loadSavedLinks();
    else setSavedLinks([]);
  }, [authUser?.email]);

  const generateShortUrl = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), customAlias: customAlias.trim() || undefined }),
        signal: abortControllerRef.current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to shorten URL");
      const shortResult: ShortResult = {
        shortUrl: data.shortUrl,
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
        createdAt: new Date().toISOString(),
      };
      setResult(shortResult);
      setHistory((prev) => [shortResult, ...prev.slice(0, 9)]);
      if (authUser?.email) loadSavedLinks();
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, customAlias, authUser?.email]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateShortUrl();
    }
  }, [generateShortUrl]);

  const faqItems = [
    { q: "Is clikurl free?", a: "Yes, completely free. No sign-up required for basic shortening. Optional accounts let you save and manage your links." },
    { q: "Can I use a custom alias?", a: "Absolutely. Pick any alias (2-30 characters, letters, numbers, and hyphens) and if it's available, it's yours." },
    { q: "Do short links expire?", a: "No. Once created, your short link works forever as long as the service is running." },
    { q: "What is the QR code for?", a: "Every short link gets a QR code you can download as PNG or SVG — perfect for print, posters, or sharing offline." },
    { q: "Is there a limit on how many links I can create?", a: "No limits. Use it as much as you need." },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-violet-600/10 to-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-[0.03]" />

      <header className="sticky top-0 z-50 bg-[#030712]/85 backdrop-blur-md border-b border-slate-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 text-base font-bold text-white hover:opacity-90 transition-opacity">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            clikurl
          </a>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
            <a href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Docs</a>
            {!authLoading && !authUser && (
              <a href="/login" className="text-sm font-semibold text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-1.5 rounded-lg transition-all">
                Sign in
              </a>
            )}
            {!authLoading && authUser && (
              <>
                <a href="/dashboard" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Dashboard</a>
                <button
                  onClick={() => fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); })}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <section className="pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Fast, secure, & custom URL shortening
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] max-w-2xl mx-auto">
            Short links, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">engineered for scale</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Create clean short links, generate beautiful QR codes, and track detailed analytics instantly. No signup required.
          </p>

          <div data-reveal className="mt-12 max-w-lg mx-auto opacity-0 translate-y-4 transition-all duration-500">
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] p-6 sm:p-8 text-left">
              <div className="space-y-5">
                <div>
                  <label htmlFor="url-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                    Destination URL
                  </label>
                  <input
                    ref={inputRef}
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/long-destination-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full h-12 px-4 rounded-xl border border-slate-800 bg-slate-950/80 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
                    style={{ borderColor: error ? "#ef4444" : undefined }}
                  />
                  {error && <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>}
                </div>

                <div>
                  <label htmlFor="alias-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                    Custom alias <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-200">
                    <span className="inline-flex items-center px-4 bg-slate-900 text-xs font-medium text-slate-500 border-r border-slate-800 select-none">
                      clikurl.vercel.app/
                    </span>
                    <input
                      id="alias-input"
                      type="text"
                      placeholder="custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      className="flex-1 h-12 px-4 bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  onClick={generateShortUrl}
                  disabled={loading || !url.trim()}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Shortening...
                    </>
                  ) : "Shorten URL"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Always Free
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              No Registration
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              HQ QR Code
            </span>
          </div>
        </section>

        {result && (
          <section data-reveal className="pb-20 opacity-0 translate-y-4 transition-all duration-500">
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Your short link</p>
                  <a href={result.shortUrl} className="text-xl font-bold text-white hover:text-indigo-400 break-all block transition-colors" target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(result.shortUrl)}
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:text-white transition-all cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original URL</p>
                <p className="text-sm text-slate-300 break-all bg-slate-950/50 border border-slate-800/40 px-3 py-2 rounded-lg font-mono text-xs">{result.originalUrl}</p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-800/60">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <QRCodeSVG data-qr-svg value={result.shortUrl} size={150} level="H" bgColor="#ffffff" fgColor="#030712" marginSize={2} />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-sm font-semibold text-white">Scan and Share</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Download this high-resolution QR code to share your link across print, screens, or offline materials.</p>
                    <DownloadQRButton url={result.shortUrl} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="features" data-reveal className="pb-24 opacity-0 translate-y-4 transition-all duration-500">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Built for speed, styled for developers</h2>
            <p className="mt-3 text-slate-400 max-w-md mx-auto">Everything you need from a link infrastructure platform, without the bloat.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <LightningIcon />, title: "Instant Shortening", desc: "Shorten links in milliseconds. Optimized endpoints with edge routing." },
              { icon: <QRCodeIcon />, title: "Dynamic QR Codes", desc: "Instantly download high-quality QR codes in PNG or vector formats." },
              { icon: <LockIcon />, title: "Secure & Private", desc: "SHA-256 hashed API keys. Clean code, no trackers, strict cookie security." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {!authLoading && history.length > 0 && !authUser && (
          <section data-reveal className="pb-20 max-w-lg mx-auto opacity-0 translate-y-4 transition-all duration-500">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Recent links</h2>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.shortCode + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800 hover:border-slate-700/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <a href={item.shortUrl} className="text-sm font-bold text-white hover:text-indigo-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{item.shortUrl}</a>
                    <p className="text-xs text-slate-505 truncate mt-1 font-mono">{item.originalUrl}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.shortUrl)} className="shrink-0 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!authLoading && savedLinks.length > 0 && authUser?.email && (
          <section data-reveal className="pb-20 max-w-lg mx-auto opacity-0 translate-y-4 transition-all duration-500">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Saved links</h2>
            <div className="space-y-2">
              {savedLinks.map((item) => (
                <div key={item.code + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800 hover:border-slate-700/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <a href={`${BASE}/${item.code}`} className="text-sm font-bold text-white hover:text-indigo-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{`${BASE}/${item.code}`}</a>
                    <p className="text-xs text-slate-500 truncate mt-1 font-mono">{item.url}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${BASE}/${item.code}`)} className="shrink-0 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section data-reveal className="pb-24 border-t border-slate-900 pt-20 opacity-0 translate-y-4 transition-all duration-500">
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "01", title: "Drop URL", desc: "Paste your raw link or destination endpoint above." },
              { num: "02", title: "Set Alias", desc: "Choose a custom brand slug or generate a random token." },
              { num: "03", title: "Distribute", desc: "Copy the shortened URL or export the dynamic QR badge." },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <span className="text-4xl font-extrabold bg-gradient-to-b from-indigo-500 to-transparent bg-clip-text text-transparent opacity-85 group-hover:opacity-100 transition-opacity">{step.num}</span>
                <h4 className="mt-3 font-bold text-white text-sm">{step.title}</h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" data-reveal className="pb-24 border-t border-slate-900 pt-20 opacity-0 translate-y-4 transition-all duration-500">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Frequently asked</h2>
            <p className="mt-3 text-slate-400">Common questions about the clikurl service.</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-2.5">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-xl bg-slate-900/20 border border-slate-800 overflow-hidden transition-all duration-300 hover:border-slate-700/60">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  {item.q}
                  <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${faqOpen === i ? "rotate-180 text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/40 pt-4 animate-fade-up">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section data-reveal className="pb-28 text-center opacity-0 translate-y-4 transition-all duration-500">
          <div className="bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/25 rounded-3xl p-10 sm:p-14 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-3xl font-extrabold text-white mb-3">Upgrade your link setup</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">Save your shorten history, get API access, and check detailed click statistics on all links.</p>
            <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/30 transition-all cursor-pointer">
              Get Started for Free
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-10 text-center relative z-10 bg-slate-950/40">
        <p className="text-xs text-slate-500">© 2026 clikurl. Powered by Supabase & Drizzle. All rights reserved.</p>
      </footer>
    </div>
  );
}

function DownloadQRButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  const downloadPNG = () => {
    const svgEl = document.querySelector("[data-qr-svg]") as SVGSVGElement | null;
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "qrcode.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(data);
  };

  const downloadSVG = () => {
    const svgEl = document.querySelector("[data-qr-svg]") as SVGSVGElement | null;
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/65 hover:text-white transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 overflow-hidden z-25">
          <button
            onClick={() => { downloadPNG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            PNG (800×800)
          </button>
          <button
            onClick={() => { downloadSVG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Vector SVG
          </button>
        </div>
      )}
    </div>
  );
}

function LightningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function QRCodeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="14" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="18" y="14" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="14" y="18" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="18" y="18" width="3" height="3" rx="0.5" strokeWidth={2} />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
