import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Numéro de Téléphone",
      // ✅ CORRECTION : On déclare tous les alias possibles pour que NextAuth ne les supprime pas
      credentials: {
        phoneNumber: { label: "Téléphone", type: "text" },
        phone: { label: "Téléphone", type: "text" },
        otp: { label: "Code OTP", type: "password" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials: any) {
        console.log("📥 [NEXTAUTH] Données reçues du formulaire :", credentials);

        // 1. Récupération flexible (selon ce que le frontend a réellement envoyé)
        const phoneInputRaw = credentials?.phoneNumber || credentials?.phone;
        const codeInputRaw = credentials?.otp || credentials?.password;

        if (!phoneInputRaw || !codeInputRaw) {
          console.log("❌ [NEXTAUTH] ERREUR : Il manque le téléphone ou le code.");
          throw new Error("Infos manquantes");
        }

        // 2. Normalisation : On s'assure que le numéro commence par +225
        let phoneInput = phoneInputRaw.trim().replace(/\s/g, '');
        
        if (!phoneInput.startsWith('+')) {
           phoneInput = `+225${phoneInput}`;
        }
        
        console.log(`🔍 [NEXTAUTH] Recherche en BDD pour : ${phoneInput}`);

        // 3. Chercher l'utilisateur dans la DB
        const user = await prisma.user.findUnique({
          where: { phoneNumber: phoneInput },
        });

        if (!user) {
          console.log(`❌ [NEXTAUTH] Utilisateur introuvable : ${phoneInput}`);
          throw new Error("Utilisateur inconnu");
        }

        // 4. Vérification OTP (123456 pour le dev)
        if (codeInputRaw === "123456") {
          console.log(`✅ [NEXTAUTH] Connexion réussie ! Rôle : ${user.role}`);
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.phoneNumber,
            role: user.role,
          };
        }

        console.log("❌ [NEXTAUTH] Mauvais code OTP renseigné.");
        throw new Error("Code incorrect");
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
};
