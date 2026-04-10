"use client";

interface CartSummaryProps {
  cart: {
    items: { name: string; quantity: number; price: number; lineTotal: number }[];
    total: number;
    itemCount: number;
  };
  onCheckout?: () => void;
}

export function CartSummary({ cart, onCheckout }: CartSummaryProps) {
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-500 mt-2">
        Je winkelwagen is leeg
      </div>
    );
  }

  return (
    <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div
        className="px-4 py-2 text-white text-sm font-medium flex items-center gap-2"
        style={{ backgroundColor: "var(--tenant-primary)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1.35-6.78M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        Winkelwagen ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
      </div>
      <div className="divide-y divide-gray-50">
        {cart.items.map((item, i) => (
          <div key={i} className="px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex-1 min-w-0">
              <span className="text-gray-900">{item.name}</span>
              <span className="text-gray-400 ml-1">&times;{item.quantity}</span>
            </div>
            <span className="font-medium text-gray-700 ml-2">
              &euro;{item.lineTotal.toFixed(2).replace(".", ",")}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <span className="font-bold text-sm text-gray-900">Totaal</span>
        <span className="font-bold text-lg" style={{ color: "var(--tenant-primary)" }}>
          &euro;{cart.total.toFixed(2).replace(".", ",")}
        </span>
      </div>
      {onCheckout && (
        <div className="px-4 py-3">
          <button
            onClick={onCheckout}
            className="w-full py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            Afrekenen
          </button>
        </div>
      )}
    </div>
  );
}

interface CheckoutConfirmProps {
  order: {
    orderId: string;
    total: number;
    message: string;
  };
}

export function CheckoutConfirm({ order }: CheckoutConfirmProps) {
  return (
    <div className="mt-2 bg-green-50 rounded-xl border border-green-200 p-4 animate-fade-in">
      <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Bestelling bevestigd!
      </div>
      <p className="text-sm text-green-600 mt-1">
        Ordernummer: <span className="font-mono font-bold">{order.orderId}</span>
      </p>
      <p className="text-sm text-green-600 mt-0.5">
        Totaal: &euro;{order.total.toFixed(2).replace(".", ",")}
      </p>
    </div>
  );
}
