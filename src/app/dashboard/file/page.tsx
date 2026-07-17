"use client";

import { Card } from "@/components/ui/card";

export default function FileSharingDashboard() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Share Files</h1>
        <p className="text-xs text-slate-400 mt-1">Upload files and get clean short links to distribute them.</p>
      </div>

      <Card className="p-10 border-dashed border-2 border-slate-200 bg-white text-center flex flex-col items-center justify-center space-y-4 rounded-3xl">
        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-700">Drag and drop file to upload</h3>
          <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, or ZIP up to 50MB.</p>
        </div>
        <button
          onClick={() => alert("File uploads require a Premium subscription. Learn more in the Pricing tab.")}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/10 cursor-pointer"
        >
          Select File
        </button>
      </Card>
    </div>
  );
}
