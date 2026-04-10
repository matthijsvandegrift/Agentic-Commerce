/**
 * Image Downloader
 *
 * Downloads product images from scraped URLs to local public directory.
 * Run with: npx tsx scripts/download-images.ts [tenant]
 *
 * Usage:
 *   npx tsx scripts/download-images.ts hema
 *   npx tsx scripts/download-images.ts kruidvat
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

interface Product {
  id: string;
  imageUrl?: string;
  imageUrls?: string[];
}

function downloadFile(
  url: string,
  dest: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!url || url === "") {
      reject(new Error("Empty URL"));
      return;
    }

    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);

    protocol
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
        // Follow redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

function getExtension(url: string): string {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
    return ext;
  }
  return ".jpg";
}

async function main() {
  const tenant = process.argv[2] || "hema";
  const productsPath = path.resolve(
    __dirname,
    `../src/data/${tenant}/products.json`
  );
  const outputDir = path.resolve(
    __dirname,
    `../public/images/products/${tenant}`
  );

  if (!fs.existsSync(productsPath)) {
    console.error(`Products file not found: ${productsPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const products: Product[] = JSON.parse(
    fs.readFileSync(productsPath, "utf-8")
  );
  const updatedProducts = [...products];

  console.log(
    `Downloading images for ${products.length} ${tenant} products...\n`
  );

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageUrl = product.imageUrl || product.imageUrls?.[0];

    if (!imageUrl || imageUrl === "") {
      skipped++;
      continue;
    }

    const ext = getExtension(imageUrl);
    const filename = `${product.id}${ext}`;
    const destPath = path.join(outputDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 100) {
        updatedProducts[i] = {
          ...updatedProducts[i],
          imageUrl: `/images/products/${tenant}/${filename}`,
        };
        skipped++;
        continue;
      }
    }

    try {
      await downloadFile(imageUrl, destPath);
      updatedProducts[i] = {
        ...updatedProducts[i],
        imageUrl: `/images/products/${tenant}/${filename}`,
      };
      downloaded++;

      if (downloaded % 10 === 0) {
        console.log(`  Downloaded ${downloaded} images...`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      failed++;
      console.log(`  Failed: ${product.id} - ${(err as Error).message}`);
    }
  }

  // Update products.json with local image paths
  fs.writeFileSync(
    productsPath,
    JSON.stringify(updatedProducts, null, 2),
    "utf-8"
  );

  console.log(`\nDone!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
