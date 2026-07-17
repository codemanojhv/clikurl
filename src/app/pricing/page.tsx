"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Basic URL shortening for personal use.",
    cta: { label: "Get started", href: "/register" },
    features: [
      "Basic URL shortening",
      "100 links per month",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For creators and professionals who need control.",
    cta: { label: "Start free trial", href: "/register?plan=pro" },
    featured: true,
    features: [
      "Unlimited shortened links",
      "Custom aliases (branded links)",
      "Full API programmatic access",
      "Detailed click analytics",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    description: "For scaling teams and infrastructure.",
    cta: { label: "Contact sales", href: "/register?plan=enterprise" },
    features: [
      "Everything in Pro tier",
      "Team / workspace accounts",
      "Dedicated account support",
      "Custom domains & branding",
      "Single Sign-On (SSO / SAML)",
      "Audit logs & access control",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/10 to-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
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
            <a href="/#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="/#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
            <a href="/pricing" className="text-sm font-medium text-white transition-colors">Pricing</a>
            <a href="/docs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Docs</a>
            <a href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6">
            Pricing Plans
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            Simple, developer-friendly pricing
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. Scale your link sharing with zero surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col p-8 transition-all duration-300 rounded-2xl border bg-slate-900/40 backdrop-blur-md",
                tier.featured
                  ? "border-indigo-500/80 shadow-[0_0_40px_-8px_rgba(99,102,241,0.2)] scale-[1.02] md:scale-105"
                  : "border-slate-800 hover:border-slate-700/80 hover:shadow-lg"
              )}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-indigo-600/20">
                  Most popular
                </span>
              )}

              <h2 className="text-xl font-bold text-white">{tier.name}</h2>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                <span className="text-xs font-semibold text-slate-500">/{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{tier.description}</p>

              <ul className="mt-8 space-y-3.5 flex-1 border-t border-slate-800/60 pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300 leading-normal">
                    <svg className={cn("w-4 h-4 mt-0.5 shrink-0", tier.featured ? "text-indigo-400" : "text-slate-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={tier.cta.href}
                className={cn(
                  "mt-8 w-full inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all h-12 cursor-pointer",
                  tier.featured
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                    : "border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                {tier.cta.label}
              </a>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-900 py-10 text-center relative z-10 bg-slate-950/40 mt-12">
        <p className="text-xs text-slate-500">© 2026 clikurl. Powered by Supabase & Drizzle. All rights reserved.</p>
      </footer>
    </div>
  );
}
