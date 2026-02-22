"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveHarvest } from "@/infrastructure/storage/db"; // Votre wrapper Dexie
import { useSync } from "@/hooks/useSync"; // Votre hook de synchro
import { Wifi, WifiOff, Database, Save, RefreshCw } from "lucide-react";

export default function OfflineTestPage() {
  // 1. État du réseau et de la synchro
  const { isOnline, isSyncing } = useSync();

  // 2. Écoute temps réel de la base de données locale (IndexedDB)
  const offlineHarvests = useLiveQuery(
    () => db.harvests.toArray()
  );

  // 3. Formulaire de test
  const [formData, setFormData] = useState({
    producerId: "test-prod-uuid", // Remplacez par un vrai ID si nécessaire
    farmPlotId: "test-plot-uuid",
    weightKg: 50
  });

  const handleSimulateSave = async () => {
    // Appel à la fonction hybride (Tentative Serveur -> Repli Local)
    const result = await saveHarvest({
      ...formData,
      scannedAt: new Date()
    });

    if (result.status === 'offline') {
      alert("⚠️ Pas de réseau ! Donnée sauvegardée dans le coffre-fort local.");
    } else {
      alert("✅ Réseau OK ! Donnée envoyée directement au serveur.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* HEADER : INDICATEUR D'ÉTAT */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">
            🛠️ Laboratoire Offline-First
          </h1>
          <p className="text-sm text-gray-500">Test de coupure réseau et synchronisation</p>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 font-bold ${
          isOnline 
          ? "bg-green-50 border-green-500 text-green-700" 
          : "bg-red-50 border-red-500 text-red-700"
        }`}>
          {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          {isOnline ? "EN LIGNE (Connecté)" : "HORS LIGNE (Coupé)"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLONNE 1 : SIMULATEUR */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-600" />
            Simuler une Récolte
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Poids (Kg)</label>
              <input 
                type="number" 
                value={formData.weightKg}
                onChange={(e) => setFormData({...formData, weightKg: Number(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg font-bold text-xl"
              />
            </div>
            
            <button
              onClick={handleSimulateSave}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              ENREGISTRER LA RÉCOLTE
            </button>
            
            <p className="text-xs text-gray-400 italic text-center">
              Astuce : Coupez votre WiFi ou utilisez DevTools "Offline" avant de cliquer.
            </p>
          </div>
        </div>

        {/* COLONNE 2 : COFFRE-FORT LOCAL (INDEXED DB) */}
        <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Stockage Local (Dexie)
            </h2>
            {isSyncing && (
              <span className="text-xs font-bold text-blue-600 animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                SYNCHRO EN COURS...
              </span>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[200px]">
            {offlineHarvests?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                <p className="text-sm font-medium">Le coffre-fort est vide.</p>
                <p className="text-xs">Tout est synchronisé !</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="p-3">ID Local</th>
                    <th className="p-3">Poids</th>
                    <th className="p-3">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offlineHarvests?.map((h) => (
                    <tr key={h.id}>
                      <td className="p-3 font-mono text-xs">{h.id}</td>
                      <td className="p-3 font-bold">{h.weightKg} kg</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase border border-yellow-200">
                          ⏳ En attente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
            <strong>Comment tester ?</strong><br/>
            1. Coupez votre connexion internet.<br/>
            2. Cliquez sur "Enregistrer" - La donnée apparaît dans le tableau ci-dessus.<br/>
            3. Rétablissez la connexion - Le tableau se vide automatiquement (Synchro).
          </div>
        </div>

      </div>
    </div>
  );
}
