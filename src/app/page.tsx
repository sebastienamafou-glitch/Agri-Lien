import Link from "next/link";
import Image from "next/image";
import { 
  Sprout, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* ================= HEADER / NAVIGATION ================= */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Principal (Récupéré depuis le dossier /public) */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-auto aspect-[3/1]">
               {/* ⚠️ Assurez-vous que votre logo est dans public/logo-agrilien.png */}
               {/* Si vous n'avez pas encore le fichier, décommentez la ligne suivante pour utiliser un placeholder : */}
               {/* <div className="flex items-center gap-2"><Sprout className="w-8 h-8 text-[#009A44]" /><span className="font-black text-xl text-slate-900">Agri-Lien <span className="text-[#FF8200]">CI</span></span></div> */}
               
               <Image 
                 src="/logo-agrilien.png" // Chemin vers le dossier public
                 alt="Logo Agri-Lien CI"
                 fill
                 className="object-contain object-left"
                 priority
               />
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#mission" className="hover:text-[#009A44] transition-colors">Notre Mission</a>
            <a href="#features" className="hover:text-[#009A44] transition-colors">Fonctionnalités</a>
            <a href="#compliance" className="hover:text-[#009A44] transition-colors">Conformité EUDR</a>
          </nav>

          {/* Bouton Connexion */}
          <div>
            <Link href="/auth/login" className="group bg-[#0f172a] hover:bg-[#FF8200] text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg hover:shadow-orange-900/20">
              Accéder à l'espace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">

        {/* ================= HERO SECTION (Bannière Principale) ================= */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Image de fond avec dégradé */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/60 z-10" />
             <img 
               src="/hero-bg.jpg"
               alt="Producteur de Cacao Ivoirien"
               className="absolute inset-0 w-full h-full object-cover"
             />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-[#FF8200]/10 border border-[#FF8200]/20 text-[#FF8200] px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest">
                <Globe className="w-4 h-4" /> Initiative Nationale Officielle
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                La Traçabilité Agricole Ivoirienne, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009A44] to-[#FF8200]">
                  De la Terre au Port.
                </span>
              </h1>
              <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Sécuriser les revenus des producteurs, garantir la transparence des filières Cacao, Hévéa et Anacarde, et assurer la conformité aux standards internationaux (EUDR).
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/auth/login" className="w-full sm:w-auto bg-[#009A44] hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wide flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-green-900/30 active:scale-95">
                  Se Connecter
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                  Découvrir le fonctionnement
                </a>
              </div>
            </div>
            <div className="hidden lg:block flex-1 relative animate-in zoom-in duration-1000 delay-200">
               {/* Illustration ou Dashboard Mockup */}
               <div className="relative z-10 bg-slate-900/50 p-4 rounded-[3rem] border border-white/10 backdrop-blur-xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <img 
                   src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop"
                   alt="Agri-Lien Dashboard Preview"
                   className="rounded-[2.5rem] border border-white/10 shadow-inner w-full h-auto"
                 />
                 <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                    <div className="bg-[#009A44] p-3 rounded-xl text-white">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</p>
                      <p className="text-slate-900 font-black">100% Conforme EUDR</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* ================= PARTNERS TRUST BAR (Logos Partenaires) ================= */}
        <div className="bg-slate-50 border-y border-slate-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
              Sous l'égide et avec le soutien de
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Remplacez les src par vos fichiers dans public/ */}
              <div className="relative h-16 w-32"><Image src="/logo-ministere.png" alt="Ministère Agriculture" fill className="object-contain" /></div>
              <div className="relative h-16 w-32"><Image src="/logo-UE.png" alt="Union Européenne" fill className="object-contain" /></div>
              <div className="relative h-16 w-32"><Image src="/logo-banque-mondiale.png" alt="Banque Mondiale" fill className="object-contain" /></div>
              <div className="relative h-16 w-32"><Image src="/logo-giz.png" alt="GIZ" fill className="object-contain" /></div>
            </div>
          </div>
        </div>

        {/* ================= FEATURES SECTION (Pourquoi Agri-Lien ?) ================= */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Une réponse technologique aux défis agricoles majeurs.
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Agri-Lien CI connecte tous les acteurs de la chaîne de valeur via une plateforme unique, sécurisée et transparente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-[#009A44]/30 hover:shadow-xl hover:shadow-green-900/5 transition-all group">
                <div className="w-16 h-16 bg-[#009A44]/10 text-[#009A44] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sprout className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Sécurisation du Producteur</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Enregistrement des parcelles, historique de production et garantie d'un paiement juste au prix officiel fixé par l'État.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-[#FF8200]/30 hover:shadow-xl hover:shadow-orange-900/5 transition-all group">
                <div className="w-16 h-16 bg-[#FF8200]/10 text-[#FF8200] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Conformité EUDR & Internationale</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Traçabilité géolocalisée prouvant que les produits ne proviennent pas de zones déforestées, ouvrant l'accès aux marchés européens.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Pilotage Stratégique National</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tableaux de bord en temps réel pour l'État et les partenaires, permettant une gestion proactive des filières et des ressources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EUDR COMPLIANCE CALLOUT ================= */}
        <section id="compliance" className="py-24 bg-[#0f172a] relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
             <Sprout className="w-[500px] h-[500px] text-white" />
           </div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
             <div className="flex-1 space-y-6 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 bg-[#009A44] text-white px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest">
                 <CheckCircle2 className="w-4 h-4" /> Priorité Nationale
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                 Prêt pour le Règlement Zéro Déforestation (EUDR).
               </h2>
               <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                 Agri-Lien CI intègre nativement la géolocalisation des parcelles et le suivi des flux pour garantir l'éligibilité des produits ivoiriens sur le marché européen dès 2025.
               </p>
             </div>
             <div className="flex-1 flex justify-center">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 max-w-md">
                  <ul className="space-y-4">
                    {[
                      "Géolocalisation Polygonale des Parcelles",
                      "Traçabilité Lot par Lot (BatchID)",
                      "Audit Trail Inviolable",
                      "Ségrégation des Flux Certifiés"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white font-bold">
                        <CheckCircle2 className="w-6 h-6 text-[#009A44] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
           </div>
        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0f172a] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            {/* Colonne 1 : Branding */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                <div className="bg-[#009A44] p-2 rounded-xl">
                   <Sprout className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-2xl text-white tracking-tight">
                  Agri-Lien <span className="text-[#FF8200]">CI</span>
                </h3>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                 Plateforme nationale de traçabilité et de valorisation des produits agricoles ivoiriens. Un projet d'État pour l'avenir de notre agriculture.
               </p>
            </div>

            {/* Colonne 2 : Liens */}
            <div>
              <h4 className="text-white font-black uppercase tracking-widest mb-6">Navigation Rapide</h4>
              <ul className="space-y-3 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#mission" className="hover:text-white transition-colors">La Mission</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><Link href="/auth/login" className="hover:text-[#FF8200] transition-colors font-bold">Connexion Acteurs</Link></li>
              </ul>
            </div>

            {/* Colonne 3 : WebAppCI */}
            <div>
               <h4 className="text-white font-black uppercase tracking-widest mb-6">Partenaire Technique</h4>
               <a 
                  href="https://www.webappci.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 -ml-3 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <span className="text-[#0f172a] font-black text-lg tracking-tighter leading-none">
                      WA<br/><span className="text-[#FF8200]">CI</span>
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-white tracking-tight leading-none group-hover:text-[#FF8200] transition-colors">
                      webappci.com
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Solutions Numériques Innovantes</span>
                  </div>
                </a>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
            <p>© {new Date().getFullYear()} République de Côte d'Ivoire. Tous droits réservés.</p>
            <p className="mt-2 md:mt-0">Sécurité & Confidentialité | Mentions Légales</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
