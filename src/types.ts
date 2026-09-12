export interface Product {
  id: string;
  sku: string;
  name: string;
  colour: string;
  image: string;
  sizes: string[];
  originalPrice: number;
  discountPercentage: number;
  salePrice: number;
  status: 'Available to Order' | 'Low Stock' | 'Sold Out' | 'Archived';
  deliveryTime: string;
  collectionPrice: string;
  deliveryPrice: number;
  createdAt: string;
  brand?: string;
  description?: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  sku: string;
  shoeName: string;
  size: string;
  quantity: number;
  actualSellingPrice: number;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  storeName: string;
  whatsappNumber: string;
  adminPin: string;
  currencySymbol: string;
  defaultDeliveryTime: string;
  defaultCollectionPrice: string;
  defaultDeliveryPrice: number;
  customStoreUrl?: string;
}

export function calculateSalePrice(originalPrice: number, discountPercentage: number): number {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = originalPrice - discountAmount;
  return Math.round(finalPrice * 100) / 100;
}
