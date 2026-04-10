import * as fs from "fs";
import * as path from "path";

export interface RawProduct {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  imageUrls?: string[];
  attributes: Record<string, string>;
  tags: string[];
  url?: string;
}

export function generateId(tenant: string, index: number): string {
  return `${tenant}-${String(index + 1).padStart(3, "0")}`;
}

export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

export function extractPrice(text: string): number | undefined {
  const match = text.replace(",", ".").match(/(\d+[.,]?\d*)/);
  return match ? parseFloat(match[1]) : undefined;
}

export function deduplicateProducts(products: RawProduct[]): RawProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inferTags(product: RawProduct): string[] {
  const tags = new Set<string>(product.tags || []);
  const text = `${product.name} ${product.description}`.toLowerCase();

  const tagKeywords: Record<string, string[]> = {
    cadeau: ["cadeau", "geschenk", "gift", "kado"],
    kinderen: ["kind", "kinder", "kids", "baby", "peuter", "kleuter"],
    school: ["school", "etui", "schrift", "pen", "rugzak"],
    keuken: ["keuken", "koken", "bakken", "pan", "bord", "bestek"],
    feest: ["feest", "verjaardag", "party", "ballon", "slinger"],
    sport: ["sport", "fitness", "gym", "hardloop"],
    wonen: ["wonen", "interieur", "decoratie", "kussen", "kaars"],
    kleding: ["shirt", "broek", "sok", "ondergoed", "jas"],
    eten: ["chocolade", "koek", "snoep", "worst", "taart", "gebak"],
    beauty: ["crème", "shampoo", "douche", "huid", "haar"],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  }

  return [...tags];
}

export function writeProductsJson(
  tenant: string,
  products: RawProduct[],
  outputDir: string
): void {
  const fullProducts = products.map((p, i) => ({
    id: generateId(tenant, i),
    name: p.name,
    description: p.description,
    price: p.price,
    ...(p.salePrice !== undefined && { salePrice: p.salePrice }),
    category: p.category,
    ...(p.subcategory && { subcategory: p.subcategory }),
    imageUrl: p.imageUrl || "",
    ...(p.imageUrls?.length && { imageUrls: p.imageUrls }),
    attributes: p.attributes,
    tags: inferTags(p),
    inStock: true,
    stockLevel: Math.floor(Math.random() * 50) + 1,
  }));

  const outputPath = path.join(outputDir, "products.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(fullProducts, null, 2), "utf-8");
  console.log(`Wrote ${fullProducts.length} products to ${outputPath}`);
}
