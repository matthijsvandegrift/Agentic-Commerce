export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  initialMessage: string;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "birthday-gift",
    name: "Cadeau zoeken",
    description: "Volledige gift-finding journey met personalisatie",
    initialMessage:
      "Ik zoek iets leuks voor een kinderfeestje, mijn dochter wordt 7 en ze is gek op dinosaurussen",
  },
  {
    id: "loyalty-redemption",
    name: "Spaarpunten",
    description: "Loyalty balance check en punten inwisselen",
    initialMessage: "Hoeveel spaarpunten heb ik? En waar kan ik ze voor gebruiken?",
  },
  {
    id: "store-pickup",
    name: "Winkel & Afhalen",
    description: "Voorraad checken en reserveren in winkel",
    initialMessage:
      "Is de rookworst beschikbaar in de winkel op het Rembrandtplein?",
  },
  {
    id: "visual-search",
    name: "Foto zoeken",
    description: "Upload een foto om vergelijkbare producten te vinden",
    initialMessage: "Ik zoek iets dat lijkt op wat ik op een foto heb",
  },
  {
    id: "human-handoff",
    name: "Doorverbinden",
    description: "Test de handoff naar een menselijke medewerker",
    initialMessage:
      "Ik heb een klacht over mijn laatste bestelling, het product was beschadigd",
  },
  {
    id: "full-journey",
    name: "Volledige Journey",
    description: "Van browsen tot checkout met kortingscode",
    initialMessage: "Ik wil mijn keuken een beetje opfrissen, wat hebben jullie?",
  },
];
