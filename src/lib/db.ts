import Dexie, { Table } from 'dexie';

export interface OfflineHarvest {
  id?: number;
  producerId: string;
  farmPlotId: string;
  weightKg: number;
  scannedAt: Date;
  isSynced: number; 
}

// ✅ Nouvelle interface pour les scans de sacs
export interface OfflineScan {
  id?: number;
  qrCode: string;
  scannedAt: Date;
  isSynced: number;
}

export class AgriLienDB extends Dexie {
  harvests!: Table<OfflineHarvest>;
  scans!: Table<OfflineScan>; // ✅ Ajout de la table

  constructor() {
    super('AgriLienOffline');
    // Passage en version 2 pour forcer la mise à jour sur le téléphone
    this.version(2).stores({
      harvests: '++id, producerId, isSynced',
      scans: '++id, qrCode, isSynced' // ✅ qrCode est indexé pour éviter les doublons locaux
    });
  }
}

export const db = new AgriLienDB();
