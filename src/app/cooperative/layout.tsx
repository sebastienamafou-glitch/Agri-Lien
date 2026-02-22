"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // État local pour contrôler l'ouverture du menu burger sur mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Navigation Latérale Fixe (Reçoit l'état et la fonction pour se fermer) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all">
        {/* En-tête Fixe (Reçoit la fonction pour ouvrir le menu) */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Zone de Contenu Scrollable */}
        <main className="flex-1 p-4 lg:p-8 mt-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
