"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  {
    id: "authentication",
    title: "Authentication",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          The clikurl API uses Bearer token authentication. Retrieve or generate your API key inside your dashboard, and include it in the
          <code className="mx-1 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-indigo-400">Authorization</code>
          header:
        </p>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`fetch("https://clikurl.vercel.app/api/shorten", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-api-key>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ url: "https://example.com" })
})`}
        </pre>
        <p className="text-slate-300 text-sm">
          Manage your active API tokens directly on the{" "}
          <a href="/dashboard/keys" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors underline underline-offset-2">keys dashboard</a>.
        </p>
      </div>
    ),
  },
  {
    id: "shorten",
    title: "Create a short link",
    endpoint: "POST /api/shorten",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Shorten any destination URL. Optionally provide a custom alias (must be 2-30 characters, lowercase letters, numbers, and hyphens).
        </p>

        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Request Payload</h4>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`fetch("https://clikurl.vercel.app/api/shorten", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <api-key>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://example.com/very/long/url",
    customAlias: "my-link" // optional
  })
})`}
        </pre>

        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Response Output</h4>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`{
  "shortUrl": "https://clikurl.vercel.app/my-link",
  "originalUrl": "https://example.com/very/long/url",
  "shortCode": "my-link",
  "createdAt": "2026-07-17T12:00:00.000Z"
}`}
        </pre>
      </div>
    ),
  },
  {
    id: "redirect",
    title: "Follow a short link",
    endpoint: "GET /[code]",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Accessing a shortened link redirects to the original destination URL. No authorization header is required.
        </p>

        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Request Example</h4>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`// Navigate direct to: https://clikurl.vercel.app/my-link
// Returns a 302 redirect location header.

// Programmatic check:
const res = await fetch("https://clikurl.vercel.app/my-link", {
  redirect: "manual"
});
// res.status === 302
// res.headers.get("Location") === "https://example.com/very/long/url"`}
        </pre>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Get analytics",
    endpoint: "GET /api/analytics?code={code}",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Retrieve click count and detailed history for a shortened link.
        </p>

        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Request Example</h4>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`fetch("https://clikurl.vercel.app/api/analytics?code=my-link", {
  headers: {
    "Authorization": "Bearer <api-key>"
  }
})`}
        </pre>

        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Response Output</h4>
        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`{
  "code": "my-link",
  "url": "https://example.com",
  "clicks": 42,
  "clickHistory": [
    {
      "ip": "203.0.113.1",
      "userAgent": "Mozilla/5.0 ...",
      "referrer": "https://twitter.com",
      "country": "US",
      "device": "desktop",
      "timestamp": "2026-07-17T12:00:00.000Z"
    }
  ]
}`}
        </pre>
      </div>
    ),
  },
  {
    id: "errors",
    title: "Error handling",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          Standard HTTP error status codes returned by the API endpoints:
        </p>

        <pre className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`// 400 - Bad Request (missing parameters / malformed alias)
{ "error": "URL is required" }

// 401 - Unauthorized (invalid/missing credentials)
{ "error": "Unauthorized" }

// 404 - Not Found
{ "error": "Not found" }

// 409 - Conflict (alias already registered)
{ "error": "Alias already taken" }

// 500 - Server Error
{ "error": "Internal server error" }`}
        </pre>
      </div>
    ),
  },
];

export default function DocsPage() {
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
            <a href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="text-sm font-medium text-white transition-colors">Docs</a>
            <a href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6">
            Developer Docs
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">API Reference</h1>
          <p className="mt-3 text-base text-slate-400">
            Integrate clikurl shortening services programmatically into your apps.
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-2.5">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900/30 text-slate-400",
                "hover:text-white hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200"
              )}
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-8">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} className="p-6 sm:p-8 scroll-mt-20 border-slate-800 bg-slate-900/20 backdrop-blur-sm rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-1">{s.title}</h2>
              {"endpoint" in s && s.endpoint && (
                <span className="inline-block text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg mt-2 mb-6">
                  {s.endpoint}
                </span>
              )}
              <div className="mt-4">{s.content}</div>
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
