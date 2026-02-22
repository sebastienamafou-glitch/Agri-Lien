import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Numéro de Téléphone",
      credentials: {
        phoneNumber: { label: "Téléphone", type: "text" },
        phone: { label: "Téléphone", type: "text" },
        otp: { label: "Code OTP", type: "password" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials: any) {
        console.log("📥 [NEXTAUTH] Données reçues du formulaire :", credentials);

        const phoneInputRaw = credentials?.phoneNumber || credentials?.phone;
        const codeInputRaw = credentials?.otp || credentials?.password;

        if (!phoneInputRaw || !codeInputRaw) {
          console.log("❌ [NEXTAUTH] ERREUR : Il manque le téléphone ou le code.");
          throw new Error("Infos manquantes");
        }

        let phoneInput = phoneInputRaw.trim().replace(/\s/g, '');
        
        if (!phoneInput.startsWith('+')) {
           phoneInput = `+225${phoneInput}`;
        }
        
        console.log(`🔍 [NEXTAUTH] Recherche en BDD pour : ${phoneInput}`);

        const user = await prisma.user.findUnique({
          where: { phoneNumber: phoneInput },
        });

        if (!user) {
          console.log(`❌ [NEXTAUTH] Utilisateur introuvable : ${phoneInput}`);
          throw new Error("Utilisateur inconnu");
        }

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

  // 🗑️ Le bloc "cookies" personnalisé a été supprimé ici pour laisser NextAuth gérer le mode Secure automatiquement sur Vercel.
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
};
