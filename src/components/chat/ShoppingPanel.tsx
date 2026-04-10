"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/types";

interface SuggestedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ShoppingPanelProps {
  cart: CartItem[];
  suggestedProducts?: SuggestedProduct[];
  onAddSuggested: (productId: string) => void;
  onCheckout: () => void;
}

// Suggested product IDs with discounts (images come from catalog)
const suggestionMeta: Record<string, number> = {
  "hema-007": 20,
  "hema-030": 15,
  "hema-017": 25,
  "hema-010": 10,
  "hema-001": 0,
  "hema-026": 30,
};

function CountdownTimer() {
  const [time, setTime] = useState({ h: 2, m: 47, s: 13 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-1 font-mono text-sm font-bold">
      <span className="bg-black/80 text-white px-1.5 py-0.5 rounded">{pad(time.h)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-black/80 text-white px-1.5 py-0.5 rounded">{pad(time.m)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-black/80 text-white px-1.5 py-0.5 rounded">{pad(time.s)}</span>
    </div>
  );
}

export function ShoppingPanel({ cart, suggestedProducts, onAddSuggested, onCheckout }: ShoppingPanelProps) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartProductIds = new Set(cart.map((i) => i.product.id));

  const filteredSuggestions = (suggestedProducts || [])
    .filter((s) => !cartProductIds.has(s.id) && s.id in suggestionMeta)
    .map((s) => ({ ...s, discount: suggestionMeta[s.id] || 10 }));

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Panel header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span className="font-semibold text-sm text-gray-800">Winkelwagen</span>
          {cart.length > 0 && (
            <span className="ml-auto text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Cart items */}
        {cart.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Je winkelwagen is leeg</p>
            <p className="text-xs text-gray-300 mt-1">Vraag de assistent om producten</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2.5 bg-white rounded-lg p-2.5 shadow-sm">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                    {item.product.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-[11px] text-gray-400">{item.quantity}x</p>
                </div>
                <span className="text-xs font-bold text-gray-700">
                  &euro;{(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}

            {/* Total + checkout */}
            <div className="bg-white rounded-lg p-3 shadow-sm mt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-800">Totaal</span>
                <span className="text-lg font-bold" style={{ color: "var(--tenant-primary)" }}>
                  &euro;{total.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                Afrekenen
              </button>
            </div>
          </div>
        )}

        {/* Personal discount ad */}
        <div className="mx-3 mt-4 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--tenant-primary), #ff6b35)" }}>
          <div className="px-4 py-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Persoonlijke aanbieding</span>
              <CountdownTimer />
            </div>
            <p className="font-bold text-sm">Gratis verzending bij bestelling nu!</p>
            <p className="text-xs opacity-80 mt-0.5">Alleen vandaag. Code: VANDAAG</p>
          </div>
        </div>

        {/* Suggested articles */}
        {filteredSuggestions.length > 0 && (
          <div className="p-3 mt-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Misschien ook leuk</p>
            <div className="space-y-2">
              {filteredSuggestions.map((item) => {
                const discountedPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={item.id} className="flex items-center gap-2.5 bg-white/60 rounded-lg p-2 border border-dashed border-gray-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover opacity-80" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">{item.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-600">
                          &euro;{discountedPrice.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          &euro;{item.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">
                          -{item.discount}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddSuggested(item.id)}
                      className="shrink-0 text-[10px] font-medium px-2 py-1.5 rounded-md text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--tenant-primary)" }}
                    >
                      + Toevoegen
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Second ad */}
        <div className="mx-3 mt-3 mb-4 bg-amber-50 rounded-xl border border-amber-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            <span className="text-xs font-semibold text-amber-800">Meer HEMA lid?</span>
          </div>
          <p className="text-[11px] text-amber-700">Verdien punten op elke aankoop. Je hebt al 2.450 punten!</p>
        </div>
      </div>
    </div>
  );
}
