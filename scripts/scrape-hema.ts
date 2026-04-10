/**
 * HEMA Product Scraper
 *
 * Scrapes product data from hema.nl using Playwright.
 * Run with: npx tsx scripts/scrape-hema.ts
 *
 * Categories scraped:
 * - Eten & Drinken
 * - Wonen & Decoratie
 * - Keuken
 * - Kleding (basics)
 * - Kantoor & School
 * - Speelgoed & Spellen
 * - Tassen & Accessoires
 * - Beauty & Verzorging
 * - Baby & Kind
 * - Elektronica
 */

import { chromium, type Page } from "playwright";
import {
  RawProduct,
  sanitizeText,
  extractPrice,
  deduplicateProducts,
  writeProductsJson,
} from "./scrape-utils";
import * as path from "path";

const BASE_URL = "https://www.hema.nl";

const CATEGORY_URLS = [
  { url: "/eten-drinken", category: "Eten & Drinken" },
  { url: "/wonen-decoratie", category: "Wonen" },
  { url: "/koken-tafelen", category: "Keuken" },
  { url: "/dameskleding", category: "Kleding" },
  { url: "/herenkleding", category: "Kleding" },
  { url: "/kinderkleding", category: "Kleding" },
  { url: "/kantoor-school", category: "Kantoor & School" },
  { url: "/speelgoed", category: "Speelgoed & Spellen" },
  { url: "/tassen-accessoires", category: "Tassen & Accessoires" },
  { url: "/beauty-verzorging", category: "Beauty" },
  { url: "/baby", category: "Baby & Kind" },
  { url: "/elektronica", category: "Elektronica" },
  { url: "/huishouden", category: "Huishouden" },
];

async function acceptCookies(page: Page): Promise<void> {
  try {
    const cookieBtn = page.locator(
      'button:has-text("Accepteren"), button:has-text("accepteer"), button:has-text("Alles accepteren"), #onetrust-accept-btn-handler'
    );
    await cookieBtn.first().click({ timeout: 5000 });
    console.log("Accepted cookies");
    await page.waitForTimeout(1000);
  } catch {
    console.log("No cookie banner found or already accepted");
  }
}

async function scrapeProductList(
  page: Page,
  categoryUrl: string,
  category: string,
  maxProducts: number = 40
): Promise<RawProduct[]> {
  const products: RawProduct[] = [];
  const url = `${BASE_URL}${categoryUrl}`;
  console.log(`\nScraping category: ${category} (${url})`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Scroll down to load lazy-loaded products
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }

    // Try multiple selector strategies for product tiles
    const selectors = [
      '[data-testid="product-tile"]',
      ".product-tile",
      'a[href*="/product/"]',
      '[class*="product"]',
      ".plp-product",
      'article[class*="product"]',
    ];

    let productElements: any[] = [];
    for (const selector of selectors) {
      productElements = await page.$$(selector);
      if (productElements.length > 0) {
        console.log(
          `  Found ${productElements.length} products with selector: ${selector}`
        );
        break;
      }
    }

    if (productElements.length === 0) {
      console.log(`  No products found for ${category}, trying link-based extraction`);
      // Fallback: extract product links
      const links = await page.$$eval(
        'a[href*="/p/"]',
        (els) =>
          els.map((el) => ({
            href: el.getAttribute("href") || "",
            text: el.textContent?.trim() || "",
          }))
      );

      for (const link of links.slice(0, maxProducts)) {
        if (link.text && link.text.length > 3) {
          products.push({
            name: sanitizeText(link.text.split("\n")[0]),
            description: "",
            price: 0,
            category,
            imageUrl: "",
            attributes: {},
            tags: [],
            url: link.href.startsWith("http")
              ? link.href
              : `${BASE_URL}${link.href}`,
          });
        }
      }
      return products;
    }

    // Extract data from product tiles
    for (const el of productElements.slice(0, maxProducts)) {
      try {
        const name = await el
          .$eval(
            '[class*="title"], [class*="name"], h2, h3, .product-title',
            (e: Element) => e.textContent?.trim() || ""
          )
          .catch(() => "");

        if (!name || name.length < 2) continue;

        const priceText = await el
          .$eval(
            '[class*="price"], .product-price, [data-testid="price"]',
            (e: Element) => e.textContent?.trim() || ""
          )
          .catch(() => "");

        const imgSrc = await el
          .$eval("img", (e: HTMLImageElement) => e.src || e.dataset.src || "")
          .catch(() => "");

        const linkHref = await el
          .$eval("a", (e: HTMLAnchorElement) => e.href || "")
          .catch(() => "");

        const salePriceText = await el
          .$eval(
            '[class*="sale"], [class*="discount"], [class*="promo"], .was-price',
            (e: Element) => e.textContent?.trim() || ""
          )
          .catch(() => "");

        const price = extractPrice(priceText) || 0;
        const salePrice = salePriceText ? extractPrice(salePriceText) : undefined;

        products.push({
          name: sanitizeText(name),
          description: "",
          price: salePrice && salePrice < price ? price : price,
          ...(salePrice && salePrice < price && { salePrice }),
          category,
          imageUrl: imgSrc,
          attributes: {},
          tags: [],
          url: linkHref,
        });
      } catch (err) {
        // Skip individual product errors
      }
    }

    console.log(`  Extracted ${products.length} products from ${category}`);
  } catch (err) {
    console.error(`  Error scraping ${category}:`, err);
  }

  return products;
}

async function scrapeProductDetails(
  page: Page,
  product: RawProduct
): Promise<RawProduct> {
  if (!product.url) return product;

  try {
    await page.goto(product.url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Get description
    const description = await page
      .$eval(
        '[class*="description"], [data-testid="product-description"], .product-description, [class*="product-info"] p',
        (e: Element) => e.textContent?.trim() || ""
      )
      .catch(() => "");

    if (description) {
      product.description = sanitizeText(description).slice(0, 300);
    }

    // Get all product images
    const images = await page
      .$$eval(
        '[class*="gallery"] img, [class*="carousel"] img, .product-image img, [data-testid="product-image"] img',
        (imgs: HTMLImageElement[]) =>
          imgs
            .map((img) => img.src || img.dataset.src || "")
            .filter((src) => src && !src.includes("placeholder"))
      )
      .catch(() => []);

    if (images.length > 0) {
      product.imageUrl = images[0];
      product.imageUrls = images.slice(0, 5);
    }

    // Get price if missing
    if (product.price === 0) {
      const priceText = await page
        .$eval(
          '[class*="price"], [data-testid="price"]',
          (e: Element) => e.textContent?.trim() || ""
        )
        .catch(() => "");
      product.price = extractPrice(priceText) || 0;
    }

    // Get attributes
    const attrs = await page
      .$$eval(
        '[class*="specification"] li, [class*="attribute"] li, table tr',
        (els: Element[]) =>
          els.map((el) => {
            const parts = el.textContent?.trim().split(/:\s*/) || [];
            return parts.length >= 2
              ? { key: parts[0].trim(), value: parts.slice(1).join(":").trim() }
              : null;
          })
      )
      .catch(() => []);

    for (const attr of attrs) {
      if (attr && attr.key && attr.value) {
        product.attributes[attr.key] = attr.value;
      }
    }
  } catch {
    // Keep what we have
  }

  return product;
}

async function main() {
  console.log("Starting HEMA scraper...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "nl-NL",
  });

  const page = await context.newPage();

  // Navigate to home first to accept cookies
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await acceptCookies(page);

  let allProducts: RawProduct[] = [];

  // Scrape product listings from each category
  for (const { url, category } of CATEGORY_URLS) {
    const products = await scrapeProductList(page, url, category, 40);
    allProducts.push(...products);

    // Rate limit between categories
    await page.waitForTimeout(2000);
  }

  // Deduplicate
  allProducts = deduplicateProducts(allProducts);
  console.log(`\nTotal unique products after dedup: ${allProducts.length}`);

  // Scrape details for products that need enrichment (description/images)
  const productsNeedingDetails = allProducts.filter(
    (p) => !p.description || !p.imageUrl
  );
  console.log(
    `\nEnriching ${productsNeedingDetails.length} products with details...`
  );

  let enriched = 0;
  for (const product of productsNeedingDetails.slice(0, 100)) {
    await scrapeProductDetails(page, product);
    enriched++;
    if (enriched % 10 === 0) {
      console.log(`  Enriched ${enriched}/${productsNeedingDetails.length}`);
    }
    await page.waitForTimeout(1500);
  }

  // Filter out products with no price
  allProducts = allProducts.filter((p) => p.price > 0);

  // Generate descriptions for products that still don't have one
  for (const p of allProducts) {
    if (!p.description) {
      p.description = `${p.name} van HEMA. Goede kwaliteit voor een eerlijke prijs.`;
    }
  }

  // Write output
  const outputDir = path.resolve(__dirname, "../src/data/hema");
  writeProductsJson("hema", allProducts, outputDir);

  await browser.close();
  console.log("\nDone!");
}

main().catch(console.error);
