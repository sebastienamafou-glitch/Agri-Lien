import prisma from "@/lib/prisma";
import Link from "next/link";
// ✅ CORRECTION : On importe la bonne action pour mettre à jour le statut
import { updateOrderStatus } from "@/app/actions/logistics/logistics"; 

export default async function LogisticsPage() {
  const transportOrders = await prisma.transportOrder.findMany({
    include: {
      producer: { include: { user: true } },
      transporter: { include: { user: true } }
    },
    orderBy: { requestedAt: 'desc' }
  });

  return (
    <div className="p-6 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistique & Transport</h1>
          <p className="text-gray-500 font-medium mt-1">Gestion de la bourse de fret et suivi des flux</p>
        </div>
        <Link 
          href="/cooperative/logistics/new" 
          className="bg-[#009A44] text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20"
        >
          + Nouvel Ordre
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producteur</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transporteur</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transportOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">#{order.id.slice(0, 8)}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {new Date(order.requestedAt).toLocaleDateString('fr-FR')} à {new Date(order.requestedAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {order.producer.user.lastName} {order.producer.user.firstName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                      order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      order.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      order.status === 'COMPLETED' ? 'bg-green-50 text-[#009A44] border-green-200' :
                      'bg-slate-100 text-slate-600 border-slate-300'
                    }`}>
                      {order.status === 'PENDING' ? 'En attente' : order.status === 'IN_PROGRESS' ? 'En route' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {order.transporter 
                      ? `${order.transporter.user.lastName} ${order.transporter.user.firstName}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    
                    {/* ✅ LA BEST PRACTICE : Le Wrapper Server Action */}
                    {order.status === 'PENDING' && (
                      <form action={async (formData) => {
                        "use server";
                        const id = formData.get("orderId") as string;
                        await updateOrderStatus(id, "IN_PROGRESS");
                      }}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button type="submit" className="bg-[#FF8200] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 shadow-md transition-transform active:scale-95">
                          Envoyer Camion
                        </button>
                      </form>
                    )}

                    {/* ✅ CORRECTION : Le lien pointe bien vers la coopérative */}
                    <Link href={`/cooperative/logistics/${order.id}`} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
