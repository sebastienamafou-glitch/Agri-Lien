import Dexie, { Table } from 'dexie';

// ✅ Interface unique et conforme au schéma Prisma
export interface OfflineHarvest {
  id?: number;
  producerId: string;
  farmPlotId: string;
  quantity: number; // Remplace weightKg
  cropType: string; // Nouveau champ requis
  unit: string;     // Nouveau champ requis
  scannedAt: Date;
  isSynced: number; 
}

// ✅ Interface manquante ajoutée
export interface OfflineScan {
  id?: number;
  qrCode: string;
  scannedAt: Date;
  isSynced: number;
}

export class AgriLienDB extends Dexie {
  harvests!: Table<OfflineHarvest>;
  scans!: Table<OfflineScan>;

  constructor() {
    super('AgriLienOffline');
    // ✅ Passage en version 3 pour valider la nouvelle structure
    this.version(3).stores({
      harvests: '++id, producerId, isSynced, cropType',
      scans: '++id, qrCode, isSynced'
    });
  }
}

export const db = new AgriLienDB();
