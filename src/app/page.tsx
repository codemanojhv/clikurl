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
  isArchived: boolean;
};

type Domain = {
  id: string;
  domainName: string;
  status: string;
};

const BASE = "https://clikurl.vercel.app";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Advanced settings state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [userDomains, setUserDomains] = useState<Domain[]>([]);

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

  const loadUserDomains = async () => {
    try {
      const response = await fetch("/api/me/domains");
      const data = await response.json();
      if (response.ok && data.domains) {
        setUserDomains(data.domains);
      }
    } catch {}
  };

  useEffect(() => {
    if (authUser?.email) {
      loadSavedLinks();
      loadUserDomains();
    } else {
      setSavedLinks([]);
      setUserDomains([]);
    }
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

    const payload: Record<string, any> = {
      url: url.trim(),
      customAlias: customAlias.trim() || undefined,
    };

    if (showAdvanced) {
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      if (clickLimit) payload.clickLimit = parseInt(clickLimit, 10);
      if (customDomain) payload.customDomain = customDomain;
    }

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
  }, [url, customAlias, authUser?.email, showAdvanced, expiresAt, clickLimit, customDomain]);

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
    <div className="min-h-screen bg-[#03000a] text-slate-100 font-sans relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Glow Mesh Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-700/10 to-indigo-700/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-700/5 to-pink-700/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#03000a]/80 backdrop-blur-lg border-b border-purple-950/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 text-base font-black text-white hover:opacity-90 transition-opacity tracking-tight">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            clikurl
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Features</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-all">FAQ</a>
            <a href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Pricing</a>
            <a href="/docs" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Docs</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!authLoading && !authUser && (
              <>
                <a href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5">Sign in</a>
                <a href="/register" className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4.5 py-2 rounded-full transition-all border border-purple-500/20 shadow-md shadow-purple-900/10">Sign up</a>
              </>
            )}
            {!authLoading && authUser && (
              <>
                <a href="/dashboard" className="text-xs font-bold text-white bg-purple-600/90 hover:bg-purple-600 px-4 py-1.5 rounded-full transition-all border border-purple-500/20 shadow-md shadow-purple-900/10">Dashboard</a>
                <button
                  onClick={() => fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); })}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-950/20 bg-[#03000a]/95 backdrop-blur-xl px-6 py-5 space-y-4 animate-fade-up">
            <nav className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Features</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">FAQ</a>
              <a href="/pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
              <a href="/docs" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Docs</a>
            </nav>
            <div className="pt-4 border-t border-purple-950/20 flex flex-col gap-3">
              {!authLoading && !authUser && (
                <>
                  <a href="/login" className="text-sm font-semibold text-slate-400 hover:text-white text-center py-2">Sign in</a>
                  <a href="/register" className="text-xs font-black text-white bg-purple-600 text-center py-2.5 rounded-full border border-purple-500/20">Sign up</a>
                </>
              )}
              {!authLoading && authUser && (
                <>
                  <a href="/dashboard" className="text-xs font-black text-white bg-purple-600 text-center py-2.5 rounded-full border border-purple-500/20">Dashboard</a>
                  <button
                    onClick={() => {
                      fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); setMobileMenuOpen(false); });
                    }}
                    className="text-sm font-semibold text-slate-400 hover:text-white text-center py-2 cursor-pointer"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10 pb-24">
        {/* Hero Section */}
        <section className="pt-24 pb-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 tracking-wide">
            INTRODUCING CLIKURL
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05] bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
            Make every connection count
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
            Shorten, brand, and secure your links with instant redirections. Track engagement metrics and generate vectors QR codes on the fly.
          </p>

          {/* Shortener Card */}
          <div className="mt-12 text-left bg-slate-950/40 border border-purple-950/30 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl pointer-events-none group-hover:opacity-100 transition-opacity opacity-0" />
            <div className="space-y-5 relative z-10">
              <div>
                <label htmlFor="url-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
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
                  className="w-full h-12 px-4 rounded-xl border border-purple-950/35 bg-purple-950/10 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-purple-500/80 focus:bg-purple-950/20 disabled:opacity-50 text-sm font-semibold"
                  style={{ borderColor: error ? "#ef4444" : undefined }}
                />
                {error && <p className="mt-2 text-xs text-red-500 font-semibold">{error}</p>}
              </div>

              <div>
                <label htmlFor="alias-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Customize Slug <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-purple-950/35 bg-purple-950/10 focus-within:border-purple-500/80 focus-within:bg-purple-950/20 transition-all duration-200">
                  <span className="inline-flex items-center px-4 bg-purple-950/30 text-xs font-semibold text-purple-400 border-r border-purple-950/35 select-none">
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
                    className="flex-1 h-12 px-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none disabled:opacity-50 font-semibold"
                  />
                </div>
              </div>

              {/* Advanced Settings collapsible toggler */}
              {authUser && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {showAdvanced ? "▾ Hide Advanced Settings" : "▸ Advanced Settings (Expiry, Limits, Domains)"}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 border border-purple-950/25 rounded-2xl bg-purple-950/5 space-y-4 animate-fade-up">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                            Expiration Date
                          </label>
                          <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-purple-950/35 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500/80 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                            Click Limit
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 100"
                            value={clickLimit}
                            onChange={(e) => setClickLimit(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-purple-950/35 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500/80 font-medium"
                          />
                        </div>
                      </div>

                      {userDomains.length > 0 && (
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                            Short Domain Brand
                          </label>
                          <select
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-purple-950/35 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500/80 font-medium"
                          >
                            <option value="">clikurl.vercel.app (default)</option>
                            {userDomains
                              .filter((dom) => dom.status === "verified")
                              .map((dom) => (
                                <option key={dom.id} value={dom.domainName}>
                                  {dom.domainName}
                                </option>
                              ))}
                          </select>
                          {userDomains.some((dom) => dom.status !== "verified") && (
                            <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                              ⚠️ Some domains are pending. <a href="/dashboard/domains" className="text-purple-400 hover:underline">Verify DNS CNAME</a> in Dashboard.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={generateShortUrl}
                disabled={loading || !url.trim()}
                className="w-full h-12 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/10 hover:shadow-purple-600/20 active:bg-purple-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-purple-500/20"
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
            <div className="bg-slate-950/50 border border-purple-950/30 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Your shortened link</p>
                  <a href={result.shortUrl} className="text-xl font-black text-white hover:text-purple-400 break-all block transition-colors tracking-tight" target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(result.shortUrl)}
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-300 border border-purple-950 bg-purple-950/20 hover:bg-purple-950/40 hover:text-white transition-all cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="mt-5 pt-4 border-t border-purple-950/25">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination URL</p>
                <p className="text-xs text-slate-400 break-all font-mono">{result.originalUrl}</p>
              </div>
              <div className="mt-6 pt-5 border-t border-purple-950/25">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3.5 bg-white rounded-xl">
                    <QRCodeSVG data-qr-svg value={result.shortUrl} size={140} level="H" bgColor="#ffffff" fgColor="#03000a" marginSize={2} />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-200 tracking-wide uppercase">Dynamic QR Code</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Download this vector QR code to share offline, in printed media, or on mobile device displays.</p>
                    <DownloadQRButton url={result.shortUrl} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Logos Band */}
        <section className="py-12 border-t border-b border-purple-950/25 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted by developers worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 select-none">
            <span className="font-extrabold text-lg text-slate-400">Trello</span>
            <span className="font-extrabold text-lg text-slate-400">Uber</span>
            <span className="font-extrabold text-lg text-slate-400">MasterCard</span>
            <span className="font-extrabold text-lg text-slate-400">Meta</span>
            <span className="font-extrabold text-lg text-slate-400">Slack</span>
          </div>
        </section>

        {/* Features Spotlight */}
        <section id="features" className="py-24 space-y-16">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Efficiency Redefined</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Optimize your URLs with programmatic APIs and detailed metric dashboards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <LightningIcon />, title: "Instant Analytics", desc: "Track link performance and referrers in real time with beautiful visual dashboards." },
              { icon: <QRCodeIcon />, title: "Smart QR Codes", desc: "Create scannable code graphics with high resolutions ready for download." },
              { icon: <LockIcon />, title: "Developer API keys", desc: "Build programmatic shortening into your pipelines using secured Bearer API credentials." },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-slate-950/30 border border-purple-950/30 rounded-3xl hover:border-purple-900/40 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-900/30 flex items-center justify-center text-purple-400 mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-200 text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History / Saved Links list */}
        {!authLoading && history.length > 0 && !authUser && (
          <section className="pb-20 max-w-lg mx-auto animate-fade-up">
            <h2 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">Recent shortened links</h2>
            <div className="space-y-2.5">
              {history.map((item) => (
                <div key={item.shortCode + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/40 border border-purple-950/30 hover:border-purple-900/40 transition-all">
                  <div className="min-w-0 flex-1">
                    <a href={item.shortUrl} className="text-sm font-bold text-white hover:text-purple-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{item.shortUrl}</a>
                    <p className="text-[10px] text-slate-500 truncate mt-1 font-mono">{item.originalUrl}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.shortUrl)} className="shrink-0 p-2 rounded-lg hover:bg-purple-950/30 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!authLoading && savedLinks.length > 0 && authUser?.email && (
          <section className="pb-20 max-w-lg mx-auto animate-fade-up">
            <h2 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">Saved links</h2>
            <div className="space-y-2.5">
              {savedLinks.filter(l => !l.isArchived).map((item) => (
                <div key={item.code + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/40 border border-purple-950/30 hover:border-purple-900/40 transition-all">
                  <div className="min-w-0 flex-1">
                    <a href={`${BASE}/${item.code}`} className="text-sm font-bold text-white hover:text-purple-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{`${BASE}/${item.code}`}</a>
                    <p className="text-[10px] text-slate-500 truncate mt-1 font-mono">{item.url}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${BASE}/${item.code}`)} className="shrink-0 p-2 rounded-lg hover:bg-purple-950/30 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-20 border-t border-purple-950/20">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Trusted Worldwide</h2>
            <p className="text-xs text-slate-400 font-medium">Simple, robust, and highly reliable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { text: "clikurl has simplified how we distribute QR badges to our offline participants. Setup takes milliseconds and is absolutely free.", author: "Rebecca Foster", role: "Event Manager" },
              { text: "Their developer API is incredibly direct and structured. No fluff, no huge SDK dependencies, just a simple Bearer header.", author: "Dan Torres", role: "Software Engineer" },
            ].map((t, i) => (
              <div key={i} className="p-8 bg-slate-950/30 border border-purple-950/30 rounded-3xl shadow-sm flex flex-col justify-between hover:border-purple-900/30 transition-all">
                <p className="text-xs text-slate-300 leading-relaxed italic">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/25 flex items-center justify-center font-bold text-xs text-purple-400">{t.author[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.author}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section id="faq" className="py-20 border-t border-purple-950/20 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tight">Your questions, answered</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-2xl bg-slate-950/30 border border-purple-950/30 overflow-hidden transition-all duration-300 hover:border-purple-900/30">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-300 hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {item.q}
                  <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${faqOpen === i ? "rotate-180 text-purple-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-purple-950/20 pt-4 animate-fade-up font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Card Banner */}
        <section className="py-16 text-center">
          <div className="bg-gradient-to-br from-[#0c051a] to-[#03000a] border border-purple-950/35 rounded-3xl p-10 sm:p-14 max-w-4xl mx-auto relative overflow-hidden text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-3xl font-black mb-3 tracking-tight">Scale your link performance today</h2>
            <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed font-medium">Save your shortening history, get Bearer API keys, and map custom domain names.</p>
            <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black tracking-wide uppercase text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/10 hover:shadow-purple-600/20 transition-all cursor-pointer border border-purple-500/20">
              Get Started
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-950/20 py-12 text-center bg-slate-950/25">
        <p className="text-xs font-semibold text-slate-500">© 2026 clikurl. Powered by Supabase & Drizzle. All rights reserved.</p>
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
    // Safe Unicode Base64 encoding
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-300 border border-purple-950 bg-purple-950/20 hover:bg-purple-950/40 hover:text-white transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-slate-950 border border-purple-950/80 shadow-2xl py-1 overflow-hidden z-25">
          <button
            onClick={() => { downloadPNG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:bg-purple-950/50 hover:text-white transition-colors cursor-pointer"
          >
            PNG (800×800)
          </button>
          <button
            onClick={() => { downloadSVG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:bg-purple-950/50 hover:text-white transition-colors cursor-pointer"
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
    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
