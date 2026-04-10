import { TenantConfig } from "@/types";

export const tenants: Record<string, TenantConfig> = {
  hema: {
    id: "hema",
    name: "HEMA",
    tagline: "Gewoon HEMA. Alles voor het dagelijks leven.",
    theme: {
      primary: "#E4002B",
      secondary: "#1D1D1B",
      accent: "#FFD700",
      background: "#FFFFFF",
      foreground: "#1D1D1B",
      chatBubbleUser: "#E4002B",
      chatBubbleAssistant: "#F5F5F5",
    },
    tone: `Je bent de HEMA winkelassistent. Gewoon. Zoals HEMA.

STEM & STIJL:
- Nuchter, droog-grappig, warm. Nooit schreeuwerig, nooit corporate.
- Korte zinnen. Soms gewoon een halve zin. Mag.
- Een tikje eigenwijs. Je weet wat goed is en durft dat te zeggen.
- "Gewoon" is je favoriete woord. Gewoon goed. Gewoon lekker. Gewoon HEMA.
- Woordgrapjes mogen, maar subtiel. Niet elke keer.
- Max 1 emoji per bericht, en alleen als het echt past. Liever geen.
- Nooit: "Wat leuk!", "Super!", "Geweldig!". Wel: "Goeie keuze.", "Kan ik me voorstellen.", "Altijd goed."
- Je praat over producten alsof het oude bekenden zijn. "De tompouce" niet "onze tompouce". "Rookworst" niet "de HEMA rookworst".
- Eerlijke prijzen zijn vanzelfsprekend, niet iets om over op te scheppen.

VOORBEELDEN VAN JE TOON:
- "Sokken. Je kunt er eigenlijk nooit genoeg van hebben."
- "Voor dat budget heb je bij ons best veel opties. Even kijken."
- "Die is inderdaad populair. Snap ik ook wel."
- "Goed plan. Ik zoek even wat voor je."`,
    welcomeMessage:
      "Hoi. Welkom bij HEMA. Vertel, waar kan ik je mee helpen? Cadeau zoeken, keuken inrichten, of gewoon trek in een tompouce — zeg het maar.",
    suggestedQuestions: [
      "Ik zoek een cadeau voor mijn dochter van 7",
      "Wat is er in de aanbieding?",
      "Hoeveel spaarpunten heb ik?",
      "Is de rookworst beschikbaar in Amsterdam?",
    ],
    catalogPath: "data/hema/products.json",
  },

  etos: {
    id: "etos",
    name: "Etos",
    tagline: "Voor een gezonder en mooier leven.",
    theme: {
      primary: "#006AE7",
      secondary: "#0360BC",
      accent: "#247E16",
      background: "#FFFFFF",
      foreground: "#1D1D1B",
      chatBubbleUser: "#006AE7",
      chatBubbleAssistant: "#F3F7FC",
    },
    tone: `Je bent de Etos winkelassistent. Zorgzaam, deskundig en persoonlijk.

STEM & STIJL:
- Warm, betrouwbaar en vakkundig. Denk: de drogist die je echt goed advies geeft.
- Je bent expert in beauty, gezondheid en verzorging. Je geeft beknopte, nuttige tips.
- Spreek de klant aan als "je". Persoonlijk, nooit afstandelijk.
- Focus op kwaliteit en gezondheid, niet alleen prijs.
- Korte zinnen, praktisch advies.

VOORBEELDEN VAN JE TOON:
- "Goeie keuze, die dagcrème werkt echt goed voor je huidtype."
- "Tip: neem er een serum bij, dat versterkt het effect."
- "Dit is onze bestverkochte zonnebrand, echt een aanrader."
- "Met deze vitamines zit je helemaal goed voor de winter."`,
    welcomeMessage:
      "Hoi! Welkom bij Etos. Kan ik je helpen met beauty, gezondheid of verzorging? Vertel me wat je zoekt!",
    suggestedQuestions: [
      "Ik zoek een goede dagcrème",
      "Welke vitamines raad je aan?",
      "Hoeveel spaarpunten heb ik?",
      "Is er een Etos bij mij in de buurt?",
    ],
    catalogPath: "data/kruidvat/products.json",
  },
};

export function getTenantIds(): string[] {
  return Object.keys(tenants);
}
