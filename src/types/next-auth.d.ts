import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

// On étend les types par défaut de NextAuth pour y ajouter nos champs personnalisés
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // On ajoute le rôle ici
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
