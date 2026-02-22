"use client";

import { Mic, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

export default function VoiceAssistantButton() {
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const startListening = () => {
    // 1. Vérifier si le navigateur du téléphone supporte la reconnaissance vocale
    // ✅ CORRECTION : (window as any) pour calmer TypeScript sur les API expérimentales
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Votre navigateur ne supporte pas la commande vocale. Essayez Chrome ou Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR'; // Langue française
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // 2. Le micro s'allume avec succès
    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Je vous écoute...", { id: "voice-status", duration: 3000 });
      if (navigator.vibrate) navigator.vibrate(50); // Petit retour haptique
    };

    // 3. Traitement de la parole
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Le producteur a dit : ", transcript);
      toast.success(`Compris : "${transcript}"`, { id: "voice-status" });

      // --- LOGIQUE DE NAVIGATION VOCALE ---
      if (transcript.includes("récolte") || transcript.includes("déclarer")) {
        router.push("/producer/harvest/new");
      } 
      // ✅ CORRECTION : Ajout de "lot" à la place/en plus de "sac"
      else if (transcript.includes("scanner") || transcript.includes("lot") || transcript.includes("sac") || transcript.includes("code")) {
        router.push("/producer/scan");
      } 
      else if (transcript.includes("parcelle") || transcript.includes("terre") || transcript.includes("champ")) {
        router.push("/producer/plots");
      } 
      else {
        // ✅ CORRECTION : Mise à jour du message d'aide
        toast.warning("Je n'ai pas compris. Essayez de dire : 'Déclarer récolte', 'Scanner lot' ou 'Mes parcelles'.", { id: "voice-status", duration: 4000 });
      }
    };

    // 4. GESTION DES ERREURS
    recognition.onerror = (event: any) => {
      console.error("Erreur micro:", event.error);
      setIsListening(false);

      if (event.error === 'not-allowed') {
        toast.error("Accès au micro refusé. Veuillez l'autoriser en haut de l'écran.", { id: "voice-status", duration: 5000 });
      } else if (event.error === 'service-not-allowed') {
        toast.error("Votre navigateur bloque le service vocal. Essayez sur Google Chrome.", { id: "voice-status", duration: 6000 });
      } else if (event.error === 'no-speech') {
        toast.warning("Je n'ai rien entendu.", { id: "voice-status" });
      } else {
        toast.error(`Erreur micro : ${event.error}`, { id: "voice-status" });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // 5. Lancement sécurisé
    try {
      recognition.start();
    } catch (e) {
      toast.error("Impossible de lancer le micro. Actualisez la page.");
      setIsListening(false);
    }
  };

  return (
    <button 
      onClick={startListening}
      disabled={isListening}
      className={`p-3 rounded-full backdrop-blur-md transition shadow-lg flex items-center justify-center ${
        isListening 
          ? "bg-white text-[#009A44] animate-pulse" 
          : "bg-white/20 text-white hover:bg-white/30"
      }`}
      aria-label="Assistant Vocal"
    >
      {isListening ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
    </button>
  );
}
