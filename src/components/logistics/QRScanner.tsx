"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { processBagScan } from "@/app/actions/logistics/scan";
import { CheckCircle2, XCircle, QrCode } from "lucide-react";

export default function QRScanner({ orderId }: { orderId: string }) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    // Le scanner s'attache à l'ID HTML "reader"
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    async function onScanSuccess(decodedText: string) {
      scanner.clear(); // Arrête la caméra après un scan réussi pour éviter les doublons
      setScanResult(decodedText);
      
      const result = await processBagScan(orderId, decodedText);
      if (result.success) {
        setStatus({ type: 'success', msg: result.message! });
      } else {
        setStatus({ type: 'error', msg: result.error! });
      }
    }

    scanner.render(onScanSuccess, (err) => {
      // Ignoré volontairement (évite le spam console pendant que la caméra cherche)
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [orderId]);

  return (
    <div className="absolute inset-0 z-0">
      {/* Le conteneur du scanner de la librairie. 
        Note: html5-qr-code injecte son propre CSS, la div "reader" doit donc remplir l'espace.
      */}
      <div id="reader" className="w-full h-full object-cover opacity-80 mix-blend-screen"></div>

      {/* POPUP DE RÉSULTAT FLOTTANTE */}
      {status && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`p-6 rounded-3xl border text-center shadow-2xl max-w-xs w-full animate-in zoom-in ${
            status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-50' : 'bg-red-500/10 border-red-500 text-red-50'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            )}
            
            <p className="font-bold text-lg leading-tight mb-2">{status.msg}</p>
            
            {scanResult && (
              <div className="bg-black/40 p-3 rounded-xl mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3" /> Donnée capturée
                </p>
                <p className="font-mono text-xs text-white/90 break-all">{scanResult}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CSS Global pour écraser les styles horribles par défaut de html5-qr-code
      */}
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; }
        #reader img { display: none !important; }
        #reader__dashboard_section_csr span { color: white !important; font-family: sans-serif; }
        #reader__dashboard_section_swaplink { color: #60a5fa !important; text-decoration: none; }
        #reader button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }
      `}} />
    </div>
  );
}
