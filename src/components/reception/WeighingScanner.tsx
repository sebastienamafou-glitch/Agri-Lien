"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyBag, receiveBag } from "@/app/actions/traceability/reception";
import { QrCode, Scale, CheckCircle2, AlertCircle, X, User, Loader2 } from "lucide-react";

export default function WeighingScanner() {
  const [scannedBatch, setScannedBatch] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (scannedBatch) return;

    const scanner = new Html5QrcodeScanner("reception-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);

    async function onScanSuccess(decodedText: string) {
      scanner.clear();
      setLoading(true);
      setError(null);
      
      const result = await verifyBag(decodedText);
      
      // ✅ BEST PRACTICE : Plus aucun "any". TypeScript sait que si success est true, "batch" existe.
      if (result.success && "batch" in result) {
        setScannedBatch(result.batch);
      } else {
        setError(result.message || "QR Code non reconnu ou invalide.");
        setTimeout(() => setError(null), 3000);
      }
      setLoading(false);
    }

    scanner.render(onScanSuccess, () => {});

    return () => { scanner.clear().catch(console.error); };
  }, [scannedBatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await receiveBag(formData);
    
    if (result.success) {
      setSuccessMsg(result.message || "Lot réceptionné avec succès !");
      setScannedBatch(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(result.message || "Erreur lors de la réception.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h2 className="font-black text-slate-900 flex items-center gap-2 text-lg">
          <QrCode className="w-5 h-5 text-[#FF8200]" /> Scanner & Contrôler
        </h2>
        {scannedBatch && (
          <button onClick={() => setScannedBatch(null)} className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-6">
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="font-bold">{successMsg}</p>
          </div>
        )}

        {error && !scannedBatch && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-3 animate-in zoom-in">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {!scannedBatch && !loading && (
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50">
            <div id="reception-reader" className="w-full"></div>
            <style dangerouslySetInnerHTML={{__html: `#reception-reader { border: none !important; } #reception-reader button { background: #0f172a; color: white; border-radius: 8px; padding: 8px 16px; font-weight: bold; margin: 10px; }`}} />
          </div>
        )}

        {loading && !scannedBatch && (
           <div className="flex flex-col items-center justify-center py-12 text-slate-400">
             <Loader2 className="w-8 h-8 animate-spin text-[#009A44] mb-3" />
             <p className="font-bold uppercase tracking-widest text-xs">Vérification du lot...</p>
           </div>
        )}

        {scannedBatch && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#009A44]/10 text-[#009A44] rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producteur Identifié</p>
                <p className="text-lg font-black text-slate-900">
                  {scannedBatch.harvest?.producer?.user?.firstName || "Nom"} {scannedBatch.harvest?.producer?.user?.lastName || "Inconnu"}
                </p>
                <p className="text-sm font-mono text-slate-500 mt-0.5">{scannedBatch.qrCode}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">
                <Scale className="w-5 h-5 text-blue-600" /> 
                Quantité lue à la réception ({scannedBatch.unit || 'Unités'})
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  name="actualWeight" 
                  defaultValue={scannedBatch.quantity} 
                  required
                  autoFocus
                  className="w-full p-4 pl-6 text-3xl font-black text-slate-900 bg-white border-2 border-blue-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                  {scannedBatch.unit || 'U'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2">
                Volume estimé bord champ : {scannedBatch.quantity} {scannedBatch.unit?.toLowerCase() || 'unités'}
              </p>
            </div>

            {/* ✅ CORRECTION : Le nom est bien batchId pour correspondre au backend */}
            <input type="hidden" name="batchId" value={scannedBatch.id} />
            
            <button type="submit" disabled={loading} className="w-full bg-[#009A44] hover:bg-green-700 text-white p-4 rounded-2xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-green-900/20">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              Valider l'entrée en stock
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
