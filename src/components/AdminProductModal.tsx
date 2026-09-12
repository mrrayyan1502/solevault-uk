import React, { useState, useEffect } from 'react';
import { Product, calculateSalePrice } from '../types';
import { uploadImageToServer } from '../utils/storage';
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AdminProductModalProps {
  product: Product | null; // null means adding a new product
  nextSku: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ALL_SIZES = ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  nextSku,
  isOpen,
  onClose,
  onSave,
}) => {
  const [sku, setSku] = useState(nextSku);
  const [name, setName] = useState('');
  const [colour, setColour] = useState('');
  const [image, setImage] = useState('');
  const [sizes, setSizes] = useState<string[]>(['UK 7', 'UK 8', 'UK 9', 'UK 10']);
  const [originalPrice, setOriginalPrice] = useState<number>(74.99);
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [status, setStatus] = useState<Product['status']>('Available to Order');
  const [deliveryTime, setDeliveryTime] = useState('Approximately 2 weeks');
  const [collectionPrice, setCollectionPrice] = useState('FREE');
  const [deliveryPrice, setDeliveryPrice] = useState(2.99);

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setColour(product.colour);
      setImage(product.image);
      setSizes(product.sizes);
      setOriginalPrice(product.originalPrice);
      setDiscountPercentage(product.discountPercentage);
      setStatus(product.status);
      setDeliveryTime(product.deliveryTime);
      setCollectionPrice(product.collectionPrice);
      setDeliveryPrice(product.deliveryPrice);
    } else {
      setSku(nextSku);
      setName('');
      setColour('');
      setImage('');
      setSizes(['UK 7', 'UK 8', 'UK 9', 'UK 10']);
      setOriginalPrice(74.99);
      setDiscountPercentage(10);
      setStatus('Available to Order');
      setDeliveryTime('Approximately 2 weeks');
      setCollectionPrice('FREE');
      setDeliveryPrice(2.99);
    }
  }, [product, nextSku, isOpen]);

  if (!isOpen) return null;

  const currentSalePrice = calculateSalePrice(originalPrice, discountPercentage);

  const handleToggleSize = (size: string) => {
    if (sizes.includes(size)) {
      if (sizes.length > 1) {
        setSizes(sizes.filter((s) => s !== size));
      }
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToServer(file);
      if (url) {
        setImage(url);
        return;
      }
    } catch (err) {
      console.warn('Upload error, using FileReader', err);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedProduct: Product = {
      id: product ? product.id : `prod-${Date.now()}`,
      sku: product ? product.sku : sku,
      name: name.trim(),
      colour: colour.trim() || 'Multicolour',
      image: image.trim(),
      sizes,
      originalPrice: Number(originalPrice),
      discountPercentage: Number(discountPercentage),
      salePrice: currentSalePrice,
      status,
      deliveryTime,
      collectionPrice,
      deliveryPrice: Number(deliveryPrice),
      createdAt: product ? product.createdAt : new Date().toISOString(),
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl text-stone-100 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="font-mono text-xs px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold border border-amber-400/20">
            {product ? product.sku : sku}
          </div>
          <h2 className="text-xl font-bold text-white">
            {product ? `Edit Product ${product.sku}` : 'Add New Shoe Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image preview & uploader */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-stone-950 p-4 rounded-2xl border border-stone-800">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-stone-600" />
              )}
            </div>

            <div className="sm:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-stone-300">
                Shoe Image (File Upload or Image URL)
              </label>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-stone-400">or paste URL below</span>
              </div>

              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Name & Colour */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Shoe Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Performance Runner"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Colour *
              </label>
              <input
                type="text"
                required
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. White / Coral / Purple"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Pricing System: Original Price, Discount %, Calculated Sale Price */}
          <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Pricing & Individual Discount
              </span>
              <span className="text-xs text-stone-400">Auto-calculates final sale price</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  Original Price (£)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 text-sm">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3 top-2.5 text-stone-400 text-sm font-bold">%</span>
                </div>
              </div>

              {/* Live Calculated Sale Price Display */}
              <div className="bg-stone-900 border border-stone-700/80 p-2.5 rounded-xl text-center">
                <span className="text-[11px] text-stone-400 block">Customer Sale Price</span>
                <span className="text-lg font-black text-amber-400">
                  £{currentSalePrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Discount Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400">Quick set discount:</span>
              {[0, 5, 10, 15, 20, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDiscountPercentage(preset)}
                  className={`px-2 py-0.5 text-xs rounded-md font-mono transition-colors ${
                    discountPercentage === preset
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Available Sizes (Tap to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const isActive = sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-sm'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Availability Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Product['status'])}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Available to Order">Available to Order</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Archived">Archived (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Delivery Estimate
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-md transition-colors"
            >
              {product ? 'Save Product Changes' : 'Add Shoe to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
