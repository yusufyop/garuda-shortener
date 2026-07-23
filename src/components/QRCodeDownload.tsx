'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X, ImageIcon, FileCode } from 'lucide-react';

interface Props {
  url: string;
  onClose: () => void;
}

export default function QRCodeDownload({ url, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const urlObj = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObj;
    link.download = `qrcode-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlObj);
  };

  const downloadPNG = async () => {
    if (!svgRef.current || downloading) return;
    setDownloading(true);

    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      const canvas = document.createElement('canvas');
      const size = 2048;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.clearRect(0, 0, size, size);

      const img = new window.Image(); 
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const urlObj = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `qrcode-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(urlObj);
          setDownloading(false);
        }, 'image/png');
      };
      img.onerror = () => {
        setDownloading(false);
        URL.revokeObjectURL(urlObj);
      };
      img.src = urlObj;
    } catch (err) {
      console.error(err);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#0f1f3d] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Export QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-[#8DA9C4] hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center">
          <QRCodeSVG
            ref={svgRef as any}
            value={url}
            size={256}
            level="H"
            includeMargin={false}
            bgColor="transparent"
            fgColor="#0a1628"
          />
        </div>

        <p className="text-xs text-[#8DA9C4] text-center mb-6 font-mono break-all">{url}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadPNG}
            disabled={downloading}
            className="flex flex-col items-center justify-center p-4 bg-[#0066b3] hover:bg-[#0077cc] disabled:opacity-50 text-white rounded-xl transition-all group"
          >
            <ImageIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">PNG HD</span>
            <span className="text-xs text-white/70 mt-1">2048×2048 • Transparent</span>
          </button>
          <button
            onClick={downloadSVG}
            className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0066b3]/50 text-white rounded-xl transition-all group"
          >
            <FileCode className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">SVG Vector</span>
            <span className="text-xs text-[#8DA9C4] mt-1">Vector • Infinite Resolution</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#8DA9C4] tracking-wide">
            ✓ Transparent Background • ✓ High Resolution • ✓ Print Ready
          </p>
        </div>
      </div>
    </div>
  );
}