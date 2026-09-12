import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateWhatsAppUrl, getProductShareUrl, resolveImageUrl } from '../utils/storage';
import { MessageCircle, Share2, Check, ArrowUpRight, Clock, Truck, Footprints, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  onSelectProduct: (sku: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber,
  onSelectProduct,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'UK 9');
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  const filename = product.image.split('/').pop() || product.image;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getProductShareUrl(product.sku);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateWhatsAppUrl(product, selectedSize, whatsappNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={`product-card-${product.sku}`}
      onClick={() => onSelectProduct(product.sku)}
      className="group relative flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 cursor-pointer text-stone-100"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-950 overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={resolveImageUrl(product.image)}
            alt={`${product.sku} - ${product.name}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-950/90 border-b border-stone-800">
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-amber-400/90 mb-2.5 shadow-inner">
              <Footprints className="w-8 h-8" />
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold">{product.sku}</span>
            <span className="font-mono text-[11px] text-stone-400 mt-1 max-w-[180px] truncate bg-stone-900/90 px-2 py-0.5 rounded border border-stone-800">
              {filename}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            <Flame className="w-3 h-3 fill-white" />
            <span>{product.discountPercentage}% OFF • ENDING SOON</span>
          </div>
        )}

        {/* SKU Badge */}
        <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md text-stone-300 border border-stone-700/60 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg">
          {product.sku}
        </div>

        {/* Quick Share Overlay Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy shareable link"
          className="absolute bottom-3 right-3 p-2 bg-stone-900/85 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl backdrop-blur-md transition-colors border border-stone-700/50"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              {product.sku}
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {product.status}
            </span>
          </div>

          <h3 className="mt-1 text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
            {product.colour}
          </p>
        </div>

        {/* Available Sizes Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Available Sizes:</span>
            <span className="text-[11px] font-mono text-stone-400">Selected: <strong className="text-white">{selectedSize}</strong></span>
          </div>
          <div className="grid grid-cols-4 gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing System */}
        <div className="pt-2 border-t border-stone-800 flex items-end justify-between">
          <div>
            {product.discountPercentage > 0 ? (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-stone-400 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-900/60 px-1.5 py-0.2 rounded">
                  {product.discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-xs text-stone-400 block mb-0.5">Standard Price</span>
            )}
            <div className="text-2xl font-black text-white tracking-tight">
              £{product.salePrice.toFixed(2)}
            </div>
          </div>

          <div className="text-right text-[11px] text-stone-400 space-y-0.5">
            <div className="flex items-center justify-end gap-1 text-stone-300">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{product.deliveryTime}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-emerald-400 font-semibold">Collection: {product.collectionPrice}</span>
              <span className="text-stone-400">|</span>
              <span>Delivery: £{product.deliveryPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Enquire / Order</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectProduct(product.sku)}
            className="w-full flex items-center justify-center gap-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
