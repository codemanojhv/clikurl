import { notFound } from "next/navigation";
import { findLinkByCode, recordClick } from "@/lib/db-store";

interface TxtPageProps {
  params: Promise<{ code: string }>;
}

export default async function SharedTxtPage({ params }: TxtPageProps) {
  const { code } = await params;
  const link = await findLinkByCode(code);

  if (!link || !link.textContent) {
    notFound();
  }

  // Record a visit click
  try {
    await recordClick(code, {
      ip: "unknown",
      userAgent: "browser",
      referrer: "direct",
      country: "unknown",
      device: "unknown",
    });
  } catch (err) {
    console.error("Failed to record click for snippet", err);
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 text-sm font-extrabold text-blue-600">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
              clikurl
            </a>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Snippet</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Created {new Date(link.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Snippet Card */}
        <div className="bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500">/{code}</span>
            <span className="text-[10px] font-bold text-slate-400">{link.textContent.length} characters</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
              {link.textContent}
            </pre>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400 font-medium">This snippet is hosted securely on clikurl. URL redirects to destination on /{code}.</p>
        </div>
      </div>
    </div>
  );
}
