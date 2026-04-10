import { Product } from "@/types";
import fs from "fs";
import path from "path";

const catalogCache = new Map<string, Product[]>();

export function loadCatalog(catalogPath: string): Product[] {
  if (catalogCache.has(catalogPath)) {
    return catalogCache.get(catalogPath)!;
  }

  const projectRoot = /* turbopackIgnore: true */ process.cwd();
  const fullPath = path.join(projectRoot, catalogPath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const products: Product[] = JSON.parse(raw);
  catalogCache.set(catalogPath, products);
  return products;
}

export function searchProducts(
  catalogPath: string,
  query: string,
  category?: string,
  maxResults: number = 5
): Product[] {
  const products = loadCatalog(catalogPath);
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(Boolean);

  let filtered = products.filter((p) => p.inStock);

  if (category) {
    const catLower = category.toLowerCase();
    filtered = filtered.filter(
      (p) => p.category.toLowerCase().includes(catLower)
    );
  }

  const scored = filtered.map((product) => {
    const searchText = [
      product.name,
      product.description,
      product.category,
      ...product.tags,
      ...Object.values(product.attributes),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of queryTerms) {
      if (product.name.toLowerCase().includes(term)) score += 10;
      if (product.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
      if (product.category.toLowerCase().includes(term)) score += 3;
      if (product.description.toLowerCase().includes(term)) score += 2;
      if (searchText.includes(term)) score += 1;
    }

    return { product, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.product);
}

export function getProductById(
  catalogPath: string,
  productId: string
): Product | undefined {
  const products = loadCatalog(catalogPath);
  return products.find((p) => p.id === productId);
}

export function getCategories(catalogPath: string): string[] {
  const products = loadCatalog(catalogPath);
  return [...new Set(products.map((p) => p.category))];
}
