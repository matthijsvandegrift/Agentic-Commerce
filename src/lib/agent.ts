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

BELANGRIJK:
- Zoek ALTIJD in de catalogus voordat je producten aanbeveelt. Verzin NOOIT producten.
- Toon bij productresultaten: naam, prijs en een korte reden waarom het past.
- Prijzen in euro's, formatteer als €X,XX (Nederlands formaat).
- Stel proactief gerelateerde producten voor (cross-sell) na toevoegen aan winkelwagen.
- Bij afrekenen: geef een samenvatting van de winkelwagen en vraag om bevestiging.
- Houd antwoorden kort: 2-3 zinnen plus productresultaten.
- Antwoord in de taal die de klant gebruikt (Nederlands of Engels).
- Wees enthousiast maar niet opdringerig. Je bent een behulpzame expert.
- Als de klant iets vraagt dat niet in de catalogus staat, wees eerlijk en stel alternatieven voor.
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
      const maxResults = (toolInput.maxResults as number) || 5;
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
