"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSelectTier = async (tierName: string, targetHref: string) => {
    const normTier = tierName.toLowerCase();
    if (user) {
      if (user.tier === normTier) {
        window.location.href = "/dashboard";
        return;
      }
      setUpgradingTier(normTier);
      try {
        const res = await fetch("/api/me/tier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: normTier }),
        });
        if (res.ok) {
          window.location.href = "/dashboard?upgrade=success&plan=" + normTier;
        } else {
          const data = await res.json();
          alert(data.error || "Failed to update subscription");
        }
      } catch {
        alert("Something went wrong. Please try again.");
      } finally {
        setUpgradingTier(null);
      }
    } else {
      window.location.href = `${targetHref}${targetHref.includes("?") ? "&" : "?"}billing=${billingPeriod}`;
    }
  };

  const getPrice = (baseMonthly: number) => {
    if (baseMonthly === 0) return { val: "$0", period: "forever" };
    if (billingPeriod === "yearly") {
      const discounted = Math.round(baseMonthly * 0.8);
      return { val: `$${discounted}`, period: "mo, billed yearly" };
    }
    return { val: `$${baseMonthly}`, period: "mo" };
  };

  const tiers = [
    {
      name: "Free",
      monthlyPrice: 0,
      description: "Essential URL shortening & analytics.",
      cta: { label: "Get Started", href: "/register" },
      features: [
        "Standard redirects",
        "Up to 100 links total",
        "Basic analytics (24h history)",
        "Complimentary clikurl.vercel.app domain",
        "Community support",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: 9,
      description: "For professionals who need custom branding & deep analytics.",
      cta: { label: "Upgrade to Pro", href: "/register?plan=pro" },
      featured: true,
      features: [
        "Unlimited links & redirects",
        "Custom aliases (branded slugs)",
        "Branded custom domains (e.g. brand.co)",
        "Advanced link analytics (7d history)",
        "Full developer API programmatic access",
        "Email support",
      ],
    },
    {
      name: "Enterprise",
      monthlyPrice: 49,
      description: "Unlimited scale and features for fast-growing companies.",
      cta: { label: "Contact Sales", href: "/register?plan=enterprise" },
      features: [
        "Unlimited custom domains",
        "High-performance global redirect routing",
        "Unlimited analytics click history retention",
        "Single Sign-On (SSO / SAML)",
        "Audit logs & access control API",
        "24/7 Premium dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#03000a] text-slate-100 font-sans relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-700/10 to-indigo-700/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-700/5 to-pink-700/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <header className="sticky top-0 z-50 bg-[#03000a]/80 backdrop-blur-lg border-b border-purple-950/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 text-base font-black text-white hover:opacity-90 transition-opacity tracking-tight">
            <svg className="w-5 h-5 text-purple-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            clikurl
          </a>
          <nav className="flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Features</a>
            <a href="/#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-all">FAQ</a>
            <a href="/pricing" className="text-sm font-semibold text-purple-400 transition-all border-b-2 border-purple-500/50 pb-0.5">Pricing</a>
            <a href="/docs" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Docs</a>
            {user ? (
              <a href="/dashboard" className="text-xs font-bold text-white bg-purple-600/90 hover:bg-purple-600 px-4 py-1.5 rounded-full transition-all border border-purple-500/20 shadow-md shadow-purple-900/10">
                Dashboard
              </a>
            ) : (
              <a href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-all">
                Sign in
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10 py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 tracking-wide">
            TRANSPARENT PRICING
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
            Choose Your Superpower
          </h1>
          <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Create branded short links, track instant analytics, and scale with custom domains. Update or cancel anytime.
          </p>

          {/* Billing Switcher */}
          <div className="pt-6 flex justify-center">
            <div className="bg-purple-950/20 border border-purple-900/30 p-1.5 rounded-2xl flex items-center gap-1.5 w-max">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  billingPeriod === "monthly" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  billingPeriod === "yearly" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Yearly
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto pt-6">
          {tiers.map((tier) => {
            const priceInfo = getPrice(tier.monthlyPrice);
            const isUserCurrent = user && user.tier === tier.name.toLowerCase();
            const isOtherCurrent = user && user.tier !== tier.name.toLowerCase();

            return (
              <Card
                key={tier.name}
                className={cn(
                  "relative flex flex-col p-8 transition-all duration-300 rounded-3xl border bg-slate-950/40 backdrop-blur-md",
                  tier.featured
                    ? "border-purple-600/60 shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)] scale-[1.02] md:scale-105 z-10"
                    : "border-purple-950/40 hover:border-purple-900/40 hover:shadow-lg"
                )}
              >
                {tier.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-lg shadow-purple-600/20">
                    Most Popular
                  </span>
                )}

                <h2 className="text-lg font-black text-white tracking-tight">{tier.name}</h2>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-white tracking-tight">{priceInfo.val}</span>
                  <span className="text-xs font-semibold text-slate-500">/{priceInfo.period}</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed font-medium">{tier.description}</p>

                <ul className="mt-8 space-y-4 flex-1 border-t border-purple-950/20 pt-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-xs text-slate-300 leading-normal font-medium">
                      <svg className={cn("w-4 h-4 shrink-0", tier.featured ? "text-purple-400" : "text-slate-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tier.name, tier.cta.href)}
                  disabled={upgradingTier !== null}
                  className={cn(
                    "mt-8 w-full inline-flex items-center justify-center rounded-2xl text-xs font-extrabold transition-all h-12 cursor-pointer border",
                    isUserCurrent
                      ? "bg-purple-950/40 border-purple-500/30 text-purple-300 cursor-default"
                      : tier.featured
                      ? "bg-purple-600 text-white border-purple-500 hover:bg-purple-500 shadow-md shadow-purple-600/10 hover:shadow-purple-600/20"
                      : "border-purple-950/80 bg-purple-950/10 text-slate-300 hover:bg-purple-950/30 hover:text-white hover:border-purple-900/50"
                  )}
                >
                  {upgradingTier === tier.name.toLowerCase() ? (
                    "Upgrading..."
                  ) : isUserCurrent ? (
                    "Your Active Plan"
                  ) : (
                    tier.cta.label
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-purple-950/20 py-12 text-center relative z-10 bg-slate-950/25 mt-20">
        <p className="text-xs text-slate-500 font-medium">© 2026 clikurl. Powered by Supabase & Drizzle. All rights reserved.</p>
      </footer>
    </div>
  );
}
