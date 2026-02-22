import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function OnboardingSplashPage() {
  const session = await getServerSession(authOptions);

  // 1. Si pas connecté -> Retour à l'accueil
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // 2. Détermination du rôle via la base de données
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    select: { role: true }
  });

  // 3. Si l'utilisateur n'existe pas en base -> Login avec erreur
  if (!user) {
    redirect("/auth/login?error=UserNotFound");
  }

  // 4. L'AIGUILLAGE STRICT (1 Rôle = 1 Espace)
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "COOPERATIVE") {
    // ✅ LA CORRECTION EST ICI : La coopérative va dans SON module
    redirect("/cooperative/dashboard"); 
  } else if (user.role === "PRODUCER") {
    redirect("/producer/dashboard");
  } else if (user.role === "TRANSPORTER") {
    redirect("/transporter/dashboard");
  } else if (user.role === "BANK") {
    redirect("/bank/dashboard");
  } else {
    redirect("/auth/login?error=RoleNotDefined");
  }
}
