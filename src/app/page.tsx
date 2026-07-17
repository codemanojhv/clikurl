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
    } catch { setAuthUser(null); }
    finally { setAuthLoading(false); }
  };

  useEffect(() => { loadSession(); }, []);

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
    if (!url.trim()) { setError("Please enter a URL"); inputRef.current?.focus(); return; }
    setLoading(true); setError(""); setResult(null);
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
        shortUrl: data.shortUrl, originalUrl: data.originalUrl,
        shortCode: data.shortCode, createdAt: new Date().toISOString(),
      };
      setResult(shortResult);
      setHistory((prev) => [shortResult, ...prev.slice(0, 9)]);
      if (authUser?.email) loadSavedLinks();
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") setError(err.message);
    } finally { setLoading(false); }
  }, [url, customAlias, authUser?.email]);

  const copyToClipboard = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch {}
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateShortUrl(); }
  }, [generateShortUrl]);

  const faqItems = [
    { q: "Is clikurl free?", a: "Yes, completely free. No sign-up required for basic shortening. Optional accounts let you save and manage your links." },
    { q: "Can I use a custom alias?", a: "Absolutely. Pick any alias (2-30 characters, letters, numbers, and hyphens) and if it's available, it's yours." },
    { q: "Do short links expire?", a: "No. Once created, your short link works forever as long as the service is running." },
    { q: "What is the QR code for?", a: "Every short link gets a QR code you can download as PNG or SVG — perfect for print, posters, or sharing offline." },
    { q: "Is there a limit on how many links I can create?", a: "No limits. Use it as much as you need." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white">
      <div className="dot-grid fixed inset-0 pointer-events-none opacity-50" />

      <div className="relative">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              clikurl
            </a>
            <nav className="flex items-center gap-4">
              <a href="#features" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Features</a>
              <a href="#faq" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">FAQ</a>
              {!authLoading && !authUser && (
                <a href="/login" className="text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors">
                  Sign in
                </a>
              )}
              {!authLoading && authUser && (
                <>
                  <a href="/dashboard" className="text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors">Dashboard</a>
                  <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); })}
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Sign out</button>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6">
          <section className="pt-24 pb-12 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Fast, accessible URL shortening
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Short links,{" "}
              <span className="text-slate-300">instantly</span>
            </h1>
            <p className="mt-4 text-base text-slate-400 max-w-md mx-auto">
              Paste any URL, get a clean short link with a QR code. No sign-up, no friction.
            </p>

            <div data-reveal className="mt-10 max-w-lg mx-auto opacity-0">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.04),0px_1px_0px_0px_rgba(25,28,33,0.01),0px_0px_0px_1px_rgba(25,28,33,0.04)] p-6 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="url-input" className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Destination URL
                    </label>
                    <input
                      ref={inputRef}
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/very-long-url..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      className="w-full h-11 px-3.5 rounded-xl border text-sm text-slate-800 placeholder-slate-300 bg-white outline-none transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 disabled:opacity-50"
                      style={{ borderColor: error ? "#fca5a5" : "oklch(0.922 0 0)" }}
                    />
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  </div>

                  <div>
                    <label htmlFor="alias-input" className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Custom alias <span className="text-slate-300 font-normal">(optional)</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 bg-slate-50 text-xs text-slate-400"
                        style={{ borderColor: "oklch(0.922 0 0)" }}>
                        clikurl.vercel.app/
                      </span>
                      <input
                        id="alias-input"
                        type="text"
                        placeholder="my-custom-link"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="flex-1 h-11 px-3.5 rounded-r-xl border text-sm text-slate-800 placeholder-slate-300 bg-white outline-none transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 disabled:opacity-50"
                        style={{ borderColor: "oklch(0.922 0 0)" }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateShortUrl}
                    disabled={loading || !url.trim()}
                    className="w-full h-11 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Shortening...
                      </span>
                    ) : "Shorten URL"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">Free</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">No sign-up</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">QR included</span>
            </div>
          </section>

          {result && (
            <section data-reveal className="pb-16 opacity-0">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.04),0px_1px_0px_0px_rgba(25,28,33,0.01),0px_0px_0px_1px_rgba(25,28,33,0.04)] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your short link</p>
                    <a href={result.shortUrl} className="text-lg font-semibold text-slate-800 hover:text-slate-600 break-all block transition-colors" target="_blank" rel="noopener noreferrer">{result.shortUrl}</a>
                  </div>
                  <button onClick={() => copyToClipboard(result.shortUrl)}
                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Original URL</p>
                  <p className="text-sm text-slate-600 break-all">{result.originalUrl}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <QRCodeSVG value={result.shortUrl} size={160} level="H" bgColor="#ffffff" fgColor="#1e293b" marginSize={2} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium text-slate-800">Scan to share</p>
                      <p className="text-xs text-slate-400">Works with any smartphone camera or QR reader app.</p>
                      <DownloadQRButton url={result.shortUrl} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section id="features" data-reveal className="pb-20 opacity-0">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Built for speed and simplicity</h2>
              <p className="mt-2 text-sm text-slate-400">Everything you need in a link shortener, nothing you don't.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: <LightningIcon />, title: "Instant", desc: "Shorten any URL in one click. No sign-ups, no delays." },
                { icon: <QRCodeIcon />, title: "QR ready", desc: "Every link gets a downloadable QR code. Scan and share." },
                { icon: <LockIcon />, title: "Minimal", desc: "Clean interface. No trackers, no clutter, just links." },
              ].map((f, i) => (
                <div key={i} className="p-5 rounded-xl bg-white border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 mb-3">
                    {f.icon}
                  </div>
                  <p className="font-medium text-slate-800 text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {!authLoading && history.length > 0 && !authUser && (
            <section data-reveal className="pb-16 opacity-0">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent links</h2>
              <div className="space-y-1.5">
                {history.map((item) => (
                  <div key={item.shortCode + item.createdAt} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      <a href={item.shortUrl} className="text-sm font-medium text-slate-700 hover:text-slate-900 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{item.shortUrl}</a>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.originalUrl}</p>
                    </div>
                    <button onClick={() => copyToClipboard(item.shortUrl)} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-50 transition-colors" aria-label="Copy URL">
                      <CopyIcon />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!authLoading && savedLinks.length > 0 && authUser?.email && (
            <section data-reveal className="pb-16 opacity-0">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Saved links</h2>
              <div className="space-y-1.5">
                {savedLinks.map((item) => (
                  <div key={item.code + item.createdAt} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      <a href={`${BASE}/${item.code}`} className="text-sm font-medium text-slate-700 hover:text-slate-900 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{`${BASE}/${item.code}`}</a>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
                    </div>
                    <button onClick={() => copyToClipboard(`${BASE}/${item.code}`)} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-50 transition-colors" aria-label="Copy URL">
                      <CopyIcon />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section data-reveal className="pb-20 opacity-0">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { num: "01", title: "Paste your URL", desc: "Drop any long URL into the input above." },
                { num: "02", title: "Customize (or not)", desc: "Pick a custom alias or let us generate one." },
                { num: "03", title: "Share anywhere", desc: "Copy your short link or download the QR code." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <span className="text-3xl font-light text-slate-200">{step.num}</span>
                  <p className="mt-2 font-medium text-slate-700 text-sm">{step.title}</p>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" data-reveal className="pb-20 opacity-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Frequently asked</h2>
            </div>
            <div className="max-w-lg mx-auto space-y-1.5">
              {faqItems.map((item, i) => (
                <div key={i} className="rounded-xl bg-white border border-slate-100 overflow-hidden transition-all duration-200">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    {item.q}
                    <svg className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {faqOpen === i && (
                    <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed animate-fade-up">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section data-reveal className="pb-24 opacity-0 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-2">Ready to shorten?</h2>
            <p className="text-sm text-slate-400 mb-6">Paste your first URL above. It takes one second.</p>
            <a href="#url-input"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-all">
              Start shortening
            </a>
          </section>
        </main>

        <footer className="border-t border-slate-100 py-6 text-center">
          <p className="text-xs text-slate-400">clikurl.vercel.app · Fast, accessible URL shortening</p>
        </footer>
      </div>
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
      canvas.width = 800; canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "qrcode.png"; a.click(); URL.revokeObjectURL(a.href);
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(data);
  };

  const downloadSVG = () => {
    const svgEl = document.querySelector("[data-qr-svg]") as SVGSVGElement | null;
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "qrcode.svg"; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
        aria-haspopup="true" aria-expanded={open}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Download QR
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl bg-white border border-slate-200 shadow-lg py-1 overflow-hidden">
          <button onClick={() => { downloadPNG(); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">PNG (800×800)</button>
          <button onClick={() => { downloadSVG(); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">SVG</button>
        </div>
      )}
    </div>
  );
}

function LightningIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function QRCodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
