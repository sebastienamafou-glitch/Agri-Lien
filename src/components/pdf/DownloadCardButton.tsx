"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProducerIdCard } from "./ProducerIdCard";
import { QrCode, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

type Props = {
  producer: {
    firstName: string;
    lastName: string;
    id: string;
    phoneNumber: string;
    createdAt: Date;
  };
};

export default function DownloadCardButton({ producer }: Props) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Génération du QR Code au chargement du composant
  useEffect(() => {
    setIsClient(true);
    // On encode l'URL de vérification (ex: https://agri-lien.ci/verify/ID)
    // Pour l'instant, on met juste l'ID brut
    QRCode.toDataURL(producer.id, { margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [producer.id]);

  if (!isClient || !qrCodeUrl) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-wait">
        <Loader2 className="w-4 h-4 animate-spin" />
        Préparation...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ProducerIdCard producer={producer} qrCodeDataUrl={qrCodeUrl} />}
      fileName={`carte-${producer.lastName}-${producer.firstName}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#FF8200] transition-colors shadow-sm"
    >
      {/* @ts-ignore : La librairie a parfois du mal avec les types enfants */}
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
          {loading ? "Génération..." : "Carte PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
}
