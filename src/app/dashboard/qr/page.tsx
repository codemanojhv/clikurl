"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

interface Link {
  shortCode: string;
  url: string;
  clicks: number;
  createdAt: string;
}

export default function QRDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      try {
        const res = await fetch("/api/me/links");
        const data = await res.json();
        if (data.links) setLinks(data.links);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  const downloadQR = (code: string, format: "png" | "svg") => {
    const svgEl = document.getElementById(`qr-${code}`) as SVGSVGElement | null;
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);

    if (format === "svg") {
      const blob = new Blob([data], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${code}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 800);
        ctx.drawImage(img, 0, 0, 800, 800);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `qr-${code}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
      };
      img.src = "data:image/svg+xml;base64," + btoa(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">QR Codes</h1>
        <p className="text-xs text-slate-400 mt-1">Generate and customize print-ready QR codes for your short URLs.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse">Loading links...</p>
      ) : links.length === 0 ? (
        <Card className="p-8 text-center border-slate-100 bg-white">
          <p className="text-slate-500 text-sm">No links found. Create your first shortened link to generate a QR code.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {links.map((link) => {
            const shortUrl = `https://clikurl.vercel.app/${link.shortCode}`;
            return (
              <Card key={link.shortCode} className="p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                  <QRCodeSVG id={`qr-${link.shortCode}`} value={shortUrl} size={130} level="H" bgColor="#ffffff" fgColor="#1e293b" marginSize={1} />
                </div>
                <div className="w-full space-y-1.5 mb-4">
                  <p className="text-xs font-bold text-slate-800 truncate">{link.shortCode}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">{link.url}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => downloadQR(link.shortCode, "png")}
                    className="flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => downloadQR(link.shortCode, "svg")}
                    className="flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    SVG
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
