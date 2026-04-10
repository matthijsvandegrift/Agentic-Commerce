import { CartItem, Product } from "@/types";

export function addToCart(
  cart: CartItem[],
  product: Product,
  quantity: number = 1
): CartItem[] {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    return cart.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }
  return [...cart, { product, quantity }];
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.product.id !== productId);
}

export function updateQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return removeFromCart(cart, productId);
  return cart.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item
  );
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function formatCartSummary(cart: CartItem[]): {
  items: { name: string; quantity: number; price: number; lineTotal: number }[];
  total: number;
  itemCount: number;
} {
  return {
    items: cart.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      lineTotal: item.product.price * item.quantity,
    })),
    total: getCartTotal(cart),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
  };
}
