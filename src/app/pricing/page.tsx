"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Basic shortening for casual use.",
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
    description: "For professionals who need more control.",
    cta: { label: "Start free trial", href: "/register?plan=pro" },
    featured: true,
    features: [
      "Unlimited links",
      "Custom aliases",
      "API access",
      "Click analytics",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    description: "For teams scaling their link infrastructure.",
    cta: { label: "Contact sales", href: "/register?plan=enterprise" },
    features: [
      "Everything in Pro",
      "Team accounts",
      "Dedicated support",
      "Custom domain",
      "SSO / SAML",
      "Audit logs",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col p-8 transition-all duration-200",
                tier.featured
                  ? "ring-2 ring-slate-900 shadow-md scale-[1.02] md:scale-105"
                  : "hover:shadow-md hover:-translate-y-1"
              )}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}

              <h2 className="text-lg font-semibold text-slate-900">{tier.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                <span className="text-sm text-slate-500">/{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{tier.description}</p>

              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 mt-0.5 text-slate-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={tier.cta.href}
                className={cn(
                  "mt-8 w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2",
                  tier.featured
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                )}
              >
                {tier.cta.label}
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
