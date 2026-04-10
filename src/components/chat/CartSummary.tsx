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
      {/* Checkout is handled in the RHS shopping panel */}
    </div>
  );
}

interface CheckoutConfirmProps {
  order: {
    orderId: string;
    total: number;
    delivery?: {
      method: string;
      address?: string | null;
      estimatedDate: string;
      carrier: string;
      trackingCode: string;
      trackingUrl: string;
    };
    payment?: {
      method: string;
      status: string;
    };
  };
}

const paymentLabels: Record<string, string> = {
  ideal: "iDEAL",
  creditcard: "Creditcard",
  paypal: "PayPal",
};

export function CheckoutConfirm({ order }: CheckoutConfirmProps) {
  return (
    <div className="mt-2 bg-white rounded-xl border border-green-200 overflow-hidden animate-fade-in">
      {/* Success header */}
      <div className="bg-green-50 px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-sm text-green-800">Bestelling geplaatst!</div>
          <div className="text-xs text-green-600 font-mono">{order.orderId}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-bold text-green-800">
            &euro;{order.total.toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>

      {/* Payment */}
      {order.payment && (
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600">
            {paymentLabels[order.payment.method] || order.payment.method}
          </span>
          <span className="ml-auto text-xs font-medium text-green-600">Betaald</span>
        </div>
      )}

      {/* Delivery */}
      {order.delivery && (
        <div className="px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600">
                {order.delivery.carrier} &middot; {order.delivery.estimatedDate}
              </div>
              {order.delivery.address && (
                <div className="text-[11px] text-gray-400">{order.delivery.address}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.delivery?.trackingCode && (
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Track & Trace: <span className="font-mono text-gray-700">{order.delivery.trackingCode}</span>
            </div>
            <a
              href={order.delivery.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium px-2 py-1 rounded-md text-white"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              Volg pakket
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
