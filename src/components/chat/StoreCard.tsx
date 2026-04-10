"use client";

interface StoreCardProps {
  store: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    openingHours?: Record<string, string>;
    services?: string[];
    available?: boolean;
    quantity?: number;
    productName?: string;
  };
}

export function StoreCard({ store }: StoreCardProps) {
  const today = new Date()
    .toLocaleDateString("nl-NL", { weekday: "long" })
    .toLowerCase();
  const todayHours = store.openingHours?.[today];

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${store.name} ${store.address} ${store.city}`
  )}`;

  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      <div className="flex items-start gap-3">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900">{store.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {store.address}, {store.postalCode} {store.city}
          </p>

          {/* Stock availability */}
          {store.available !== undefined && (
            <div
              className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                store.available
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  store.available ? "bg-green-500" : "bg-red-400"
                }`}
              />
              {store.available
                ? `Op voorraad${store.quantity ? ` (${store.quantity})` : ""}`
                : "Niet op voorraad"}
            </div>
          )}

          {/* Today's hours */}
          {todayHours && (
            <p className="text-xs text-gray-500 mt-1">
              Vandaag open: {todayHours}
            </p>
          )}

          {/* Services */}
          {store.services && store.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {store.services.map((service, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500"
                >
                  {service}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Route
            </a>
            <a
              href={`tel:${store.phone}`}
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {store.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
