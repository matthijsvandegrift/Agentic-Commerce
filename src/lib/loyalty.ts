import hemaLoyalty from "@/data/hema/loyalty.json";
import kruidvatLoyalty from "@/data/kruidvat/loyalty.json";

export interface LoyaltyProfile {
  programName: string;
  customer: {
    name: string;
    memberId: string;
    tier: string;
    points: number;
    pointsValue: number;
    tierThresholds: Record<string, number>;
    pointsToNextTier: number | null;
    nextTier: string | null;
  };
  recentPurchases: {
    orderId: string;
    date: string;
    items: string[];
    total: number;
    pointsEarned: number;
  }[];
  recommendations: string[];
}

const loyaltyData: Record<string, LoyaltyProfile> = {
  hema: hemaLoyalty as LoyaltyProfile,
  kruidvat: kruidvatLoyalty as LoyaltyProfile,
};

export function getLoyaltyProfile(
  tenantId: string
): LoyaltyProfile | undefined {
  return loyaltyData[tenantId];
}

export function redeemPoints(
  tenantId: string,
  points: number
): { success: boolean; message: string; remainingPoints: number } {
  const profile = loyaltyData[tenantId];
  if (!profile) {
    return {
      success: false,
      message: "Loyaliteitsprogramma niet gevonden",
      remainingPoints: 0,
    };
  }

  if (points > profile.customer.points) {
    return {
      success: false,
      message: `Je hebt maar ${profile.customer.points} punten. Je probeert ${points} punten in te wisselen.`,
      remainingPoints: profile.customer.points,
    };
  }

  const value = (points / 100).toFixed(2);
  const remaining = profile.customer.points - points;

  return {
    success: true,
    message: `${points} punten ingewisseld voor €${value} korting! Je hebt nog ${remaining} punten over.`,
    remainingPoints: remaining,
  };
}

export function getPurchaseHistory(tenantId: string) {
  const profile = loyaltyData[tenantId];
  return profile?.recentPurchases || [];
}
