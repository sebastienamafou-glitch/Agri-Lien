"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, Search, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim().length > 0) {
      router.push(`/cooperative/producers?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all print:hidden">
      
      {/* Mobile Menu Trigger (Actif !) */}
      <div className="lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Barre de Recherche ACTIVE & MODERNE */}
      <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 w-[28rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-300 transition-all shadow-sm group">
        <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-[#FF8200] transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un producteur (Entrée pour valider)..." 
          className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Zone Droite : Notifications & Profil */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2.5 bg-slate-50 border border-slate-100 text-slate-500 hover:text-[#FF8200] hover:bg-orange-50 rounded-full transition-all hover:shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">
              {session?.user?.name || "Administrateur"}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 font-mono tracking-tight">
              {session?.user?.email || "Gestionnaire"}
            </p>
          </div>
          
          <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF8200] font-black text-lg border border-orange-200 shadow-sm">
             {session?.user?.name?.[0] || "A"}
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="ml-1 p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
