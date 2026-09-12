import { Product, SaleRecord, AppSettings, calculateSalePrice } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_SALES } from '../data/initialSales';

const STORAGE_KEYS = {
  PRODUCTS: 'solevault_products_v6',
  SALES: 'solevault_sales_v1',
  SETTINGS: 'solevault_settings_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'SOLEVAULT UK',
  whatsappNumber: '447454291587', // UK phone number: 07454291587 (+447454291587)
  adminPin: '1234',
  currencySymbol: '£',
  defaultDeliveryTime: 'Approximately 2 weeks',
  defaultCollectionPrice: 'FREE',
  defaultDeliveryPrice: 2.99,
};

export function isUserUploadedImage(imageStr: string | undefined): boolean {
  if (!imageStr) return false;
  return (
    imageStr.startsWith('/images/shoe-') ||
    imageStr.startsWith('/uploads/') ||
    imageStr.startsWith('data:image/') ||
    imageStr.startsWith('blob:') ||
    imageStr.length > 500
  );
}

/**
 * Renumber all products sequentially from SH01, SH02...
 */
export function renumberProducts(products: Product[]): Product[] {
  return products.map((p, index) => {
    const num = (index + 1).toString().padStart(2, '0');
    const newSku = `SH${num}`;
    return {
      ...p,
      sku: newSku,
    };
  });
}

/**
 * Keep only products with actual user-uploaded images, delete all extra placeholders,
 * and renumber sequentially from SH01, SH02...
 */
export function cleanExtraAndRenumber(products: Product[]): Product[] {
  const uploadedOnly = products.filter((p) => isUserUploadedImage(p.image));
  
  // If user has uploaded products, keep only those; otherwise renumber whatever is present
  const targetList = uploadedOnly.length > 0 ? uploadedOnly : products;
  return renumberProducts(targetList);
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_PRODUCTS;
    }

    // Check if cached products need image migration or placeholder name/colour migration
    let needsUpdate = false;
    const migrated = parsed.map((p: Product, idx: number) => {
      let updated = { ...p };
      const fallback = INITIAL_PRODUCTS.find((init) => init.sku === p.sku) || INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length];

      if (p.image && (p.image.includes('unsplash.com') || !p.image)) {
        needsUpdate = true;
        updated.image = fallback ? fallback.image : p.image;
      }

      // If name is placeholder or generic, restore authentic shoe name & colourway
      if (
        fallback &&
        (!p.name ||
          p.name.includes('Gemini Generated Image') ||
          p.name.includes('SOLEVAULT Edition') ||
          p.colour === 'Standard Colourway')
      ) {
        needsUpdate = true;
        updated.name = fallback.name;
        updated.colour = fallback.colour;
      }

      return updated;
    });

    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(migrated));
      return migrated;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load products from localStorage', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Synchronize products with server API.
 * Ensures the public shared link displays the latest catalogue and uploaded images across all devices.
 */
export async function fetchServerProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch products from server API, using local cache', err);
  }
  return getStoredProducts();
}

export function resetStoredProducts(): Product[] {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    // Also sync to server
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(INITIAL_PRODUCTS),
    }).catch((e) => console.warn('Server sync error:', e));
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Failed to reset products in localStorage', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    // Persist to server backend so shared public links show these shoes
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    }).catch((e) => console.warn('Server sync error for products:', e));
  } catch (err) {
    console.error('Failed to save products to localStorage', err);
  }
}

export async function fetchServerSales(): Promise<SaleRecord[]> {
  try {
    const res = await fetch('/api/sales');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch sales from server API', err);
  }
  return getStoredSales();
}

export function getStoredSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SALES;
  } catch (err) {
    console.error('Failed to load sales from localStorage', err);
    return INITIAL_SALES;
  }
}

export function saveStoredSales(sales: SaleRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sales),
    }).catch((e) => console.warn('Server sync error for sales:', e));
  } catch (err) {
    console.error('Failed to save sales to localStorage', err);
  }
}

export async function fetchServerSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch settings from server API', err);
  }
  return getStoredSettings();
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings from localStorage', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch((e) => console.warn('Server sync error for settings:', e));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

/**
 * Upload an image file to the server's /api/upload endpoint to get a static URL (/uploads/...).
 * Falls back to base64 Data URL if the upload endpoint is unavailable.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            data: dataUrl,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.url) {
            resolve(result.url);
            return;
          }
        }
      } catch (err) {
        console.warn('Image upload to server failed, falling back to data URL', err);
      }
      // Fallback to data URL
      resolve(dataUrl);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Dynamically identify shoe model and colourway via server-side Gemini
 */
export async function identifyShoeFromServer(
  imagePath?: string,
  base64Data?: string
): Promise<{ name: string; colour: string }> {
  try {
    const res = await fetch('/api/identify-shoe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imagePath, base64: base64Data }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.name) {
        return {
          name: data.name,
          colour: data.colour || 'Standard Colourway',
        };
      }
    }
  } catch (err) {
    console.warn('AI identification request failed:', err);
  }
  return { name: 'Performance Runner', colour: 'Standard Colourway' };
}

export function getNextSku(products: Product[]): string {
  let maxNum = 0;
  products.forEach((p) => {
    const match = p.sku.match(/^SH(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `SH${nextNum.toString().padStart(2, '0')}`;
}

export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If starts with 0044, replace 00 with nothing so it starts with 44
  if (cleaned.startsWith('0044')) {
    cleaned = cleaned.substring(2);
  }
  // If UK domestic number with 07..., convert to 447...
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    cleaned = '44' + cleaned.substring(1);
  }
  // If user entered 4407..., remove the redundant 0 after 44
  if (cleaned.startsWith('440') && cleaned.length >= 12) {
    cleaned = '44' + cleaned.substring(3);
  }
  return cleaned;
}

export function generateWhatsAppUrl(
  product: Product,
  selectedSize: string,
  whatsappNumber: string
): string {
  // Format as requested: "Hi, I'm interested in SH008 - Performance Runner, Size UK 9."
  const sizeText = selectedSize || product.sizes[0] || 'UK 9';
  const text = `Hi, I'm interested in ${product.sku} - ${product.name}, Size ${sizeText}.`;
  const cleanPhone = formatWhatsAppPhone(whatsappNumber);
  const encodedText = encodeURIComponent(text);
  
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function getBasePublicUrl(): string {
  try {
    const settings = getStoredSettings();
    if (settings.customStoreUrl && settings.customStoreUrl.trim()) {
      return settings.customStoreUrl.trim().replace(/\/+$/, '');
    }
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // In Google AI Studio: ais-dev-*.run.app is private to developer session (gives 403 to outside users).
      // The public shared endpoint is ais-pre-*.run.app
      if (hostname.includes('ais-dev-')) {
        const publicHostname = hostname.replace('ais-dev-', 'ais-pre-');
        return `https://${publicHostname}`;
      }
      return window.location.origin;
    }
  } catch (err) {
    // fallback
  }
  return 'https://ais-pre-ocpri5kon5yc7ixyucrron-658068371513.europe-west2.run.app';
}

export function getProductShareUrl(sku: string): string {
  const base = getBasePublicUrl();
  return `${base}#/product/${sku}`;
}

export function getCatalogueShareUrl(): string {
  const base = getBasePublicUrl();
  return `${base}/`;
}

export function generateCatalogueWhatsAppShareUrl(storeName: string = 'SOLEVAULT UK'): string {
  const url = getCatalogueShareUrl();
  const text = `Check out the latest shoe catalogue from ${storeName}! Browse collection and order directly: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function exportStoreData(): string {
  const products = getStoredProducts();
  const sales = getStoredSales();
  const settings = getStoredSettings();
  return JSON.stringify({ products, sales, settings, exportedAt: new Date().toISOString() }, null, 2);
}

export function importStoreData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.products && Array.isArray(data.products)) {
      saveStoredProducts(data.products);
    }
    if (data.sales && Array.isArray(data.sales)) {
      saveStoredSales(data.sales);
    }
    if (data.settings) {
      saveStoredSettings(data.settings);
    }
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
