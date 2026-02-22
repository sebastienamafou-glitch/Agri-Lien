import { toast } from "sonner";

/**
 * Exécute une action serveur avec une solution de secours hors-ligne (DRY)
 * * @param actionName - Le nom de l'action pour les notifications (ex: "Déclaration de récolte")
 * @param serverAction - La fonction à exécuter si internet est disponible
 * @param offlineFallback - La fonction à exécuter pour sauvegarder localement (Dexie)
 */
export async function executeWithOfflineFallback<T>(
  actionName: string,
  serverAction: () => Promise<T>,
  offlineFallback: () => Promise<void>
) {
  // 1. TENTATIVE EN LIGNE
  if (navigator.onLine) {
    try {
      toast.loading(`Envoi en cours : ${actionName}...`, { id: actionName });
      
      const result = await serverAction();
      
      toast.success(`${actionName} réussie !`, { id: actionName });
      return result;
      
    } catch (error) {
      console.warn(`Serveur injoignable pour ${actionName}. Bascule en mode hors-ligne...`, error);
      // Si le serveur plante (ex: zone réseau faible), on ne bloque pas l'utilisateur, on continue vers le fallback.
    }
  }

  // 2. SAUVEGARDE HORS-LIGNE (Dexie)
  try {
    await offlineFallback();
    
    // Notification jaune pour prévenir que c'est sauvegardé, mais pas encore envoyé
    toast.warning(
      `Réseau indisponible. ${actionName} sauvegardée sur le téléphone. L'envoi se fera automatiquement plus tard.`, 
      { id: actionName, duration: 5000 }
    );
    
  } catch (offlineError) {
    toast.error(`Erreur critique : Impossible de sauvegarder ${actionName} sur le téléphone.`, { id: actionName });
    console.error("Erreur Dexie:", offlineError);
  }
}
