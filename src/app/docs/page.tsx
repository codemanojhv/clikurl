"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  {
    id: "authentication",
    title: "Authentication",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          The API uses Bearer token authentication. Include your API key in the
          <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-sm font-mono text-slate-800">Authorization</code>
          header:
        </p>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
{`fetch("https://clikurl.vercel.app/api/shorten", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-api-key>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ url: "https://example.com" })
})`}
        </pre>
        <p className="text-slate-600">
          You can manage API keys from your{" "}
          <a href="/dashboard/keys" className="text-slate-900 font-medium underline underline-offset-2">dashboard</a>.
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
        <p className="text-slate-600">
          Shorten a URL. Optionally provide a custom alias.
        </p>

        <h4 className="text-sm font-semibold text-slate-900">Request</h4>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
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

        <h4 className="text-sm font-semibold text-slate-900">Response</h4>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
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
        <p className="text-slate-600">
          Visiting a short code redirects to the original URL. No auth required.
        </p>

        <h4 className="text-sm font-semibold text-slate-900">Request</h4>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
{`// Browser: navigate to https://clikurl.vercel.app/my-link
// Returns HTTP 302 redirect to the original URL

// Programmatically:
const res = await fetch("https://clikurl.vercel.app/my-link", {
  redirect: "manual" // don't auto-follow
});
// res.status === 302
// res.headers.get("Location") === original URL`}
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
        <p className="text-slate-600">
          Retrieve click analytics for a short link.
        </p>

        <h4 className="text-sm font-semibold text-slate-900">Request</h4>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
{`fetch("https://clikurl.vercel.app/api/analytics?code=my-link", {
  headers: {
    "Authorization": "Bearer <api-key>"
  }
})`}
        </pre>

        <h4 className="text-sm font-semibold text-slate-900">Response</h4>
        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
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
        <p className="text-slate-600">
          The API returns standard HTTP status codes and a JSON error body:
        </p>

        <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto">
{`// 400 - Bad Request (missing URL, invalid alias)
{ "error": "URL is required" }

// 401 - Unauthorized (missing/invalid API key)
{ "error": "Unauthorized" }

// 404 - Not Found (code doesn't exist)
{ "error": "Not found" }

// 409 - Conflict (alias already taken)
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">API Documentation</h1>
          <p className="mt-3 text-lg text-slate-500">
            Everything you need to integrate clikurl into your applications.
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white",
                "text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
              )}
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {sections.map((s) => (
            <Card key={s.id} id={s.id} className="p-6 scroll-mt-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">{s.title}</h2>
              {"endpoint" in s && s.endpoint && (
                <p className="text-sm font-mono text-slate-400 mb-4">{s.endpoint}</p>
              )}
              {s.content}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
