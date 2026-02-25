import Dexie, { Table } from 'dexie';
import { syncHarvest } from '@/app/actions/sync'; 

// ✅ Mise à jour de l'interface pour correspondre au nouveau schéma
export interface OfflineHarvest {
  id?: number; 
  producerId: string;
  farmPlotId: string;
  quantity: number; // Remplace weightKg
  cropType: string; // Nouveau champ requis
  unit: string;     // Nouveau champ requis
  scannedAt: Date;
  synced: boolean; 
}

export interface OfflineTransportOrder {
  id?: number;
  producerId: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  createdAt: Date;
  synced: boolean;
}

class AgriLienDatabase extends Dexie {
  harvests!: Table<OfflineHarvest>;
  transportOrders!: Table<OfflineTransportOrder>;

  constructor() {
    super('AgriLienOfflineDB');
    // ✅ Passage en version 2 pour valider le changement de structure
    this.version(2).stores({
      harvests: '++id, producerId, synced', 
      transportOrders: '++id, producerId, synced'
    });
  }
}

export const db = new AgriLienDatabase();

/**
 * Sauvegarde Hybride : Tente le serveur (Sync), sinon stocke en local (Dexie)
 */
export async function saveHarvest(data: Omit<OfflineHarvest, 'id' | 'synced'>) {
  try {
    if (navigator.onLine) {
      // ✅ Les données correspondent maintenant parfaitement à ce qu'attend syncHarvest
      const result = await syncHarvest(data);
      
      if (!result.success) throw new Error(result.message || "Erreur inconnue");

      console.log("✅ [ONLINE] Récolte synchronisée immédiatement.");
      return { status: 'online', id: null };
    } else {
      throw new Error("Offline"); 
    }
  } catch (error) {
    // Si échec ou hors ligne, on sauvegarde dans Dexie
    const id = await db.harvests.add({
      ...data,
      synced: false, 
    });
    console.log("💾 [OFFLINE] Sauvegardé en local (ID: " + id + ")");
    return { status: 'offline', id };
  }
}
