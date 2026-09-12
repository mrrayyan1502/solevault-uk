const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

// Pre-fill what we already successfully detected from previous run
const CACHED_DETECTIONS = {
  "SH001": { name: "On Cloudsurfer", colour: "Ivory / Mineral" },
  "SH002": { name: "On Cloudsurfer", colour: "All Black" },
  "SH003": { name: "Adidas Adizero Boston 12", colour: "Shadow Violet / Carbon / Preloved Fig" },
  "SH004": { name: "On Cloudsurfer", colour: "All Black" },
  "SH005": { name: "On Cloudsurfer", colour: "Frost / Surf" },
  "SH006": { name: "On Cloudtilt", colour: "Moon" },
  "SH007": { name: "On Cloudflyer 4", colour: "Glacier / Lavender" },
  "SH008": { name: "On Cloudtilt", colour: "Sand / Fawn" },
  "SH009": { name: "On Cloud 5", colour: "Rose" },
  "SH010": { name: "On Cloudsurfer Next", colour: "Rose / Black" },
  "SH011": { name: "On Cloudsurfer", colour: "Grey / Coral" },
  "SH012": { name: "On Cloudsurfer", colour: "Zinc / Shadow" },
};

async function run() {
  const ai = new GoogleGenAI();
  const productsPath = path.join(process.cwd(), "data", "products.json");
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  console.log(`Starting shoe identification for ${products.length} products...`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Check if in CACHED_DETECTIONS
    if (CACHED_DETECTIONS[p.sku]) {
      p.name = CACHED_DETECTIONS[p.sku].name;
      p.colour = CACHED_DETECTIONS[p.sku].colour;
      console.log(`[${i + 1}/${products.length}] ${p.sku} used cache: ${p.name} | ${p.colour}`);
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), "utf-8");
      continue;
    }

    // Check if already identified (not a placeholder name)
    if (
      p.name &&
      !p.name.includes("Gemini Generated Image") &&
      !p.name.includes("SOLEVAULT Edition")
    ) {
      console.log(`[${i + 1}/${products.length}] ${p.sku} already identified: ${p.name} | ${p.colour}`);
      continue;
    }

    console.log(`[${i + 1}/${products.length}] Processing ${p.sku} via Gemini...`);

    // Resolve image path
    let imgRel = p.image.startsWith("/") ? p.image.slice(1) : p.image;
    let fullImgPath = path.join(process.cwd(), "public", imgRel);
    if (!fs.existsSync(fullImgPath)) {
      fullImgPath = path.join(process.cwd(), imgRel);
    }

    if (!fs.existsSync(fullImgPath)) {
      console.warn(`Image not found at ${fullImgPath}, skipping.`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(fullImgPath);
      const base64Data = buffer.toString("base64");
      const ext = path.extname(fullImgPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

      const prompt = `Look at this sneaker / running shoe image.
Identify:
1. Brand and exact model name (e.g., "On Running Cloudmonster", "On Cloudsurfer", "On Cloud 5", "On Cloudtilt", "On Cloudflow", "Adidas Adizero", "Nike Pegasus", etc.).
2. The specific colourway (e.g., "Frost / Surf", "Undyed White / White", "Glacier / Meadow", "All Black", "Ivory / Mineral", etc.).

Return strictly JSON:
{
  "name": "Full Shoe Model Name",
  "colour": "Specific Colourway"
}`;

      let attempts = 0;
      let success = false;
      while (!success && attempts < 3) {
        attempts++;
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: prompt }
                ]
              }
            ],
            config: { responseMimeType: "application/json" }
          });

          const resText = response.text.trim();
          const parsed = JSON.parse(resText);
          if (parsed.name) {
            p.name = parsed.name.trim();
            p.colour = (parsed.colour || "Standard Colourway").trim();
            console.log(`  -> [${p.sku}] Identified: ${p.name} | ${p.colour}`);
            success = true;
          }
        } catch (err) {
          console.error(`  [${p.sku}] Attempt ${attempts} error:`, err.message || err);
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    } catch (err) {
      console.error(`Error processing ${p.sku}:`, err);
    }

    // Save immediately after each product so progress is never lost
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), "utf-8");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Also update src/data/initialProducts.ts
  const initialProductsPath = path.join(process.cwd(), "src", "data", "initialProducts.ts");
  const tsContent = `import { Product, calculateSalePrice } from "../types";

/**
 * SOLEVAULT UK - Official Initial Catalogue
 * Accurately identified authentic footwear models and colourways.
 */
const RAW_INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export const INITIAL_PRODUCTS: Product[] = RAW_INITIAL_PRODUCTS.map((prod) => ({
  ...prod,
  salePrice: calculateSalePrice(prod.originalPrice, prod.discountPercentage),
}));
`;
  fs.writeFileSync(initialProductsPath, tsContent, "utf-8");
  console.log("All products identified and saved to data/products.json and src/data/initialProducts.ts!");
}

run().catch(console.error);
