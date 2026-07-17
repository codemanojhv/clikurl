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
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans relative overflow-hidden selection:bg-blue-600/10 selection:text-blue-600">
      {/* Background Soft Blobs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/30 to-indigo-100/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-100" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 text-lg font-extrabold text-blue-600">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            clikurl
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
            <a href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            <a href="/docs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-4">
            {!authLoading && !authUser && (
              <>
                <a href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5">Sign in</a>
                <a href="/register" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4.5 py-2 rounded-xl transition-all shadow-sm shadow-blue-600/10">Sign up</a>
              </>
            )}
            {!authLoading && authUser && (
              <>
                <a href="/dashboard" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Dashboard</a>
                <button
                  onClick={() => fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); })}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Make every connection <span className="text-blue-600">count</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Shorten, customize, and optimize your links with clikurl. Instantly generate QR codes and check real-time click analytics.
          </p>

          {/* Shortener Card */}
          <div className="mt-12 text-left bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="space-y-5">
              <div>
                <label htmlFor="url-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Paste Long URL
                </label>
                <input
                  ref={inputRef}
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/very/long/destination/url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 focus:bg-white disabled:opacity-50"
                  style={{ borderColor: error ? "#ef4444" : undefined }}
                />
                {error && <p className="mt-2 text-xs text-red-500 font-semibold">{error}</p>}
              </div>

              <div>
                <label htmlFor="alias-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Customize Slug <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:bg-white transition-all duration-200">
                  <span className="inline-flex items-center px-4 bg-slate-100 text-xs font-semibold text-slate-500 border-r border-slate-200 select-none">
                    clikurl.vercel.app/
                  </span>
                  <input
                    id="alias-input"
                    type="text"
                    placeholder="my-alias"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="flex-1 h-12 px-4 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={generateShortUrl}
                disabled={loading || !url.trim()}
                className="w-full h-12 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:bg-blue-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
        </section>

        {/* Shorten Result Display */}
        {result && (
          <section className="pb-16 max-w-2xl mx-auto animate-fade-up">
            <div className="bg-white border border-slate-100 shadow-lg rounded-3xl p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Your shortened link</p>
                  <a href={result.shortUrl} className="text-xl font-bold text-slate-900 hover:text-blue-600 break-all block transition-colors" target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(result.shortUrl)}
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination URL</p>
                <p className="text-sm text-slate-500 break-all">{result.originalUrl}</p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <QRCodeSVG data-qr-svg value={result.shortUrl} size={140} level="H" bgColor="#ffffff" fgColor="#1e293b" marginSize={2} />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-sm font-bold text-slate-800">Dynamic QR Code</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Download this high-quality QR code to share offline, in printed media, or on mobile device displays.</p>
                    <DownloadQRButton url={result.shortUrl} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Logos Band */}
        <section className="py-12 border-t border-b border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by developers worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 select-none">
            <span className="font-extrabold text-lg text-slate-800">Trello</span>
            <span className="font-extrabold text-lg text-slate-800">Uber</span>
            <span className="font-extrabold text-lg text-slate-800">MasterCard</span>
            <span className="font-extrabold text-lg text-slate-800">Meta</span>
            <span className="font-extrabold text-lg text-slate-800">Slack</span>
          </div>
        </section>

        {/* Features Spotlight */}
        <section id="features" data-reveal className="py-24 opacity-0 translate-y-3 transition-all duration-500">
          <div className="text-center mb-16 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900">Explore features for more efficiency</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">Manage your URLs with powerful developer integrations and full metric dashboards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <LightningIcon />, title: "Instant Analytics", desc: "Track link performance and referrers in real time with beautiful visual dashboards." },
              { icon: <QRCodeIcon />, title: "Smart QR Codes", desc: "Create scannable code graphics with high resolutions ready for download." },
              { icon: <LockIcon />, title: "Developer API keys", desc: "Build programmatic shortening into your pipelines using secured Bearer API credentials." },
            ].map((f, i) => (
              <div key={i} className="p-6.5 bg-white border border-slate-100 rounded-3xl hover:border-slate-200/80 transition-all duration-300 shadow-sm shadow-slate-100/5 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History / Saved Links list */}
        {!authLoading && history.length > 0 && !authUser && (
          <section className="pb-20 max-w-lg mx-auto animate-fade-up">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Recent shortened links</h2>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.shortCode + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="min-w-0 flex-1">
                    <a href={item.shortUrl} className="text-sm font-bold text-slate-800 hover:text-blue-600 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{item.shortUrl}</a>
                    <p className="text-xs text-slate-400 truncate mt-1 font-mono">{item.originalUrl}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.shortUrl)} className="shrink-0 p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!authLoading && savedLinks.length > 0 && authUser?.email && (
          <section className="pb-20 max-w-lg mx-auto animate-fade-up">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Saved links</h2>
            <div className="space-y-2">
              {savedLinks.map((item) => (
                <div key={item.code + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="min-w-0 flex-1">
                    <a href={`${BASE}/${item.code}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{`${BASE}/${item.code}`}</a>
                    <p className="text-xs text-slate-400 truncate mt-1 font-mono">{item.url}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${BASE}/${item.code}`)} className="shrink-0 p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section data-reveal className="py-20 border-t border-slate-100 opacity-0 translate-y-3 transition-all duration-500">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Hundreds of people already trust us</h2>
            <p className="mt-3 text-slate-500">Simple, robust, and highly reliable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { text: "clikurl has simplified how we distribute QR badges to our offline participants. Setup takes milliseconds and is absolutely free.", author: "Rebecca Foster", role: "Event Manager" },
              { text: "Their developer API is incredibly direct and structured. No fluff, no huge SDK dependencies, just a simple Bearer header.", author: "Dan Torres", role: "Software Engineer" },
            ].map((t, i) => (
              <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm shadow-slate-100/2 flex flex-col justify-between">
                <p className="text-sm text-slate-600 leading-relaxed italic">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600">{t.author[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t.author}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section id="faq" data-reveal className="py-20 border-t border-slate-100 opacity-0 translate-y-3 transition-all duration-500">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Your questions, answered</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-2.5">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {item.q}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${faqOpen === i ? "rotate-180 text-blue-600" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-50/50 pt-4 animate-fade-up">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Card Banner */}
        <section data-reveal className="py-16 text-center opacity-0 translate-y-3 transition-all duration-500">
          <div className="bg-[#0b1329] rounded-3xl p-10 sm:p-14 max-w-4xl mx-auto relative overflow-hidden text-white shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-3xl font-extrabold mb-3">Get closer to your audience and customers today</h2>
            <p className="text-xs text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">Save your shorten history, get API access, and check detailed click statistics on all links.</p>
            <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 transition-all cursor-pointer">
              Get Started
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 text-center bg-white mt-12">
        <p className="text-xs font-semibold text-slate-400">© 2026 clikurl. Powered by Supabase & Drizzle. All rights reserved.</p>
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-2xl py-1 overflow-hidden z-25">
          <button
            onClick={() => { downloadPNG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            PNG (800×800)
          </button>
          <button
            onClick={() => { downloadSVG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
