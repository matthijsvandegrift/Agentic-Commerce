import hemaStores from "@/data/hema/stores.json";
import kruidvatStores from "@/data/kruidvat/stores.json";

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  openingHours: Record<string, string>;
  services: string[];
}

const storeData: Record<string, Store[]> = {
  hema: hemaStores as Store[],
  kruidvat: kruidvatStores as Store[],
};

export function loadStores(tenantId: string): Store[] {
  return storeData[tenantId] || [];
}

export function findNearestStores(
  tenantId: string,
  query: string,
  limit: number = 3
): Store[] {
  const stores = loadStores(tenantId);
  const queryLower = query.toLowerCase();

  // Simple text matching on city, address, and name
  const matched = stores.filter(
    (s) =>
      s.city.toLowerCase().includes(queryLower) ||
      s.address.toLowerCase().includes(queryLower) ||
      s.name.toLowerCase().includes(queryLower) ||
      s.postalCode.replace(/\s/g, "").includes(queryLower.replace(/\s/g, ""))
  );

  return matched.slice(0, limit);
}

export function getStoreById(
  tenantId: string,
  storeId: string
): Store | undefined {
  const stores = loadStores(tenantId);
  return stores.find((s) => s.id === storeId);
}

export function checkStoreStock(
  tenantId: string,
  storeId: string,
  productId: string
): { available: boolean; quantity: number; storeName: string } {
  const store = getStoreById(tenantId, storeId);
  if (!store) {
    return { available: false, quantity: 0, storeName: "Onbekend" };
  }

  // Mock stock: deterministic based on product+store ID hash
  const hash =
    (productId + storeId)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 20;
  const quantity = hash > 3 ? hash : 0;

  return {
    available: quantity > 0,
    quantity,
    storeName: store.name,
  };
}
