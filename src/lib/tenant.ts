import { tenants } from "@/config/tenants";
import { TenantConfig } from "@/types";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT || "hema";

export function getTenant(tenantId?: string | null): TenantConfig {
  const id = tenantId || DEFAULT_TENANT;
  const tenant = tenants[id];
  if (!tenant) {
    return tenants[DEFAULT_TENANT] || Object.values(tenants)[0];
  }
  return tenant;
}

export function getTenantFromCookies(cookieHeader?: string | null): string {
  if (!cookieHeader) return DEFAULT_TENANT;
  const match = cookieHeader.match(/(?:^|;\s*)tenant=([^;]+)/);
  return match ? match[1] : DEFAULT_TENANT;
}
