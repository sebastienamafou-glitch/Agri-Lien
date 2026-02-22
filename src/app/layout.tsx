import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import Providers from "@/components/providers/Providers"; 
import { Toaster } from "sonner";
import OfflineManager from "@/components/providers/OfflineManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agri-Lien CI",
  description: "Plateforme de souveraineté alimentaire et traçabilité cacao.",
  manifest: "/manifest.json", // Préparation pour la PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <Providers>
          {/* Notre manager invisible qui écoute le réseau */}
          <OfflineManager /> 
          
          {/* ✅ CONFIGURATION MOBILE DES NOTIFICATIONS */}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                borderRadius: '1rem', // Bords très arrondis pour le style natif
                padding: '16px',
                border: 'none',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              },
            }}
          />
          
          {children}
        </Providers>
      </body>
    </html>
  );
}
