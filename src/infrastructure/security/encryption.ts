import crypto from 'crypto';

// Algorithme standard (AES-256)
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Chiffre une donnée sensible.
 * La clé est lue "Just-in-Time" pour éviter les bugs de chargement .env
 */
export function encryptData(text: string): string {
  // 1. On récupère la clé ici, au moment précis où on en a besoin
  const SECRET_KEY = process.env.AES_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error("❌ ERREUR SÉCURITÉ : La clé AES_SECRET_KEY est manquante dans les variables d'environnement.");
  }
  
  // 2. Vérification de la longueur (44 caractères base64 = 32 bytes)
  if (SECRET_KEY.length !== 44) {
     throw new Error(`❌ ERREUR CLÉ : La clé AES_SECRET_KEY semble invalide (Longueur actuelle: ${SECRET_KEY.length}, Attendue: 44). Vérifiez votre .env`);
  }

  try {
    const key = Buffer.from(SECRET_KEY, 'base64');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error("Erreur détaillée lors du chiffrement :", error);
    throw new Error("Echec du chiffrement des données.");
  }
}

/**
 * Déchiffre une donnée.
 */
export function decryptData(text: string): string {
  const SECRET_KEY = process.env.AES_SECRET_KEY;

  if (!SECRET_KEY) throw new Error("Clé de chiffrement introuvable");
  if (!text.includes(':')) return text; // Pas chiffré ? On retourne tel quel.

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = Buffer.from(SECRET_KEY, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error("Erreur de déchiffrement :", error);
    return "Donnée illisible"; // Fail-safe pour ne pas crasher l'app en prod
  }
}
