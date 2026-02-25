"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db"; 
import { useSync } from "@/hooks/useSync";
import { Wifi, WifiOff, Database, Save, RefreshCw } from "lucide-react";

export default function OfflineTestPage() {
  const { isOnline, isSyncing } = useSync();
  const offlineHarvests = useLiveQuery(() => db.harvests.toArray());

  const [formData, setFormData] = useState({
    producerId: "test-prod-uuid",
    farmPlotId: "test-plot-uuid",
    quantity: 50
  });

  const handleSimulateSave = async () => {
    // Sauvegarde directe dans Dexie pour tester
    await db.harvests.add({
      ...formData,
      cropType: "CACAO",
      unit: "KG",
      scannedAt: new Date(),
      isSynced: 0
    });
    alert("✅ Donnée sauvegardée localement !");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 uppercase">🛠️ Labo Offline</h1>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 font-bold ${isOnline ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700"}`}>
          {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          {isOnline ? "EN LIGNE" : "HORS LIGNE"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Save className="w-5 h-5 text-blue-600" /> Simuler une Récolte</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Quantité (Kg)</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-lg font-bold text-xl" />
            </div>
            <button onClick={handleSimulateSave} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
              <Database className="w-4 h-4 inline mr-2" /> ENREGISTRER
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Database className="w-5 h-5" /> Stockage Local</h2>
            {isSyncing && <span className="text-xs font-bold text-blue-600 animate-pulse flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> SYNCHRO...</span>}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[200px] p-4">
            {offlineHarvests?.map((h) => (
              <div key={h.id} className="flex justify-between border-b py-2">
                <span className="font-bold">{h.quantity} Kg ({h.cropType})</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">En attente</span>
              </div>
            ))}
            {offlineHarvests?.length === 0 && <p className="text-center text-slate-400 mt-10">Coffre vide.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
