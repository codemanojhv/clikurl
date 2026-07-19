"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { gsap } from "gsap";

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
  
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
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

  // GSAP Entrance & Mouse Spotlight Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.8, delay: 0.1 })
        .from(".hero-title-text", { y: 30, opacity: 0, duration: 1, stagger: 0.15 }, "-=0.6")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(cardRef.current, { y: 40, opacity: 0, duration: 1, scale: 0.98 }, "-=0.5")
        .from(".metric-item", { y: 25, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.6");

      // Number counter animations
      gsap.to(".counter-val-1", {
        innerText: 1250000,
        duration: 2.5,
        snap: { innerText: 1 },
        ease: "power2.out",
        onUpdate: function() {
          const el = document.querySelector(".counter-val-1");
          if (el) el.textContent = parseInt(el.textContent || "0").toLocaleString() + "+";
        }
      });
    }, heroRef);

    // Mouse Follower Ambient Light
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: e.clientX - 250,
          y: e.clientY - 250,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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
      setError("Please enter a valid URL");
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
      
      // Animate result entrance with GSAP
      setTimeout(() => {
        gsap.fromTo(".result-card-anim", 
          { y: 30, opacity: 0, scale: 0.96 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" }
        );
      }, 50);

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
    { q: "What makes clikurl different from legacy shorteners?", a: "clikurl is built for speed and precision. Powered by edge infrastructure, custom CNAME domain routing, real-time analytics, and developer Bearer APIs." },
    { q: "Is clikurl free to use?", a: "Yes. Basic link shortening, instant QR code generation, and 24h click analytics are completely free forever without registration." },
    { q: "Can I use my own custom domain?", a: "Yes! Pro and Enterprise accounts can map custom branded domains (e.g. go.brand.com) with automatic CNAME verification." },
    { q: "Do short links ever expire?", a: "By default, links never expire. However, you can configure custom expiration timestamps or maximum click caps." },
    { q: "How does the developer API work?", a: "You can generate SHA-256 hashed API keys in your dashboard and shorten URLs programmatically via standard POST requests." },
  ];

  return (
    <div ref={heroRef} className="min-h-screen bg-[#03000a] text-slate-100 font-sans relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic Cursor Spotlight Ambient Glow */}
      <div 
        ref={spotlightRef} 
        className="fixed w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0"
        style={{ top: 0, left: 0 }}
      />

      {/* Aurora Mesh Background */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-purple-600/15 via-indigo-900/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-aurora z-0" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Floating Glassmorphic Header */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <div className="bg-[#090317]/70 backdrop-blur-xl border border-purple-500/20 rounded-full px-6 h-14 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <a href="/" className="flex items-center gap-2.5 text-sm font-black text-white hover:opacity-90 transition-opacity tracking-tight">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-600/30">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
            </div>
            clikurl
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-xs font-semibold text-slate-400 hover:text-white transition-all">Features</a>
            <a href="#metrics" className="text-xs font-semibold text-slate-400 hover:text-white transition-all">Metrics</a>
            <a href="#faq" className="text-xs font-semibold text-slate-400 hover:text-white transition-all">FAQ</a>
            <a href="/pricing" className="text-xs font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
            <a href="/docs" className="text-xs font-semibold text-slate-400 hover:text-white transition-all">Docs</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!authLoading && !authUser && (
              <>
                <a href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5">Sign in</a>
                <a href="/register" className="text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 rounded-full transition-all border border-purple-400/30 shadow-lg shadow-purple-600/20 glow-btn">
                  Get Started
                </a>
              </>
            )}
            {!authLoading && authUser && (
              <>
                <a href="/dashboard" className="text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 rounded-full transition-all border border-purple-400/30 shadow-lg shadow-purple-600/20 glow-btn">
                  Dashboard
                </a>
                <button
                  onClick={() => fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); })}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
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

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 border border-purple-950/40 bg-[#090317]/95 backdrop-blur-2xl rounded-2xl px-6 py-5 space-y-4 shadow-2xl animate-fade-up">
            <nav className="flex flex-col gap-3.5">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300 hover:text-white">Features</a>
              <a href="#metrics" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300 hover:text-white">Metrics</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300 hover:text-white">FAQ</a>
              <a href="/pricing" className="text-xs font-semibold text-slate-300 hover:text-white">Pricing</a>
              <a href="/docs" className="text-xs font-semibold text-slate-300 hover:text-white">Docs</a>
            </nav>
            <div className="pt-3 border-t border-purple-950/40 flex flex-col gap-2.5">
              {!authLoading && !authUser && (
                <>
                  <a href="/login" className="text-xs font-semibold text-slate-300 text-center py-2">Sign in</a>
                  <a href="/register" className="text-xs font-black text-white bg-purple-600 text-center py-2.5 rounded-full border border-purple-500/30">Get Started</a>
                </>
              )}
              {!authLoading && authUser && (
                <>
                  <a href="/dashboard" className="text-xs font-black text-white bg-purple-600 text-center py-2.5 rounded-full border border-purple-500/30">Dashboard</a>
                  <button
                    onClick={() => {
                      fetch("/api/auth/logout", { method: "POST" }).finally(() => { setAuthUser(null); setSavedLinks([]); setMobileMenuOpen(false); });
                    }}
                    className="text-xs font-semibold text-slate-400 text-center py-2 cursor-pointer"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10 pb-28">
        {/* Hero Section */}
        <section className="pt-20 pb-16 text-center max-w-4xl mx-auto space-y-6">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-300 tracking-wider uppercase shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Next-Gen URL Intelligence & Engine
          </div>

          <h1 ref={titleRef} className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.02]">
            <span className="hero-title-text block">Make Every Link</span>
            <span className="hero-title-text block gradient-shine-text">Unforgettable.</span>
          </h1>

          <p className="hero-desc text-base sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Shorten URLs instantly, create custom domain aliases, generate high-res vector QR codes, and monitor click analytics with ultra-fast latency.
          </p>

          {/* Shortener Card (Awwwards Terminal Window) */}
          <div ref={cardRef} className="mt-12 text-left gradient-border-card rounded-3xl p-6 sm:p-9 max-w-2xl mx-auto relative group">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-purple-950/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest font-mono">
                clikurl-engine v2.0
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="url-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                  Destination URL
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/long/campaign/destination"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full h-13 px-4 rounded-2xl border border-purple-900/40 bg-purple-950/20 text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-purple-950/40 text-sm font-medium focus:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                    style={{ borderColor: error ? "#ef4444" : undefined }}
                  />
                </div>
                {error && <p className="mt-2 text-xs text-rose-400 font-semibold flex items-center gap-1.5">⚠️ {error}</p>}
              </div>

              <div>
                <label htmlFor="alias-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                  Custom Slug <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="flex rounded-2xl overflow-hidden border border-purple-900/40 bg-purple-950/20 focus-within:border-purple-500 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300">
                  <span className="inline-flex items-center px-4 bg-purple-950/50 text-xs font-bold text-purple-400 border-r border-purple-900/40 select-none font-mono">
                    clikurl.app/
                  </span>
                  <input
                    id="alias-input"
                    type="text"
                    placeholder="my-launch"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="flex-1 h-13 px-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none disabled:opacity-50 font-medium"
                  />
                </div>
              </div>

              {/* Advanced Settings collapsible toggler */}
              {authUser && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    {showAdvanced ? "▾ Hide Advanced Settings" : "▸ Advanced Controls (Expiry, Click Limits, Custom Branding)"}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-5 border border-purple-950/50 rounded-2xl bg-purple-950/20 space-y-4 animate-fade-up">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
                            Expiration Date
                          </label>
                          <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-purple-900/40 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
                            Click Limit
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            value={clickLimit}
                            onChange={(e) => setClickLimit(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-purple-900/40 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500 font-medium"
                          />
                        </div>
                      </div>

                      {userDomains.length > 0 && (
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
                            Branded Custom Domain
                          </label>
                          <select
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-purple-900/40 text-xs text-slate-300 bg-slate-950 outline-none focus:border-purple-500 font-medium"
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={generateShortUrl}
                disabled={loading || !url.trim()}
                className="w-full h-13 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/25 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-purple-400/30 glow-btn"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Executing Shortener...
                  </>
                ) : (
                  <>
                    Shorten Link Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Shorten Result Card Display */}
        {result && (
          <section className="pb-16 max-w-2xl mx-auto">
            <div className="result-card-anim gradient-border-card rounded-3xl p-6 sm:p-8 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Short URL Ready
                  </span>
                  <a href={result.shortUrl} className="text-2xl font-black text-white hover:text-purple-400 break-all block transition-colors tracking-tight mt-2" target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(result.shortUrl)}
                  className="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black text-purple-300 border border-purple-500/30 bg-purple-950/40 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-purple-950/50"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-purple-950/40">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Original Destination</p>
                <p className="text-xs text-slate-400 break-all font-mono bg-purple-950/20 p-2.5 rounded-xl border border-purple-950/30">{result.originalUrl}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-purple-950/40">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-2xl shadow-xl shadow-purple-900/10">
                    <QRCodeSVG data-qr-svg value={result.shortUrl} size={130} level="H" bgColor="#ffffff" fgColor="#03000a" marginSize={2} />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <p className="text-xs font-black text-white tracking-wide uppercase font-mono">Vector High-Res QR Graphic</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">Download high-definition PNG or SVG QR codes formatted for print, media kits, or displays.</p>
                    <DownloadQRButton url={result.shortUrl} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Real-time Metric Numbers Band */}
        <section id="metrics" className="py-16 my-8 border-y border-purple-950/30">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="metric-item space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono counter-val-1">1,250,000+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Links Shortened</p>
            </div>
            <div className="metric-item space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-purple-400 tracking-tight font-mono">99.99%</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Uptime SLA</p>
            </div>
            <div className="metric-item space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">&lt; 15ms</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge Redirect Speed</p>
            </div>
            <div className="metric-item space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-indigo-400 tracking-tight font-mono">180+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge Locations</p>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 space-y-16">
          <div className="text-center max-w-md mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300 uppercase tracking-widest font-mono">
              ENGINE FEATURES
            </span>
            <h2 className="text-4xl font-black text-white tracking-tight">Built For High Performance</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">Everything you need to shorten, route, and analyze links at enterprise scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: <LightningIcon />, 
                title: "Edge Redirect Routing", 
                desc: "Sub-millisecond global DNS & Vercel edge routing delivering instant visitor redirections worldwide without latency." 
              },
              { 
                icon: <QRCodeIcon />, 
                title: "Dynamic Vector QR Codes", 
                desc: "High-definition vector graphics rendered in real-time with customizable formats for print and digital displays." 
              },
              { 
                icon: <LockIcon />, 
                title: "Programmatic Bearer APIs", 
                desc: "SHA-256 encrypted API keys allowing seamless integration into your CI/CD, marketing platforms, and internal bots." 
              },
            ].map((f, i) => (
              <div key={i} className="gradient-border-card p-8 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-white text-base tracking-tight">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History / Saved Links list */}
        {!authLoading && history.length > 0 && !authUser && (
          <section className="pb-20 max-w-xl mx-auto">
            <h2 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4 font-mono">Recent shortened links</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.shortCode + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#090317]/60 border border-purple-950/40 hover:border-purple-500/40 transition-all">
                  <div className="min-w-0 flex-1">
                    <a href={item.shortUrl} className="text-sm font-bold text-white hover:text-purple-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{item.shortUrl}</a>
                    <p className="text-[10px] text-slate-500 truncate mt-1 font-mono">{item.originalUrl}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.shortUrl)} className="shrink-0 p-2 rounded-xl hover:bg-purple-950/50 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!authLoading && savedLinks.length > 0 && authUser?.email && (
          <section className="pb-20 max-w-xl mx-auto">
            <h2 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4 font-mono">Saved Account Links</h2>
            <div className="space-y-3">
              {savedLinks.filter(l => !l.isArchived).map((item) => (
                <div key={item.code + item.createdAt} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#090317]/60 border border-purple-950/40 hover:border-purple-500/40 transition-all">
                  <div className="min-w-0 flex-1">
                    <a href={`${BASE}/${item.code}`} className="text-sm font-bold text-white hover:text-purple-400 block truncate transition-colors" target="_blank" rel="noopener noreferrer">{`${BASE}/${item.code}`}</a>
                    <p className="text-[10px] text-slate-500 truncate mt-1 font-mono">{item.url}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${BASE}/${item.code}`)} className="shrink-0 p-2 rounded-xl hover:bg-purple-950/50 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy URL">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Accordion */}
        <section id="faq" className="py-20 border-t border-purple-950/30 space-y-12">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 font-normal">Got questions? We've got answers.</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-2xl bg-[#090317]/50 border border-purple-950/40 overflow-hidden transition-all duration-300 hover:border-purple-800/40">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-200 hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {item.q}
                  <svg className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${faqOpen === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-purple-950/30 pt-4 animate-fade-up font-normal">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Card Banner */}
        <section className="py-16 text-center">
          <div className="gradient-border-card rounded-3xl p-12 sm:p-16 max-w-4xl mx-auto relative overflow-hidden text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
              Ready to Upgrade Your Link Engine?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed font-normal">
              Join thousands of creators and engineering teams shortening and analyzing links daily.
            </p>
            <a href="/pricing" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/25 transition-all cursor-pointer border border-purple-400/30 glow-btn">
              Explore Pricing & Plans
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-950/30 py-12 text-center bg-[#05010e]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 text-xs font-black text-white">
            <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
            </div>
            clikurl
          </a>
          <p className="text-[11px] font-medium text-slate-500">© 2026 clikurl. High performance link shortener. Powered by Supabase & Drizzle.</p>
        </div>
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
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-purple-300 border border-purple-500/30 bg-purple-950/40 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-purple-950/50"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-[#090317] border border-purple-500/30 shadow-2xl py-1.5 overflow-hidden z-25">
          <button
            onClick={() => { downloadPNG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-purple-950/80 hover:text-purple-300 transition-colors cursor-pointer"
          >
            PNG Format (800×800)
          </button>
          <button
            onClick={() => { downloadSVG(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-purple-950/80 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Vector SVG Format
          </button>
        </div>
      )}
    </div>
  );
}

function LightningIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function QRCodeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={2} />
      <rect x="14" y="14" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="18" y="14" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="14" y="18" width="3" height="3" rx="0.5" strokeWidth={2} />
      <rect x="18" y="18" width="3" height="3" rx="0.5" strokeWidth={2} />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
