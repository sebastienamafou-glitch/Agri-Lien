"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  QrCode, 
  Settings, 
  Sprout,
  Scale, 
  BarChart3,
  LogOut,
  Truck,
  Banknote,
  Printer
} from "lucide-react";

const menuItems = [
  { 
    category: "Pilotage",
    items: [
      { name: "Vue d'ensemble", href: "/cooperative/dashboard", icon: LayoutDashboard },
    ]
  },
  { 
    category: "Réseau Agricole",
    items: [
      { name: "Producteurs", href: "/cooperative/producers", icon: Users },
      { name: "Carte & Parcelles", href: "/cooperative/map", icon: Map },
    ]
  },
  { 
    category: "Opérations Terrain",
    items: [
      { name: "Finance & Paiements", href: "/cooperative/finance", icon: Banknote },
      { name: "Réception & Pesage", href: "/cooperative/reception", icon: Scale },
      { name: "Traçabilité (QR)", href: "/cooperative/traceability", icon: QrCode },
      { name: "Imprimer Étiquettes", href: "/cooperative/tools/qr-generator", icon: Printer },
      { name: "Logistique Fret", href: "/cooperative/logistics", icon: Truck },
    ]
  },
  { 
    category: "Système",
    items: [
      { name: "Rapports", href: "/cooperative/reports", icon: BarChart3 },
      { name: "Paramètres", href: "/cooperative/settings", icon: Settings },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* OVERLAY SOMBRE (Visible uniquement sur mobile quand le menu est ouvert) */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* SIDEBAR RESPONSIVE */}
      <aside 
        className={`flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 text-white h-screen fixed left-0 top-0 z-50 print:hidden transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        
        {/* En-tête : Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-[#0f172a]">
          {/* ✅ CORRECTION : Lien vers le dashboard coopérative */}
          <Link href="/cooperative/dashboard" onClick={onClose} className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="bg-white/10 p-1.5 rounded-lg border border-white/5 shadow-sm">
               <Sprout className="w-5 h-5 text-[#FF8200]" />
            </div>
            <span>Agri-Lien <span className="text-[#FF8200]">CI</span></span>
          </Link>
        </div>

        {/* Corps : Navigation Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((group, idx) => (
            <div key={idx}>
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.category}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose} // Ferme le menu sur mobile après un clic
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                      ${isActive 
                        ? "bg-[#FF8200] text-white shadow-lg shadow-orange-900/20" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                      <span className="truncate">{item.name}</span>
                      {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pied de page : Déconnexion */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-red-400 w-full px-4 py-3.5 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-red-900/30"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
