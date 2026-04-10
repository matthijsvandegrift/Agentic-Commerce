"use client";

import { ProductList } from "./ProductCard";
import { CartSummary, CheckoutConfirm } from "./CartSummary";
import { StoreCard } from "./StoreCard";
import { LoyaltyCard } from "./LoyaltyCard";
import { OrderStatus } from "./OrderStatus";
import { HandoffCard } from "./HandoffCard";

interface ToolResult {
  type: string;
  data: any;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolResults?: ToolResult[];
  onAddToCart?: (productId: string) => void;
  onCheckout?: () => void;
}

export function MessageBubble({
  role,
  content,
  imageUrl,
  toolResults,
  onAddToCart,
  onCheckout,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              AI
            </div>
            <span className="text-xs text-gray-400">Assistent</span>
          </div>
        )}

        {/* User-uploaded image */}
        {isUser && imageUrl && (
          <div className="mb-2 flex justify-end">
            <img
              src={imageUrl}
              alt="Geüploade afbeelding"
              className="max-w-48 max-h-48 rounded-xl object-cover border border-gray-200"
            />
          </div>
        )}

        {/* Message bubble */}
        {content && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "text-white rounded-br-md"
                : "bg-chat-assistant text-gray-800 rounded-bl-md"
            }`}
            style={
              isUser
                ? { backgroundColor: "var(--tenant-chat-user)" }
                : undefined
            }
          >
            {content}
          </div>
        )}

        {/* Tool results */}
        {toolResults &&
          (() => {
            const seenProductIds = new Set<string>();
            return toolResults.map((result, i) => (
              <div key={i}>
                {result.type === "product_list" &&
                  result.data.products && (
                    <ProductList
                      products={result.data.products.filter(
                        (p: { id: string }) => {
                          if (seenProductIds.has(p.id)) return false;
                          seenProductIds.add(p.id);
                          return true;
                        }
                      )}
                      onAddToCart={onAddToCart}
                    />
                  )}
                {result.type === "product_detail" &&
                  result.data &&
                  !result.data.error && (
                    <ProductList
                      products={[result.data]}
                      onAddToCart={onAddToCart}
                    />
                  )}
                {result.type === "cart_update" && result.data.cart && (
                  <CartSummary cart={result.data.cart} onCheckout={onCheckout} />
                )}
                {result.type === "checkout_confirm" &&
                  result.data.orderId && (
                    <CheckoutConfirm order={result.data} />
                  )}
                {result.type === "store_info" &&
                  result.data &&
                  !result.data.error &&
                  (result.data.stores
                    ? result.data.stores.map((s: any, j: number) => (
                        <StoreCard key={j} store={s} />
                      ))
                    : <StoreCard store={result.data} />)}
                {result.type === "loyalty_info" &&
                  result.data &&
                  !result.data.error && <LoyaltyCard data={result.data} />}
                {result.type === "order_status" &&
                  result.data &&
                  !result.data.error && <OrderStatus order={result.data} />}
                {result.type === "human_handoff" && result.data && (
                  <HandoffCard data={result.data} />
                )}
              </div>
            ));
          })()}
      </div>
    </div>
  );
}
