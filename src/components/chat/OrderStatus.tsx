"use client";

interface OrderStatusProps {
  order: {
    orderId: string;
    status: string;
    items?: { name: string; quantity: number; price: number }[];
    total?: number;
    estimatedDelivery?: string;
    trackingUrl?: string;
    steps?: { label: string; completed: boolean; date?: string }[];
  };
}

export function OrderStatus({ order }: OrderStatusProps) {
  const steps = order.steps || [
    { label: "Bestelling geplaatst", completed: true, date: "vandaag" },
    { label: "Betaling ontvangen", completed: true },
    { label: "In behandeling", completed: order.status !== "geplaatst" },
    { label: "Verzonden", completed: order.status === "verzonden" || order.status === "bezorgd" },
    { label: "Bezorgd", completed: order.status === "bezorgd" },
  ];

  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-900">
            Bestelling {order.orderId}
          </h4>
          {order.estimatedDelivery && (
            <p className="text-xs text-gray-500">
              Verwachte levering: {order.estimatedDelivery}
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  step.completed
                    ? "border-green-500 bg-green-500"
                    : "border-gray-300 bg-white"
                }`}
              />
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-5 ${
                    step.completed ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="pb-2">
              <span
                className={`text-xs ${
                  step.completed
                    ? "text-gray-800 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {step.date && (
                <span className="text-[10px] text-gray-400 ml-1.5">
                  {step.date}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {order.total && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
          <span className="text-xs text-gray-500">Totaal</span>
          <span className="text-sm font-bold" style={{ color: "var(--tenant-primary)" }}>
            &euro;{order.total.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}
    </div>
  );
}
