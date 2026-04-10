import hemaPromotions from "@/data/hema/promotions.json";
import etosPromotions from "@/data/kruidvat/promotions.json";

interface DiscountCode {
  code: string;
  description: string;
  discountPercent?: number;
  discountFixed?: number;
  doublePoints?: boolean;
  minimumOrder?: number;
  validUntil: string;
  singleUse: boolean;
}

interface PromotionData {
  activePromotions: {
    id: string;
    label: string;
    description: string;
    discountPercent?: number;
    startDate: string;
    endDate: string;
    applicableCategories?: string[];
    applicableProductIds?: string[];
  }[];
  discountCodes: DiscountCode[];
}

const promoData: Record<string, PromotionData> = {
  hema: hemaPromotions as PromotionData,
  etos: etosPromotions as PromotionData,
};

export function getActivePromotions(tenantId: string) {
  const data = promoData[tenantId];
  if (!data) return [];

  const now = new Date().toISOString().split("T")[0];
  return data.activePromotions.filter(
    (p) => p.startDate <= now && p.endDate >= now
  );
}

export function validateDiscountCode(
  tenantId: string,
  code: string
): {
  valid: boolean;
  discount?: { type: string; value: number; description: string };
  message: string;
} {
  const data = promoData[tenantId];
  if (!data) {
    return { valid: false, message: "Onbekende winkel" };
  }

  const found = data.discountCodes.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );

  if (!found) {
    return {
      valid: false,
      message: `Kortingscode "${code}" is niet geldig.`,
    };
  }

  const now = new Date().toISOString().split("T")[0];
  if (found.validUntil < now) {
    return {
      valid: false,
      message: `Kortingscode "${code}" is verlopen.`,
    };
  }

  if (found.discountPercent) {
    return {
      valid: true,
      discount: {
        type: "percentage",
        value: found.discountPercent,
        description: found.description,
      },
      message: `Kortingscode "${code}" toegepast: ${found.description}`,
    };
  }

  if (found.discountFixed) {
    return {
      valid: true,
      discount: {
        type: "fixed",
        value: found.discountFixed,
        description: found.description,
      },
      message: `Kortingscode "${code}" toegepast: ${found.description}`,
    };
  }

  if (found.doublePoints) {
    return {
      valid: true,
      discount: {
        type: "points",
        value: 2,
        description: found.description,
      },
      message: `Kortingscode "${code}" toegepast: ${found.description}`,
    };
  }

  return { valid: false, message: "Onbekend kortingstype" };
}
