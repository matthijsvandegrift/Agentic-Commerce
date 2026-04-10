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
  tenantName?: string;
  loyaltyName?: string;
  suggestedProducts?: SuggestedProduct[];
  onAddSuggested: (productId: string) => void;
  onCheckout: () => void;
}

const suggestionMeta: Record<string, number> = {
  "hema-007": 20, "hema-030": 15, "hema-017": 25, "hema-010": 10,
  "etos-001": 15, "etos-007": 20, "etos-011": 10, "etos-023": 25,
};

type CheckoutStep = "cart" | "address" | "payment" | "confirmed";

function CountdownTimer() {
  const [time, setTime] = useState({ m: 9, s: 59 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) return { m: 0, s: 0 };
        return { m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex gap-0.5 font-mono text-xs font-bold">
      <span className="bg-black/80 text-white px-1 py-0.5 rounded">{pad(time.m)}</span>
      <span className="text-white/60">:</span>
      <span className="bg-black/80 text-white px-1 py-0.5 rounded">{pad(time.s)}</span>
    </div>
  );
}

export function ShoppingPanel({ cart, tenantName, loyaltyName, suggestedProducts, onAddSuggested, onCheckout }: ShoppingPanelProps) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [address, setAddress] = useState({ street: "", city: "", postalCode: "" });
  const [delivery, setDelivery] = useState<"bezorgen" | "ophalen">("bezorgen");
  const [payment, setPayment] = useState<"ideal" | "creditcard">("ideal");
  const [orderId, setOrderId] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartProductIds = new Set(cart.map((i) => i.product.id));
  const filteredSuggestions = (suggestedProducts || [])
    .filter((s) => !cartProductIds.has(s.id) && s.id in suggestionMeta)
    .map((s) => ({ ...s, discount: suggestionMeta[s.id] || 10 }));

  // Reset to cart when cart changes
  useEffect(() => {
    if (cart.length === 0 && step !== "confirmed") setStep("cart");
  }, [cart, step]);

  function handleConfirmOrder() {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const tc = `3S${Math.random().toString(36).substring(2, 14).toUpperCase()}NL`;
    setOrderId(id);
    setTrackingCode(tc);
    setStep("confirmed");
    onCheckout();
  }

  const addressValid = address.street.length > 2 && address.city.length > 1 && address.postalCode.length > 3;

  // CHECKOUT: Address step
  if (step === "address") {
    return (
      <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
          <button onClick={() => setStep("cart")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-semibold text-sm text-gray-800">Bezorggegevens</span>
          <span className="ml-auto text-[10px] text-gray-400">Stap 1/3</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Bezorgmethode</label>
            <div className="flex gap-2 mt-1.5">
              {(["bezorgen", "ophalen"] as const).map((m) => (
                <button key={m} onClick={() => setDelivery(m)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${delivery === m ? "border-current text-white" : "border-gray-200 text-gray-500 bg-white"}`}
                  style={delivery === m ? { backgroundColor: "var(--tenant-primary)", borderColor: "var(--tenant-primary)" } : undefined}
                >
                  {m === "bezorgen" ? "Thuisbezorgd (PostNL)" : "Ophalen in winkel"}
                </button>
              ))}
            </div>
          </div>
          {delivery === "bezorgen" && (
            <>
              <div>
                <label className="text-[11px] font-medium text-gray-500">Straat + huisnummer</label>
                <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Kalverstraat 1" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-gray-500">Postcode</label>
                  <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    placeholder="1012 AB" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-gray-500">Stad</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Amsterdam" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </>
          )}
          {delivery === "ophalen" && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-700">{tenantName} Kalverstraat</p>
              <p className="text-[11px] text-gray-400">Kalverstraat 212, 1012 PH Amsterdam</p>
              <p className="text-[11px] text-green-600 mt-1">Morgen ophaalbaar vanaf 10:00</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <button onClick={() => setStep("payment")} disabled={delivery === "bezorgen" && !addressValid}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--tenant-primary)" }}>
            Verder naar betaling
          </button>
        </div>
      </div>
    );
  }

  // CHECKOUT: Payment step
  if (step === "payment") {
    return (
      <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
          <button onClick={() => setStep("address")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-semibold text-sm text-gray-800">Betaling</span>
          <span className="ml-auto text-[10px] text-gray-400">Stap 2/3</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Betaalmethode</label>
          {([
            { id: "ideal" as const, name: "iDEAL", desc: "Direct betalen via je bank", icon: "🏦" },
            { id: "creditcard" as const, name: "Creditcard", desc: "Visa, Mastercard, Amex", icon: "💳" },
          ]).map((m) => (
            <button key={m.id} onClick={() => setPayment(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${payment === m.id ? "border-current bg-white shadow-sm" : "border-gray-200 bg-white"}`}
              style={payment === m.id ? { borderColor: "var(--tenant-primary)" } : undefined}
            >
              <span className="text-xl">{m.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{m.name}</p>
                <p className="text-[11px] text-gray-400">{m.desc}</p>
              </div>
              {payment === m.id && (
                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--tenant-primary)" }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          ))}

          {/* Order summary */}
          <div className="mt-4 bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Overzicht</p>
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-xs py-1">
                <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                <span className="text-gray-800 font-medium">&euro;{(item.product.price * item.quantity).toFixed(2).replace(".", ",")}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs py-1 text-green-600">
              <span>Verzending</span>
              <span className="font-medium">Gratis</span>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-800">Totaal</span>
              <span className="text-sm font-bold" style={{ color: "var(--tenant-primary)" }}>&euro;{total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <button onClick={handleConfirmOrder}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--tenant-primary)" }}>
            Bestelling plaatsen &middot; &euro;{total.toFixed(2).replace(".", ",")}
          </button>
        </div>
      </div>
    );
  }

  // CHECKOUT: Confirmed step
  if (step === "confirmed") {
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    return (
      <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <span className="font-semibold text-sm text-gray-800">Bestelling geplaatst</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--tenant-primary)" }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-bold text-gray-800">Bedankt voor je bestelling!</p>
            <p className="text-xs text-gray-400 mt-1 font-mono">{orderId}</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {delivery === "bezorgen" ? `PostNL — ${tomorrow}` : `Ophalen morgen vanaf 10:00`}
                </p>
                {delivery === "bezorgen" && address.street && (
                  <p className="text-[11px] text-gray-400">{address.street}, {address.postalCode} {address.city}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{payment === "ideal" ? "🏦" : "💳"}</span>
              <p className="text-xs text-green-600 font-medium">{payment === "ideal" ? "iDEAL" : "Creditcard"} — Betaald</p>
            </div>
          </div>

          {delivery === "bezorgen" && (
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[11px] text-gray-500 mb-1">Track & Trace</p>
              <p className="text-xs font-mono text-gray-700 mb-2">{trackingCode}</p>
              <a href={`https://postnl.nl/tracktrace/?B=${trackingCode}&P=${address.postalCode.replace(/\s/g, "")}&D=NL`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md text-white"
                style={{ backgroundColor: "var(--tenant-primary)" }}>
                Volg je pakket
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            {[
              { label: "Bestelling geplaatst", done: true },
              { label: "Betaling ontvangen", done: true },
              { label: delivery === "bezorgen" ? "Wordt verzonden" : "Wordt klaargelegd", done: false },
              { label: delivery === "bezorgen" ? "Onderweg" : "Klaar om op te halen", done: false },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.done ? "bg-green-500" : "bg-gray-200"}`} />
                  {i < arr.length - 1 && <div className={`w-0.5 h-4 ${s.done ? "bg-green-300" : "bg-gray-200"}`} />}
                </div>
                <span className={`text-xs pb-2 ${s.done ? "text-gray-700 font-medium" : "text-gray-400"}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <button onClick={() => { setStep("cart"); setOrderId(""); }}
            className="w-full py-2.5 rounded-lg border-2 font-medium text-sm transition-all hover:bg-gray-50"
            style={{ borderColor: "var(--tenant-primary)", color: "var(--tenant-primary)" }}>
            Verder winkelen
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT: Cart view
  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span className="font-semibold text-sm text-gray-800">Winkelwagen</span>
          {cart.length > 0 && (
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--tenant-primary)", color: "white" }}>
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
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

            <div className="bg-white rounded-lg p-3 shadow-sm mt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-800">Totaal</span>
                <span className="text-lg font-bold" style={{ color: "var(--tenant-primary)" }}>
                  &euro;{total.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button onClick={() => setStep("address")}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "var(--tenant-primary)" }}>
                Afrekenen
              </button>
            </div>
          </div>
        )}

        {/* Ad */}
        <div className="mx-3 mt-4 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--tenant-primary), #ff6b35)" }}>
          <div className="px-3 py-2.5 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Persoonlijke aanbieding</span>
              <CountdownTimer />
            </div>
            <p className="font-bold text-xs">Gratis verzending bij bestelling nu!</p>
          </div>
        </div>

        {/* Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div className="p-3 mt-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Misschien ook leuk</p>
            <div className="space-y-1.5">
              {filteredSuggestions.slice(0, 3).map((item) => {
                const discountedPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={item.id} className="flex items-center gap-2 bg-white/60 rounded-lg p-2 border border-dashed border-gray-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded object-cover opacity-80" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500 truncate">{item.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-red-600">&euro;{discountedPrice.toFixed(2).replace(".", ",")}</span>
                        <span className="text-[9px] text-gray-400 line-through">&euro;{item.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                    <button onClick={() => onAddSuggested(item.id)}
                      className="shrink-0 text-[10px] font-medium px-2 py-1 rounded text-white" style={{ backgroundColor: "var(--tenant-primary)" }}>
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loyalty */}
        <div className="mx-3 mt-2 mb-4 bg-amber-50 rounded-xl border border-amber-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            <span className="text-xs font-semibold text-amber-800">{loyaltyName || `${tenantName || ""} lid`}?</span>
          </div>
          <p className="text-[11px] text-amber-700">Verdien punten op elke aankoop!</p>
        </div>
      </div>
    </div>
  );
}
