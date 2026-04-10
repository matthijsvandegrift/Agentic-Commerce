export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // EUR, e.g. 14.99
  category: string;
  imageUrl?: string;
  attributes: Record<string, string>;
  tags: string[];
  inStock: boolean;
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
