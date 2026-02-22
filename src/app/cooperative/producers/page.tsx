import prisma from "@/lib/prisma"; // ✅ CORRECTION 1 : On utilise le singleton partagé
import { 
  Search, 
  // Filter, // (Pas encore utilisé, je le commente pour nettoyer)
  ShieldCheck,
  Plus,
  X,
  MapPin 
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// PLUS BESOIN DU BLOC "globalForPrisma" ICI (C'est géré dans @/lib/prisma)

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ProducersListPage({ searchParams }: Props) {
  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : "";

  async function searchAction(formData: FormData) {
    "use server";
    const term = formData.get("search") as string;
    redirect(`/cooperative/producers?search=${encodeURIComponent(term)}`);
  }

  // 1. Récupération des données
  const producers = await prisma.user.findMany({
    where: { 
      role: "PRODUCER",
      ...(searchTerm ? {
        OR: [
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { phoneNumber: { contains: searchTerm } }
        ]
      } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      producerProfile: {
        include: {
          score: true 
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Producteurs Enrôlés
          </h1>
          <p className="text-sm text-gray-500">
            {searchTerm 
              ? `Résultats pour "${searchTerm}" (${producers.length})` 
              : `Gestion de la souveraineté alimentaire • ${producers.length} inscrit(s)`
            }
          </p>
        </div>
        <Link 
          href="/cooperative/producers/new" 
          className="flex items-center px-4 py-2 bg-[#FF8200] text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Producteur
        </Link>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <form action={searchAction} className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            name="search"
            defaultValue={searchTerm}
            placeholder="Rechercher par nom, téléphone ou ID..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] text-sm"
          />
        </form>
        
        {searchTerm && (
          <Link href="/cooperative/producers" className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200">
            <X className="w-4 h-4 mr-2" />
            Effacer filtre
          </Link>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Identité</th>
                <th className="p-4">Téléphone</th>
                <th className="p-4">Statut CNI</th>
                <th className="p-4">Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {producers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-8 h-8 mb-2 text-gray-300" />
                      <p className="font-medium">Aucun producteur trouvé.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                producers.map((producer) => (
                  <tr key={producer.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF8200] font-bold border border-orange-200 shrink-0">
                          {/* ✅ CORRECTION 2 : Gestion sécurisée des initiales (si nom manquant) */}
                          {(producer.firstName?.[0] || "?")}{(producer.lastName?.[0] || "?")}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{producer.lastName} {producer.firstName}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {producer.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {producer.phoneNumber}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2 py-1 rounded text-[10px] font-bold border ${
                          producer.nationalIdHash 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-50 text-red-800 border-red-100"
                        }`}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {producer.nationalIdHash ? "SÉCURISÉ" : "NON VÉRIFIÉ"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {producer.producerProfile?.score ? (
                         <span>{producer.producerProfile.score.calculatedScore} pts</span>
                      ) : (
                         <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {producer.producerProfile ? (
                        <Link 
                          href={`/cooperative/producers/${producer.producerProfile.id}`}
                          className="inline-flex items-center text-sm font-bold text-[#FF8200] hover:text-orange-700 hover:underline transition-all"
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          Voir Dossier
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Profil incomplet</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
