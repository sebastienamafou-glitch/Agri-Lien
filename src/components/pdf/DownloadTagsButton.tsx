"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { BagTagsSheet } from "./BagTagsSheet";
import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

// EN PRODUCTION : Remplacez ceci par votre vrai domaine (ex: https://agri-lien.ci)
// EN LOCAL : Utilisez http://localhost:3000 (mais attention, votre téléphone ne pourra pas l'ouvrir)
const BASE_URL = "https://agri-lien.ci"; 

export default function DownloadTagsButton({ bags, producerName }: { bags: any[], producerName: string }) {
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const generateAll = async () => {
      const urls: Record<string, string> = {};
      for (const bag of bags) {
        // C'EST ICI QUE TOUT SE JOUE 👇
        // On concatène le domaine + la route + l'ID du sac
        const fullUrl = `${BASE_URL}/trace/${bag.qrCode}`;
        
        urls[bag.id] = await QRCode.toDataURL(fullUrl);
      }
      setQrUrls(urls);
      setReady(true);
    };
    if (bags.length > 0) generateAll();
  }, [bags]);

  if (!ready) return <span className="text-xs text-gray-400">Chargement...</span>;

  return (
    <PDFDownloadLink
      document={<BagTagsSheet bags={bags} producerName={producerName} qrDataUrls={qrUrls} />}
      fileName="etiquettes-sacs.pdf"
      className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50"
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          <Printer className="w-3 h-3" />
          {loading ? "Génération..." : "Imprimer Étiquettes"}
        </>
      )}
    </PDFDownloadLink>
  );
}
