"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="bg-red-500/20 p-3 rounded-full backdrop-blur-md hover:bg-red-500/30 transition shadow-lg flex items-center justify-center cursor-pointer"
      aria-label="Se déconnecter"
    >
      <LogOut size={24} className="text-white" />
    </button>
  );
}
