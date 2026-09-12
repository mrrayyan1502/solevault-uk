import { Product, calculateSalePrice } from "../types";

/**
 * SOLEVAULT UK - Official Initial Catalogue
 * Numbered cleanly from SH01 upwards with latest models featured on top.
 */
const RAW_INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-1789211619755",
    "sku": "SH01",
    "name": "Adidas Adizero Evo SL ATR",
    "colour": "Khaki / Dark Purple",
    "image": "/uploads/Adidas_Adizero_Evo_SL_ATR__KhakiDark_Purple_-1789211502405.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 13,
    "salePrice": 69.6,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T11:13:39.755Z"
  },
  {
    "id": "batch-1789208549515-24",
    "sku": "SH02",
    "name": "On Cloudmonster 2",
    "colour": "Undyed White / White",
    "image": "/uploads/Gemini_Generated_Image_1f8t1y1f8t1y1f8t-1789208542761.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-23",
    "sku": "SH03",
    "name": "On Cloudmonster",
    "colour": "Pearl / Aloe",
    "image": "/uploads/Gemini_Generated_Image_4cwzlr4cwzlr4cwz-1789208542329.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-22",
    "sku": "SH04",
    "name": "On Cloudtilt",
    "colour": "White / Pearl",
    "image": "/uploads/Gemini_Generated_Image_6j1sgl6j1sgl6j1s-1789208541013.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-21",
    "sku": "SH05",
    "name": "On Cloudrunner 2",
    "colour": "All Black",
    "image": "/uploads/Gemini_Generated_Image_7fe8u97fe8u97fe8-1789208540651.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-20",
    "sku": "SH06",
    "name": "On Running Cloudmonster 2",
    "colour": "Undyed-White / Sand",
    "image": "/uploads/Gemini_Generated_Image_34ny4w34ny4w34ny-1789208540305.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-17",
    "sku": "SH07",
    "name": "On Cloudtilt",
    "colour": "Ivory / Mineral",
    "image": "/uploads/Gemini_Generated_Image_cc11fecc11fecc11-1789208537980.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-16",
    "sku": "SH08",
    "name": "On Cloudmonster",
    "colour": "Undyed-White / Sand",
    "image": "/uploads/Gemini_Generated_Image_cgktb4cgktb4cgkt-1789208537627.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-15",
    "sku": "SH09",
    "name": "On Cloudnova",
    "colour": "Undyed White / White",
    "image": "/uploads/Gemini_Generated_Image_fr1b0cfr1b0cfr1b-1789208537283.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-13",
    "sku": "SH10",
    "name": "On Cloudtilt",
    "colour": "Undyed-White / White",
    "image": "/uploads/Gemini_Generated_Image_fy693zfy693zfy69-1789208535574.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-12",
    "sku": "SH11",
    "name": "On Cloudswift 3",
    "colour": "Iron / Hay",
    "image": "/uploads/Gemini_Generated_Image_h8b8j8h8b8j8h8b8-1789208534261.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-11",
    "sku": "SH12",
    "name": "On Cloudsurfer",
    "colour": "Zinc / Shadow",
    "image": "/uploads/Gemini_Generated_Image_hjlo46hjlo46hjlo-1789208533058.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-9",
    "sku": "SH13",
    "name": "On Cloudsurfer Next",
    "colour": "Rose / Black",
    "image": "/uploads/Gemini_Generated_Image_i44advi44advi44a-1789208532384.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-8",
    "sku": "SH14",
    "name": "On Cloud 5",
    "colour": "Rose",
    "image": "/uploads/Gemini_Generated_Image_nnwdttnnwdttnnwd-1789208532048.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-6",
    "sku": "SH15",
    "name": "On Cloudflyer 4",
    "colour": "Glacier / Lavender",
    "image": "/uploads/Gemini_Generated_Image_qldrwuqldrwuqldr-1789208531256.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-4",
    "sku": "SH16",
    "name": "On Cloudsurfer",
    "colour": "Frost / Surf",
    "image": "/uploads/Gemini_Generated_Image_ugcsgiugcsgiugcs-1789208529476.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-3",
    "sku": "SH17",
    "name": "On Cloudsurfer",
    "colour": "All Black",
    "image": "/uploads/Gemini_Generated_Image_uz302huz302huz30-1789208528176.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-2",
    "sku": "SH18",
    "name": "Adidas Adizero Boston 12",
    "colour": "Shadow Violet / Carbon / Preloved Fig",
    "image": "/uploads/Gemini_Generated_Image_vf3fl9vf3fl9vf3f-1789208527878.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-1",
    "sku": "SH19",
    "name": "On Cloudsurfer",
    "colour": "All Black",
    "image": "/uploads/Gemini_Generated_Image_vs2c5zvs2c5zvs2c-1789208527582.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  },
  {
    "id": "batch-1789208549515-0",
    "sku": "SH20",
    "name": "On Cloudsurfer",
    "colour": "Ivory / Mineral",
    "image": "/uploads/Gemini_Generated_Image_x5fj34x5fj34x5fj-1789208527126.jpg",
    "sizes": [
      "UK 7",
      "UK 8",
      "UK 9",
      "UK 10"
    ],
    "originalPrice": 80,
    "discountPercentage": 10,
    "salePrice": 72,
    "status": "Available to Order",
    "deliveryTime": "Approximately 2 weeks",
    "collectionPrice": "FREE",
    "deliveryPrice": 2.99,
    "createdAt": "2026-09-12T10:22:29.515Z"
  }
];

export const INITIAL_PRODUCTS: Product[] = RAW_INITIAL_PRODUCTS.map((prod) => ({
  ...prod,
  salePrice: calculateSalePrice(prod.originalPrice, prod.discountPercentage),
}));
