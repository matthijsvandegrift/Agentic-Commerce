"use client";

interface LoyaltyCardProps {
  data: {
    programName: string;
    customer: {
      name: string;
      memberId: string;
      tier: string;
      points: number;
      pointsValue: number;
      pointsToNextTier?: number | null;
      nextTier?: string | null;
    };
    recentPurchases?: {
      orderId: string;
      date: string;
      items: string[];
      total: number;
      pointsEarned: number;
    }[];
    recommendations?: string[];
  };
}

const tierColors: Record<string, string> = {
  Brons: "bg-amber-600",
  Zilver: "bg-gray-400",
  Goud: "bg-yellow-500",
  Standaard: "bg-gray-300",
};

export function LoyaltyCard({ data }: LoyaltyCardProps) {
  const { customer } = data;
  const tierColor = tierColors[customer.tier] || "bg-gray-400";

  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      {/* Header with tier badge */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-gray-900">
              {data.programName}
            </h4>
            <span
              className={`${tierColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
            >
              {customer.tier}
            </span>
          </div>
          <p className="text-xs text-gray-500">{customer.name}</p>
        </div>
      </div>

      {/* Points */}
      <div className="bg-gray-50 rounded-lg p-2.5 mb-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Spaarpunten</span>
          <span className="font-bold text-sm" style={{ color: "var(--tenant-primary)" }}>
            {customer.points.toLocaleString("nl-NL")} punten
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Waarde</span>
          <span className="text-xs font-medium text-gray-700">
            &euro;{customer.pointsValue.toFixed(2).replace(".", ",")}
          </span>
        </div>
        {customer.pointsToNextTier && customer.nextTier && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>{customer.tier}</span>
              <span>{customer.nextTier}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.min(100, (customer.points / (customer.points + customer.pointsToNextTier)) * 100)}%`,
                  backgroundColor: "var(--tenant-primary)",
                }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Nog {customer.pointsToNextTier} punten tot {customer.nextTier}
            </p>
          </div>
        )}
      </div>

      {/* Recent purchases */}
      {data.recentPurchases && data.recentPurchases.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Recente aankopen
          </p>
          {data.recentPurchases.slice(0, 3).map((purchase, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-1 text-xs"
            >
              <span className="text-gray-500 truncate mr-2">
                {purchase.items.join(", ")}
              </span>
              <span className="text-gray-400 shrink-0">
                &euro;{purchase.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
