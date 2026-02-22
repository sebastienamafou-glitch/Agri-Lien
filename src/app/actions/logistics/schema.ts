import { z } from "zod";
import { TransportStatus } from "@prisma/client";

/**
 * Validation des coordonnées GPS limitées à la zone Côte d'Ivoire
 * pour éviter les erreurs de saisie aberrantes.
 */
const locationSchema = z.object({
  latitude: z.number()
    .min(4.3, "La latitude doit être en Côte d'Ivoire (min 4.3)")
    .max(10.8, "La latitude doit être en Côte d'Ivoire (max 10.8)"),
  longitude: z.number()
    .min(-8.7, "La longitude doit être en Côte d'Ivoire (min -8.7)")
    .max(-2.4, "La longitude doit être en Côte d'Ivoire (max -2.4)"),
});

/**
 * Schéma pour la création d'un ordre de transport
 * Aligné sur le modèle TransportOrder du schema.prisma
 */
export const createTransportOrderSchema = z.object({
  producerId: z.string().uuid("ID Producteur invalide"),
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
  status: z.nativeEnum(TransportStatus).default(TransportStatus.PENDING),
});

// Types TypeScript dérivés pour l'usage dans l'application
export type CreateTransportOrderDTO = z.infer<typeof createTransportOrderSchema>;

export interface TransportOrderWithCoords extends CreateTransportOrderDTO {
  id: string;
  requestedAt: Date;
  transporterId?: string | null;
}
