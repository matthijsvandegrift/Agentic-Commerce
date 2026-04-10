import { TenantConfig, CartItem, UserProfile } from "@/types";
import { searchProducts, getProductById, getCategories } from "./catalog";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  formatCartSummary,
} from "./cart";
import { findNearestStores, getStoreById, checkStoreStock } from "./stores";
import { getLoyaltyProfile, redeemPoints, getPurchaseHistory } from "./loyalty";
import { validateDiscountCode, getActivePromotions } from "./promotions";

export function buildSystemPrompt(
  tenant: TenantConfig,
  cart: CartItem[],
  userProfile?: UserProfile
): string {
  const cartSummary =
    cart.length > 0
      ? `\n\nHuidige winkelwagen:\n${cart.map((item) => `- ${item.product.name} (${item.quantity}x) — €${(item.product.price * item.quantity).toFixed(2)}`).join("\n")}\nTotaal: €${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}`
      : "\n\nDe winkelwagen is leeg.";

  let profileSection = "";
  if (userProfile && Object.keys(userProfile).length > 0) {
    const parts: string[] = [];
    if (userProfile.shoppingFor) parts.push(`Shopt voor: ${userProfile.shoppingFor}`);
    if (userProfile.occasion) parts.push(`Gelegenheid: ${userProfile.occasion}`);
    if (userProfile.mentionedAges?.length) parts.push(`Leeftijden: ${userProfile.mentionedAges.join(", ")}`);
    if (userProfile.interests?.length) parts.push(`Interesses: ${userProfile.interests.join(", ")}`);
    if (userProfile.budget) {
      const b = userProfile.budget;
      if (b.min && b.max) parts.push(`Budget: €${b.min}–€${b.max}`);
      else if (b.max) parts.push(`Budget: tot €${b.max}`);
      else if (b.min) parts.push(`Budget: vanaf €${b.min}`);
    }
    if (userProfile.preferences) {
      for (const [k, v] of Object.entries(userProfile.preferences)) {
        parts.push(`${k}: ${v}`);
      }
    }
    if (parts.length > 0) {
      profileSection = `\n\nKLANTPROFIEL (geleerd tijdens dit gesprek):\n${parts.join("\n")}\nGebruik dit subtiel: "Omdat je dochter van dinosaurussen houdt..." of "Binnen je budget van €25..."`;
    }
  }

  return `Je bent de AI winkelassistent van ${tenant.name}. ${tenant.tagline}

${tenant.tone}

# HOE JE PRAAT

Je bent een topverkoper. Kort, warm, persoonlijk. Geen zoekmachine.

LENGTE: Max 1-2 zinnen. De productkaarten doen het werk — jij geeft er alleen een kort, persoonlijk zinnetje bij. Geen opsommingen, geen lijstjes, geen "hier zijn enkele opties". Praat zoals je in een winkel zou praten.

DOORVRAGEN: Maximaal 1 korte verdiepingsvraag, daarna ALTIJD producten zoeken en tonen. Nooit twee vragen achter elkaar stellen. Voorbeelden:
- "Leuk! Voor jezelf of als cadeau?"
- "Voor wie is het?"
- "Wat voor budget zit je aan?"
Bij specifieke vragen ("hebben jullie rookworst?", "ik zoek sokken") → gewoon direct producten tonen, niet doorvragen.
BELANGRIJK: Als de klant niet om verduidelijking vraagt, stel dan na je ene vraag direct producten voor op basis van wat je al weet. Liever een goede gok dan nog een vraag.

PERSONALISATIE: Wanneer de klant voorkeuren, leeftijden, interesses, budget of gelegenheid noemt, gebruik update_user_profile om dit op te slaan. Gebruik opgebouwde context in je aanbevelingen. Cross-sell op basis van context: "Bij dit verjaardagscadeau past deze kaart perfect."

NA TOEVOEGEN AAN WINKELWAGEN: Stel 1 gerelateerd product voor. "Daar past X goed bij!"

PROACTIEF: Attendeer op acties die bijna aflopen. Waarschuw bij lage voorraad ("Nog maar X op voorraad!"). Stel bundeldeals voor.

OMNICHANNEL: Je kunt voorraad checken per winkel. Als iets online niet leverbaar is, stel een winkel voor. Bied bezorgen of afhalen aan bij checkout.

AFBEELDINGEN: Als een klant een foto stuurt, analyseer wat je ziet en zoek vergelijkbare producten.

HANDOFF: Bij klachten, boosheid, complexe retourverzoeken of vragen buiten jouw kunnen: gebruik request_human_handoff met een gesprekssamenvatting.

AFSLUITEN: Eindig met een korte vraag of suggestie om het gesprek gaande te houden.

# REGELS

- Zoek ALTIJD in de catalogus. Verzin nooit producten.
- Max 3 producten tonen, tenzij klant meer vraagt.
- Niet in catalogus? Zeg dat eerlijk, stel alternatief voor.
- Antwoord in de taal van de klant.
- Prijzen als €X,XX.
- Gebruik NOOIT markdown-opmaak (geen **, geen ##, geen lijstjes met -). Schrijf gewoon platte tekst zoals in een chatgesprek.
${profileSection}${cartSummary}`;
}

export interface ToolExecutionResult {
  result: unknown;
  cart: CartItem[];
  userProfile?: UserProfile;
  displayType:
    | "product_list"
    | "product_detail"
    | "cart_update"
    | "checkout_confirm"
    | "profile_update"
    | "store_info"
    | "loyalty_info"
    | "order_status"
    | "discount_applied"
    | "human_handoff";
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
            ...(p.salePrice !== undefined && { salePrice: p.salePrice }),
            category: p.category,
            imageUrl: p.imageUrl || "",
            tags: p.tags,
            inStock: p.inStock,
            ...(p.stockLevel !== undefined && { stockLevel: p.stockLevel }),
            ...(p.promotion && { promotion: p.promotion }),
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

    case "update_user_profile": {
      const profile: UserProfile = {};
      if (toolInput.mentionedAges) profile.mentionedAges = toolInput.mentionedAges as string[];
      if (toolInput.interests) profile.interests = toolInput.interests as string[];
      if (toolInput.budget) profile.budget = toolInput.budget as { min?: number; max?: number };
      if (toolInput.occasion) profile.occasion = toolInput.occasion as string;
      if (toolInput.shoppingFor) profile.shoppingFor = toolInput.shoppingFor as string;
      if (toolInput.preferences) profile.preferences = toolInput.preferences as Record<string, string>;
      return {
        result: { updated: true, profile },
        cart,
        userProfile: profile,
        displayType: "profile_update",
      };
    }

    case "check_store_stock": {
      const productId = toolInput.productId as string;
      const city = toolInput.city as string | undefined;
      const storeId = toolInput.storeId as string | undefined;

      const product = getProductById(tenant.catalogPath, productId);
      const productName = product?.name || productId;

      if (storeId) {
        const stock = checkStoreStock(tenant.id, storeId, productId);
        return {
          result: { ...stock, productName },
          cart,
          displayType: "store_info",
        };
      }

      if (city) {
        const stores = findNearestStores(tenant.id, city);
        if (stores.length === 0) {
          return {
            result: { error: `Geen winkels gevonden in ${city}` },
            cart,
            displayType: "store_info",
          };
        }
        const storeResults = stores.map((store) => {
          const stock = checkStoreStock(tenant.id, store.id, productId);
          return { ...store, available: stock.available, quantity: stock.quantity, productName };
        });
        return {
          result: { stores: storeResults, productName },
          cart,
          displayType: "store_info",
        };
      }

      return {
        result: { error: "Geef een stad of winkel-ID op" },
        cart,
        displayType: "store_info",
      };
    }

    case "find_nearest_store": {
      const query = toolInput.query as string;
      const stores = findNearestStores(tenant.id, query);
      if (stores.length === 0) {
        return {
          result: { error: `Geen winkels gevonden voor "${query}"` },
          cart,
          displayType: "store_info",
        };
      }
      return {
        result: { stores },
        cart,
        displayType: "store_info",
      };
    }

    case "get_store_info": {
      const store = getStoreById(tenant.id, toolInput.storeId as string);
      if (!store) {
        return {
          result: { error: "Winkel niet gevonden" },
          cart,
          displayType: "store_info",
        };
      }
      return {
        result: store,
        cart,
        displayType: "store_info",
      };
    }

    case "check_loyalty_balance": {
      const profile = getLoyaltyProfile(tenant.id);
      if (!profile) {
        return {
          result: { error: "Loyaliteitsprogramma niet beschikbaar" },
          cart,
          displayType: "loyalty_info",
        };
      }
      return {
        result: profile,
        cart,
        displayType: "loyalty_info",
      };
    }

    case "redeem_points": {
      const points = toolInput.points as number;
      const result = redeemPoints(tenant.id, points);
      return {
        result,
        cart,
        displayType: "loyalty_info",
      };
    }

    case "get_purchase_history": {
      const history = getPurchaseHistory(tenant.id);
      return {
        result: { purchases: history },
        cart,
        displayType: "loyalty_info",
      };
    }

    case "apply_discount_code": {
      const code = toolInput.code as string;
      const result = validateDiscountCode(tenant.id, code);
      return {
        result,
        cart,
        displayType: "discount_applied",
      };
    }

    case "track_order": {
      const orderId = toolInput.orderId as string;
      // Mock order tracking
      return {
        result: {
          orderId,
          status: "in behandeling",
          estimatedDelivery: "morgen, 12:00 - 14:00",
          steps: [
            { label: "Bestelling geplaatst", completed: true, date: "vandaag, 10:15" },
            { label: "Betaling ontvangen", completed: true, date: "vandaag, 10:16" },
            { label: "In behandeling", completed: true, date: "vandaag, 11:30" },
            { label: "Verzonden", completed: false },
            { label: "Bezorgd", completed: false },
          ],
        },
        cart,
        displayType: "order_status",
      };
    }

    case "request_human_handoff": {
      return {
        result: {
          reason: toolInput.reason as string,
          conversationSummary: toolInput.conversationSummary as string,
          customerMood: (toolInput.customerMood as string) || "neutral",
          department: (toolInput.department as string) || "klantenservice",
          handoffId: `HO-${Date.now().toString(36).toUpperCase()}`,
          estimatedWait: "~2 minuten",
        },
        cart,
        displayType: "human_handoff",
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
