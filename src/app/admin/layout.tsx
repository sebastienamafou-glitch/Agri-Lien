import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Banknote, 
  ShieldAlert, 
  Users, 
  Truck, 
  Sprout
} from "lucide-react";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Bouclier de Sécurité : Vérification de la session
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // 2. Vérification stricte du rôle ADMIN dans la base de données
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    select: { role: true, firstName: true, lastName: true }
  });

  if (!user || user.role !== "ADMIN") {
    // Si un petit malin essaie d'accéder à l'URL admin, on le renvoie
    redirect("/onboarding"); 
  }

  // Configuration du menu de navigation
  const navItems = [
    { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Prix & Marchés", href: "/admin/pricing", icon: Banknote },
    { name: "Audit & Sécurité", href: "/admin/audit", icon: ShieldAlert },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Tour de Contrôle", href: "/admin/logistics", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* BARRE LATÉRALE (DESKTOP) & EN-TÊTE (MOBILE) */}
      <aside className="w-full md:w-72 bg-[#0f172a] text-white flex flex-col md:fixed md:inset-y-0 z-50 shadow-2xl">
        
        {/* Logo & Titre */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-[#009A44] p-2 rounded-xl">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-tight">Agri-Lien CI</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Portail Gouvernemental</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto hidden md:block">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-colors group"
              >
                <Icon className="w-5 h-5 group-hover:text-[#009A44] transition-colors" />
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Menu Mobile Simplifié (Scroll Horizontal) */}
        <nav className="flex md:hidden overflow-x-auto py-3 px-4 gap-2 border-b border-white/10 hide-scrollbar bg-[#0f172a]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-slate-300 hover:bg-white/10 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                <span className="font-bold text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profil Admin & Déconnexion */}
        <div className="p-4 border-t border-white/10 hidden md:block">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
            <p className="font-black text-sm text-white mb-4">{user.firstName} {user.lastName}</p>
            <div className="w-full">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main className="flex-1 md:ml-72 min-h-screen">
        {children}
      </main>
      
    </div>
  );
}
