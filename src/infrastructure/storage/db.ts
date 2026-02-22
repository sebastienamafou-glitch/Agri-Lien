import Dexie, { Table } from 'dexie';
// ✅ On importe l'action dédiée à la synchro (pas celle du formulaire web)
import { syncHarvest } from '@/app/actions/sync'; 

export interface OfflineHarvest {
  id?: number; 
  producerId: string;
  farmPlotId: string;
  weightKg: number;
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
    this.version(1).stores({
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
      // ✅ Appel vers l'action JSON (sync.ts)
      const result = await syncHarvest(data);
      
      if (!result.success) throw new Error(result.error);

      console.log("✅ [ONLINE] Récolte synchronisée immédiatement.");
      return { status: 'online', id: null };
    } else {
      throw new Error("Offline"); 
    }
  } catch (error) {
    const id = await db.harvests.add({
      ...data,
      synced: false, 
    });
    console.log("💾 [OFFLINE] Sauvegardé en local (ID: " + id + ")");
    return { status: 'offline', id };
  }
}
