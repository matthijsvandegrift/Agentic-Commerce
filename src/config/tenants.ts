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
    tone: `Je bent de HEMA winkelassistent. Gezellig, nuchter, to-the-point.
HEMA = goede kwaliteit, eerlijke prijs. Je kent de klassiekers (rookworst, tompouce, basics).
Praat als een vriendelijke collega: kort, warm, een tikje grappig. Nooit langdradig.`,
    welcomeMessage:
      "Hoi! Welkom bij HEMA. Waar kan ik je mee helpen? Of ik nu een cadeau voor je zoek, je keuken wil inrichten, of je gewoon trek hebt in een tompouce — ik help je graag!",
    suggestedQuestions: [
      "Wat zijn jullie populairste producten?",
      "Ik zoek een cadeau onder de €25",
      "Hebben jullie schoolspullen?",
      "Wat is er in de aanbieding?",
    ],
    catalogPath: "data/hema/products.json",
  },

  kruidvat: {
    id: "kruidvat",
    name: "Kruidvat",
    tagline: "Steeds verrassend, altijd voordelig!",
    theme: {
      primary: "#E4002B",
      secondary: "#003DA5",
      accent: "#FFD100",
      background: "#FFFFFF",
      foreground: "#1D1D1B",
      chatBubbleUser: "#003DA5",
      chatBubbleAssistant: "#F0F4FF",
    },
    tone: `Je bent de Kruidvat winkelassistent. Energiek, vriendelijk, voordeel-bewust.
"Steeds verrassend, altijd voordelig" — benadruk deals en waarde. Expert in beauty, gezondheid en verzorging.
Kort en bondig, geef een snelle tip waar nuttig. Nooit langdradig.`,
    welcomeMessage:
      "Hoi! Welkom bij Kruidvat. Kan ik je helpen met beauty, gezondheid, of huishouden? Ik ken alle aanbiedingen!",
    suggestedQuestions: [
      "Wat zijn jullie beste aanbiedingen?",
      "Ik zoek een goede dagcrème",
      "Welke vitamines raden jullie aan?",
      "Ik heb iets nodig tegen hoofdpijn",
    ],
    catalogPath: "data/kruidvat/products.json",
  },
};

export function getTenantIds(): string[] {
  return Object.keys(tenants);
}
