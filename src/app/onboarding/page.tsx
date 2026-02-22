import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function OnboardingSplashPage() {
  const session = await getServerSession(authOptions);

  // 1. Vérification plus large de la session
  // On regarde si l'utilisateur existe, peu importe si c'est via email ou un ID
  if (!session?.user) {
    redirect("/auth/login");
  }

  // 2. Récupération via le numéro de téléphone (votre identifiant unique)
  // On utilise l'email de la session s'il contient le numéro, ou on peut tester d'autres champs
  const identifier = session.user.email || (session.user as any).phone;

  if (!identifier) {
    console.error("❌ Aucun identifiant trouvé dans la session");
    redirect("/auth/login?error=SessionIncomplete");
  }

  const user = await prisma.user.findUnique({
    where: { phoneNumber: identifier },
    select: { role: true }
  });

  // 3. Si l'utilisateur n'existe pas encore en base
  if (!user) {
    redirect("/auth/login?error=UserNotFound");
  }

  // 4. L'AIGUILLAGE (Best Practice : Switch case)
  console.log(`🚀 Redirection de l'utilisateur avec le rôle : ${user.role}`);

  switch (user.role) {
    case "ADMIN":
      redirect("/admin/dashboard");
    case "COOPERATIVE":
      redirect("/cooperative/dashboard");
    case "PRODUCER":
      redirect("/producer/dashboard");
    case "TRANSPORTER":
      redirect("/transporter/dashboard");
    case "BANK":
      redirect("/bank/dashboard");
    case "PENDING": 
      redirect("/auth/pending"); 
    default:
      redirect("/auth/login?error=RoleNotDefined");
  }
}
