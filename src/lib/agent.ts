import { TenantConfig, CartItem } from "@/types";
import { searchProducts, getProductById, getCategories } from "./catalog";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  formatCartSummary,
} from "./cart";

export function buildSystemPrompt(
  tenant: TenantConfig,
  cart: CartItem[]
): string {
  const cartSummary =
    cart.length > 0
      ? `\n\nHuidige winkelwagen:\n${cart.map((item) => `- ${item.product.name} (${item.quantity}x) — €${(item.product.price * item.quantity).toFixed(2)}`).join("\n")}\nTotaal: €${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}`
      : "\n\nDe winkelwagen is leeg.";

  return `Je bent de AI winkelassistent van ${tenant.name}. ${tenant.tagline}

${tenant.tone}

# CONVERSATIE STIJL — GOUDEN REGELS

Je bent een TOPVERKOPER, geen zoekmachine. Je verkoopt zoals de beste winkelbediende ter wereld: kort, warm, en gericht.

## Kort & krachtig
- Maximaal 1-2 zinnen tekst per bericht. De productkaarten spreken voor zich.
- NOOIT producten opsommen in je tekst. Dat doen de kaarten al. Jij geeft alleen een korte, persoonlijke aanbeveling erbij.
- Geen opsommingstekens, geen lijstjes, geen "hier zijn enkele opties". Praat als een mens.

## Eerst begrijpen, dan verkopen — dit is CRUCIAAL
Een topverkoper schiet niet meteen in de oplossing. Je stelt EERST slimme vragen om te begrijpen wat de klant echt nodig heeft.

WANNEER JE EERST VRAAGT (geen producten tonen):
- Brede vragen: "wat hebben jullie?", "populairste producten", "ik zoek iets leuks"
  → Vraag: "Leuk! Is het voor jezelf of als cadeau?" of "Waar denk je aan — eten, wonen, of iets anders?"
- Cadeauvragen: "ik zoek een cadeau"
  → Vraag: "Voor wie is het? En heb je een budget in gedachten?"
- Categorie-vragen: "hebben jullie kleding?", "iets voor in de keuken?"
  → Vraag: "Zeker! Zoek je iets specifieks of mag ik je verrassen?"
- Vage behoeftes: "ik heb iets nodig", "help me"
  → Vraag een of twee korte vragen om richting te krijgen.

WANNEER JE DIRECT PRODUCTEN TOONT (1-2 max):
- Specifieke producten: "hebben jullie rookworst?", "ik zoek een tompouce"
- Concrete behoeftes: "ik heb sokken nodig maat 43", "tandpasta voor gevoelige tanden"
- Vervolgvragen na jouw probing: als je al hebt doorgevraagd, toon dan resultaten.

GOUDEN REGEL: bij twijfel → vraag eerst. Eén goede vraag is waardevoller dan vijf producten die niet passen.

## Proactief verkopen
- Na toevoegen aan winkelwagen: stel ONE gerelateerde product voor, niet meer. "Daar past X perfect bij!" + zoek dat product.
- Gebruik sociale bewijskracht: "Dit is onze bestseller" / "Klanten combineren dit vaak met..."
- Creëer urgentie waar gepast: "Populair product" / "Aanrader!"

## Toon
- Praat als een vriend die in de winkel werkt — warm, enthousiast, bondig.
- Eindig elk bericht met EEN duidelijke vraag of suggestie. Houd het gesprek gaande.
- Prijzen in euro's, formatteer als €X,XX.

## Zoeken
- Zoek ALTIJD in de catalogus voordat je producten aanbeveelt. Verzin NOOIT producten.
- Zoek maximaal 3 producten, tenzij de klant expliciet meer vraagt.
- Als iets niet in de catalogus staat: wees eerlijk en stel een alternatief voor.

## Taal
- Antwoord in de taal die de klant gebruikt.
${cartSummary}`;
}

export interface ToolExecutionResult {
  result: unknown;
  cart: CartItem[];
  displayType:
    | "product_list"
    | "product_detail"
    | "cart_update"
    | "checkout_confirm";
}

export function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  tenant: TenantConfig,
  cart: CartItem[]
): ToolExecutionResult {
  switch (toolName) {
    case "search_products": {
      const query = toolInput.query as string;
      const category = toolInput.category as string | undefined;
      const maxResults = (toolInput.maxResults as number) || 3;
      const products = searchProducts(
        tenant.catalogPath,
        query,
        category,
        maxResults
      );
      return {
        result: {
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            tags: p.tags,
            inStock: p.inStock,
          })),
          totalFound: products.length,
        },
        cart,
        displayType: "product_list",
      };
    }

    case "get_product_details": {
      const product = getProductById(
        tenant.catalogPath,
        toolInput.productId as string
      );
      if (!product) {
        return {
          result: { error: "Product niet gevonden" },
          cart,
          displayType: "product_detail",
        };
      }
      return { result: product, cart, displayType: "product_detail" };
    }

    case "add_to_cart": {
      const product = getProductById(
        tenant.catalogPath,
        toolInput.productId as string
      );
      if (!product) {
        return {
          result: { error: "Product niet gevonden" },
          cart,
          displayType: "cart_update",
        };
      }
      const quantity = (toolInput.quantity as number) || 1;
      const newCart = addToCart(cart, product, quantity);
      return {
        result: {
          added: { name: product.name, quantity, price: product.price },
          cart: formatCartSummary(newCart),
        },
        cart: newCart,
        displayType: "cart_update",
      };
    }

    case "remove_from_cart": {
      const productId = toolInput.productId as string;
      const item = cart.find((i) => i.product.id === productId);
      const newCart = removeFromCart(cart, productId);
      return {
        result: {
          removed: item ? item.product.name : productId,
          cart: formatCartSummary(newCart),
        },
        cart: newCart,
        displayType: "cart_update",
      };
    }

    case "update_cart_quantity": {
      const productId = toolInput.productId as string;
      const quantity = toolInput.quantity as number;
      const newCart = updateQuantity(cart, productId, quantity);
      return {
        result: { cart: formatCartSummary(newCart) },
        cart: newCart,
        displayType: "cart_update",
      };
    }

    case "get_cart": {
      return {
        result: formatCartSummary(cart),
        cart,
        displayType: "cart_update",
      };
    }

    case "checkout": {
      if (cart.length === 0) {
        return {
          result: { error: "Winkelwagen is leeg" },
          cart,
          displayType: "checkout_confirm",
        };
      }
      const summary = formatCartSummary(cart);
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      return {
        result: {
          orderId,
          status: "bevestigd",
          items: summary.items,
          total: summary.total,
          message: `Bestelling ${orderId} is geplaatst! Totaal: €${summary.total.toFixed(2)}. Je ontvangt een bevestigingsmail.`,
        },
        cart: [],
        displayType: "checkout_confirm",
      };
    }

    default:
      return {
        result: { error: `Onbekende tool: ${toolName}` },
        cart,
        displayType: "product_list",
      };
  }
}
