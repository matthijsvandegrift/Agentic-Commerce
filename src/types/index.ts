export interface ProductVariant {
  id: string;
  label: string; // e.g. "Maat M", "Blauw"
  type: string; // "size" | "color" | etc
  priceModifier?: number;
  inStock: boolean;
}

export interface Promotion {
  label: string; // e.g. "2e halve prijs"
  endDate: string; // ISO date
  discountPercent?: number;
}

export interface StoreStock {
  storeId: string;
  storeName: string;
  available: boolean;
  quantity?: number;
}

export interface UserProfile {
  mentionedAges?: string[];
  interests?: string[];
  budget?: { min?: number; max?: number };
  occasion?: string;
  preferences?: Record<string, string>;
  shoppingFor?: string; // "zelf" | "cadeau" | etc
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // EUR, e.g. 14.99
  salePrice?: number;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  imageUrls?: string[];
  attributes: Record<string, string>;
  tags: string[];
  inStock: boolean;
  stockLevel?: number;
  variants?: ProductVariant[];
  promotion?: Promotion;
  storeAvailability?: StoreStock[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    chatBubbleUser: string;
    chatBubbleAssistant: string;
  };
  tone: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  catalogPath: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResultDisplay[];
  timestamp: number;
}

export interface ToolResultDisplay {
  type: "product_list" | "product_detail" | "cart_update" | "checkout_confirm";
  data: unknown;
}
