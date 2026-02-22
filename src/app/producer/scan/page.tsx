"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { processScan } from "@/app/actions/traceability/scan";
import { useRouter } from "next/navigation";
import { executeWithOfflineFallback } from "@/lib/offlineHelper"; // ✅ L'utilitaire DRY
import { db } from "@/lib/db"; // ✅ La base locale Dexie

export default function ScanPage() {
  const router = useRouter();
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "IDLE") return;

    const scanner = new Html5QrcodeScanner("producer-reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    async function onScanSuccess(decodedText: string) {
      if (decodedText === lastScanned) return;

      scanner.clear(); 
      if (navigator.vibrate) navigator.vibrate(200);
      
      setLastScanned(decodedText);
      setStatus("PROCESSING");
      setMessage("Analyse du code...");

      let scanSuccess = false;
      let uiMessage = "";

      // ✅ UTILISATION DE NOTRE FONCTION DRY
      await executeWithOfflineFallback(
        "Enregistrement du sac",
        
        // 1. TENTATIVE SERVEUR (En ligne)
        async () => {
          const result = await processScan(decodedText);
          scanSuccess = result.success;
          uiMessage = result.message || "Sac enregistré !";
          
          if (!result.success && uiMessage.includes("Erreur technique")) {
            // Force le passage au mode hors-ligne uniquement si c'est un crash serveur
            // (Si c'est juste un QR Code doublon, on le laisse afficher l'erreur normalement)
            throw new Error("Fallback");
          }
        },
        
        // 2. TENTATIVE DEXIE (Hors-ligne)
        async () => {
          // Vérifier si on ne l'a pas DÉJÀ scanné hors-ligne pour éviter les doublons locaux
          const existsOffline = await db.scans.where("qrCode").equals(decodedText).first();
          if (existsOffline) {
            scanSuccess = false;
            uiMessage = "Ce sac a déjà été scanné (en attente de synchro).";
            return;
          }

          await db.scans.add({
            qrCode: decodedText,
            scannedAt: new Date(),
            isSynced: 0
          });
          scanSuccess = true;
          uiMessage = "Sac sauvegardé hors-ligne !";
        }
      );

      // Met à jour l'interface graphique du "Mode Rafale" selon le résultat
      if (scanSuccess) {
        setStatus("SUCCESS");
        setMessage(uiMessage);
        setTimeout(() => {
          setStatus("IDLE");
          setLastScanned(null);
          router.refresh();
        }, 2500);
      } else {
        setStatus("ERROR");
        setMessage(uiMessage);
        setTimeout(() => {
          setStatus("IDLE");
          setLastScanned(null);
        }, 3000);
      }
    }

    scanner.render(onScanSuccess, () => {});

    return () => { scanner.clear().catch(console.error); };
  }, [status, lastScanned, router]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans relative">
      
      {/* HEADER TRANSPARENT */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between pb-safe-top">
        <Link href="/producer/dashboard" className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition active:scale-95 border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
          <p className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
            <Zap size={14} className="text-[#FF8200] fill-current animate-pulse" />
            Rafale Actif
          </p>
        </div>
      </div>

      {/* ZONE CAMÉRA */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        
        {status === "IDLE" && (
          <div className="absolute inset-0 z-0">
            <div id="producer-reader" className="w-full h-full object-cover"></div>
            <style dangerouslySetInnerHTML={{__html: `#producer-reader { border: none !important; } #producer-reader img { display: none !important; } #producer-reader__dashboard_section_swaplink { display: none; } #producer-reader button { background: #009A44; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 50; }`}} />
          </div>
        )}
        
        {/* FEEDBACK VISUEL SURIMPRIMÉ */}
        {status === "PROCESSING" && (
          <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
             <Loader2 className="w-16 h-16 text-[#FF8200] animate-spin mb-4" />
             <h2 className="text-xl font-black text-white tracking-widest uppercase">{message}</h2>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="absolute inset-0 bg-[#009A44]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-24 h-24 text-white mb-4 drop-shadow-2xl" />
            <h2 className="text-3xl font-black text-white text-center px-4 tracking-tight">{message}</h2>
            <p className="text-green-100 font-bold mt-2 animate-pulse">Préparation du scan suivant...</p>
          </div>
        )}

        {status === "ERROR" && (
          <div className="absolute bottom-32 left-6 right-6 bg-red-500 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 border border-red-400">
            <div className="bg-red-600 p-2 rounded-xl">
              <AlertCircle className="w-8 h-8 shrink-0" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider mb-0.5">Échec</p>
              <p className="font-medium text-sm text-red-100">{message}</p>
            </div>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS BAS */}
      <div className="bg-white p-8 rounded-t-[2.5rem] z-10 -mt-8 relative shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.1)]">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <h3 className="text-center font-black text-slate-900 text-xl mb-2 tracking-tight">Scanner les sacs</h3>
        <p className="text-center text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
          Placez le QR Code de l'étiquette Agri-Lien CI dans le cadre. L'enregistrement au lot est automatique.
        </p>
      </div>
    </div>
  );
}
