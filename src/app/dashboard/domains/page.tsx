"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Domain {
  id: string;
  domainName: string;
  createdAt: string;
}

export default function DomainsDashboard() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDomains = async () => {
    try {
      const res = await fetch("/api/me/domains");
      const data = await res.json();
      if (data.domains) setDomains(data.domains);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/me/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add domain");
      }
      setDomains([...domains, data.domain]);
      setDomainInput("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Remove this custom domain? All links mapped on this domain will fallback to standard default redirects.")) return;
    try {
      const res = await fetch(`/api/me/domains/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete domain");
        return;
      }
      setDomains(domains.filter((d) => d.id !== id));
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Custom Domains</h1>
        <p className="text-xs text-slate-400 mt-1">Connect your own brand domain to shorten links (e.g., brand.co/link).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 bg-white border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700">Connected Brand Domains</h3>
          {loading ? (
            <p className="text-xs text-slate-400 animate-pulse">Loading domains...</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                <div>
                  <p className="text-xs font-bold text-slate-800">clikurl.vercel.app</p>
                  <p className="text-[10px] text-slate-400">System default domain</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Default</span>
              </div>

              {domains.map((dom) => (
                <div key={dom.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors animate-fade-up">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{dom.domainName}</p>
                    <p className="text-[10px] text-slate-400">Added {new Date(dom.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Connected</span>
                    <button
                      onClick={() => handleDeleteDomain(dom.id)}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4 h-max">
          <h3 className="text-xs font-bold text-slate-700">Add Brand Domain</h3>
          <form onSubmit={handleAddDomain} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Domain Name</label>
              <input
                type="text"
                placeholder="kfc.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={!domainInput.trim()}
              className="w-full h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Add Domain
            </button>
          </form>
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">DNS Configuration Required</p>
            <p className="text-[9px] text-slate-400 leading-relaxed mt-1">Configure your domain's DNS CNAME record pointing to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">cname.clikurl.com</code> to activate routing.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
