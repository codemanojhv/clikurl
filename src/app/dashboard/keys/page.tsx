"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  key?: string;
  lastEight: string;
  createdAt: string;
  status: "active" | "revoked";
}

export default function DashboardKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyBox, setNewKeyBox] = useState<ApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/me/keys");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load keys");
        return;
      }
      setKeys(data.keys || []);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!keyName.trim()) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/me/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create key");
        return;
      }

      setNewKeyBox(data.key);
      setKeys((prev) => [data.key, ...prev]);
      setKeyName("");
      setShowCreate(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this key? Existing integrations using it will stop working.")) return;

    try {
      const res = await fetch(`/api/me/keys/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to revoke");
        return;
      }
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
      );
    } catch {
      alert("Something went wrong");
    }
  }

  function handleCopyKey(key: string) {
    try {
      navigator.clipboard.writeText(key);
    } catch {
      const input = document.createElement("input");
      input.value = key;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">API keys</h1>
          <p className="text-slate-500 mt-1">Manage keys for programmatic access.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Create new key</Button>
      </div>

      {error && (
        <p className={cn("text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6")}>
          {error}
        </p>
      )}

      {newKeyBox && (
        <Card className="p-6 mb-8 border-green-200 bg-green-50">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Key created — copy it now</h3>
          <p className="text-xs text-green-700 mb-3">
            This key will not be shown again. Save it somewhere safe.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 break-all select-all">
              {newKeyBox.key}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => newKeyBox.key && handleCopyKey(newKeyBox.key)}
            >
              {copiedKey ? "Copied!" : "Copy"}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-green-700"
            onClick={() => setNewKeyBox(null)}
          >
            Dismiss
          </Button>
        </Card>
      )}

      {showCreate && (
        <Card className="p-6 mb-8">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New API key</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g. production, dev)"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <Button onClick={handleCreate} disabled={creating || !keyName.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {keys.length === 0 && !showCreate ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No API keys yet</p>
          <p className="text-sm text-slate-400">
            Create a key to start integrating via the API.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-slate-900">{key.name}</p>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      key.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}
                  >
                    {key.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <code className="text-xs font-mono text-slate-400">
                    clk_...{key.lastEight}
                  </code>
                  <span className="text-xs text-slate-400">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {key.status === "active" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                  onClick={() => handleRevoke(key.id)}
                >
                  Revoke
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
