"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function TeamsDashboard() {
  const [invites, setInvites] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setInvites([...invites, emailInput.trim()]);
    setEmailInput("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Teams</h1>
        <p className="text-xs text-slate-400 mt-1">Collaborate on shortlinks, custom domains, and campaign analytics with your team.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 bg-white border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700">Active Members</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                  S
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Sam Lee</p>
                  <p className="text-[10px] text-slate-400">sam@example.com</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Owner</span>
            </div>
            {invites.map((email, idx) => (
              <div key={idx} className="flex items-center justify-between animate-fade-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200">
                    ?
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{email.split("@")[0]}</p>
                    <p className="text-[10px] text-slate-400">{email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">Invited</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700">Invite Member</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
            />
            <button
              type="submit"
              className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Send Invite
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
