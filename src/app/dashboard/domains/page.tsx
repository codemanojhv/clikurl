"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Domain {
  id: string;
  domainName: string;
  status: string;
  createdAt: string;
}

export default function DomainsDashboard() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [dnsErrors, setDnsErrors] = useState<Record<string, string>>({});

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
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add domain");
      }
      loadDomains();
      setDomainInput("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerifyDomain = async (id: string, bypass = false) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/domains/${id}/verify${bypass ? "?bypass=true" : ""}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }
      setDomains(
        domains.map((d) => (d.id === id ? { ...d, status: "verified" } : d))
      );
      setDnsErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      setDnsErrors((prev) => ({
        ...prev,
        [id]: err.message,
      }));
    } finally {
      setVerifyingId(null);
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

  const getCnameDetails = (domainName: string) => {
    const parts = domainName.split(".");
    let name = "@";
    if (parts.length > 2) {
      name = parts.slice(0, parts.length - 2).join(".");
    }
    return { name, value: "cname.clikurl.vercel-dns.com" };
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50">
                <div>
                  <p className="text-xs font-bold text-slate-800">clikurl.vercel.app</p>
                  <p className="text-[10px] text-slate-400">System default domain</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Default</span>
              </div>

              {domains.map((dom) => {
                const isPending = dom.status !== "verified";
                const dns = getCnameDetails(dom.domainName);
                const dnsError = dnsErrors[dom.id];

                return (
                  <div key={dom.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors animate-fade-up space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{dom.domainName}</p>
                        <p className="text-[10px] text-slate-400">Added {new Date(dom.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isPending 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {isPending ? "Pending DNS" : "Verified"}
                        </span>
                        {isPending && (
                          <button
                            onClick={() => handleVerifyDomain(dom.id, false)}
                            disabled={verifyingId === dom.id}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {verifyingId === dom.id ? "Verifying..." : "Verify DNS"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDomain(dom.id)}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>

                    {dnsError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg space-y-2 animate-fade-up">
                        <p className="text-[10px] font-semibold">{dnsError}</p>
                        <button
                          onClick={() => handleVerifyDomain(dom.id, true)}
                          className="text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Bypass DNS (For Testing)
                        </button>
                      </div>
                    )}

                    {isPending && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Configure DNS CNAME Record</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 pt-1">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Type</span>
                            CNAME
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Name / Host</span>
                            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{dns.name}</code>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Value / Target</span>
                            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{dns.value}</code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                placeholder="e.g. go.kfc.in"
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
            <p className="text-[9px] text-slate-400 leading-relaxed mt-1">Configure your domain's DNS CNAME record pointing to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">cname.clikurl.vercel-dns.com</code> to activate routing.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
