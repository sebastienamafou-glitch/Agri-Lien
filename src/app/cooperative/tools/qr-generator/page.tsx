"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, RefreshCw, QrCode } from "lucide-react";

export default function QrGeneratorPage() {
  const [codes, setCodes] = useState<string[]>([]);

  const generateCodes = () => {
    // Génère 12 codes uniques avec un format alphanumérique pro (ex: AGRI-BAG-X7V9P2)
    const newCodes = Array.from({ length: 12 }).map(() => {
      const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `AGRI-BAG-${uniqueId}`;
    });
    setCodes(newCodes);
  };

  return (
    // Suppression du min-h-screen et du background car gérés par le layout.tsx parent
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER (Caché à l'impression) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-[#0f172a] p-2 rounded-xl text-white shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            Générateur d'Étiquettes
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Générez et imprimez des QR Codes uniques pour identifier les sacs de cacao.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={generateCodes}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-black uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Générer
          </button>
          <button 
            onClick={() => window.print()}
            disabled={codes.length === 0}
            className={`flex items-center gap-2 px-5 py-3 text-white text-sm font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 ${
              codes.length === 0 
              ? "bg-slate-300 cursor-not-allowed shadow-none" 
              : "bg-[#FF8200] hover:bg-orange-600 shadow-orange-900/20"
            }`}
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* GRILLE DE QR CODES (Optimisée pour l'impression A4) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px] print:shadow-none print:border-none print:p-0 print:m-0 print:bg-transparent">
        {codes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
            {codes.map((code) => (
              <div key={code} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 print:bg-white print:border-slate-400 print:break-inside-avoid">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 print:border-none print:shadow-none">
                  <QRCodeSVG value={code} size={130} level={"H"} />
                </div>
                <p className="mt-4 font-mono font-black text-slate-900 text-sm tracking-widest bg-slate-200/50 px-3 py-1 rounded-lg print:bg-transparent print:border print:border-slate-300">
                  {code}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-2 tracking-widest">
                  Agri-Lien CI
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 print:hidden">
            <div className="bg-slate-50 p-6 rounded-full border-2 border-dashed border-slate-200 mb-4">
              <QrCode className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-lg font-black text-slate-500">Aucune étiquette générée</p>
            <p className="text-sm font-medium mt-1">Cliquez sur le bouton "Générer" en haut à droite.</p>
          </div>
        )}
      </div>

      {/* Note de bas de page */}
      <div className="text-center mt-6 print:hidden">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 inline-block px-4 py-2 rounded-xl">
          💡 Ces QR Codes seront scannés par les producteurs lors de l'ensachage bord champ.
        </p>
      </div>
    </div>
  );
}
