import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateWhatsAppUrl, getProductShareUrl, resolveImageUrl } from '../utils/storage';
import { MessageCircle, Share2, ArrowLeft, Check, Clock, ShieldCheck, Truck, Sparkles, Footprints, Flame } from 'lucide-react';
import { SoleVaultLogo } from './SoleVaultLogo';

interface ProductPageProps {
  product: Product;
  whatsappNumber: string;
  onBackToCatalogue: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  whatsappNumber,
  onBackToCatalogue,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'UK 9');
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  const filename = product.image.split('/').pop() || product.image;

  const handleCopyLink = () => {
    const url = getProductShareUrl(product.sku);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleWhatsAppEnquire = () => {
    const url = generateWhatsAppUrl(product, selectedSize, whatsappNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const preparedMessage = `Hi, I'm interested in ${product.sku} - ${product.name}, Size ${selectedSize}.`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToCatalogue}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share Shoe Link</span>
            </>
          )}
        </button>
      </div>

      {/* Main Product Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 grid grid-cols-1 md:grid-cols-2">
        {/* Left: Large Shoe Image */}
        <div className="relative aspect-square md:aspect-auto w-full bg-stone-950 flex items-center justify-center p-4">
          {!imageError ? (
            <img
              src={resolveImageUrl(product.image)}
              alt={`${product.sku} - ${product.name}`}
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-stone-950/90 rounded-2xl border border-stone-800">
              <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-amber-400 mb-3 shadow-inner">
                <Footprints className="w-12 h-12" />
              </div>
              <span className="font-mono text-base text-amber-400 font-bold">{product.sku}</span>
              <span className="font-mono text-xs text-stone-400 mt-1 max-w-[240px] truncate bg-stone-900/90 px-3 py-1 rounded border border-stone-800">
                {filename}
              </span>
              <p className="text-xs text-stone-400 mt-3 max-w-[200px]">
                Product Asset: {filename}
              </p>
            </div>
          )}

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-6 left-6 bg-red-600 text-white font-black text-sm px-3.5 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
              {product.discountPercentage}% OFF
            </div>
          )}

          {/* SKU Pill */}
          <div className="absolute top-6 right-6 bg-stone-950/80 backdrop-blur-md text-amber-400 border border-stone-700/80 font-mono text-sm font-bold px-3 py-1 rounded-xl">
            {product.sku}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SoleVaultLogo variant="mark" size="sm" />
                  <span className="font-mono text-xs tracking-widest text-amber-400 font-bold uppercase">
                    SOLEVAULT UK • {product.sku}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {product.status}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                {product.name}
              </h1>

              <p className="text-stone-400 text-sm mt-1">
                Colour: <strong className="text-stone-200">{product.colour}</strong>
              </p>
            </div>

            {/* Price section */}
            <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-1">
              {product.discountPercentage > 0 ? (
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-stone-500 line-through">
                    Original Price: £{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-xs text-stone-400">Regular Retail Price</span>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  £{product.salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  VAT & import duties included
                </span>
              </div>

              {product.discountPercentage > 0 && (
                <div className="pt-2 mt-2 border-t border-stone-800/80 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{product.discountPercentage}% Discount Active • Limited-time offer ending soon tonight!</span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-stone-300">Select Available Size:</span>
                <span className="text-xs text-amber-400 font-mono">Selected: {selectedSize}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-bold rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md scale-102'
                          : 'bg-stone-800/90 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery & Collection Info */}
            <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Delivery: <strong>{product.deliveryTime}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Collection: <strong className="text-emerald-400">{product.collectionPrice}</strong> | Standard UK Delivery: <strong>£{product.deliveryPrice.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            {/* Prepared Message Preview */}
            <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>PREPARED WHATSAPP ENQUIRY:</span>
              </div>
              <p className="text-stone-200 italic font-mono bg-stone-900/90 p-2 rounded-lg border border-stone-800/70">
                "{preparedMessage}"
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleWhatsAppEnquire}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-950/50 transition-all transform active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Order / Enquire on WhatsApp</span>
            </button>

            <p className="text-center text-xs text-stone-500">
              Opens WhatsApp directly with SKU {product.sku} & Size {selectedSize} prefilled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
