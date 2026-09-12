import React, { useState } from 'react';
import { Product, calculateSalePrice } from '../types';
import { isUserUploadedImage, uploadImageToServer, identifyShoeFromServer } from '../utils/storage';
import { Upload, X, Check, Image as ImageIcon, Layers, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

interface AdminBatchUploaderProps {
  currentProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (newProducts: Product[], replaceAll?: boolean) => void;
}

interface QueuedItem {
  sku: string;
  name: string;
  colour: string;
  image: string;
  originalPrice: number;
  discountPercentage: number;
  sizes: string[];
}

export const AdminBatchUploader: React.FC<AdminBatchUploaderProps> = ({
  currentProducts,
  isOpen,
  onClose,
  onImportBatch,
}) => {
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<string | null>(null);

  const [startSkuNum, setStartSkuNum] = useState<number>(() => {
    let max = 0;
    currentProducts.forEach((p) => {
      const match = p.sku.match(/^SH(\d+)$/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    });
    return max + 1;
  });

  // Default to true so user shoe photos start cleanly from SH001
  const [isFreshStart, setIsFreshStart] = useState<boolean>(true);
  const [dedupNotice, setDedupNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleFreshStart = (checked: boolean) => {
    setIsFreshStart(checked);
    const base = checked ? 1 : startSkuNum;
    setQueuedItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        sku: `SH${(base + idx).toString().padStart(2, '0')}`,
      }))
    );
  };

  const processFiles = async (fileList: File[]) => {
    if (fileList.length === 0) return;
    setIsProcessing(true);

    // Deduplicate selected files by filename and size
    const seenFiles = new Set<string>();
    const uniqueFiles: File[] = [];
    let duplicatesCount = 0;

    fileList.forEach((file: File) => {
      const key = `${file.name.toLowerCase().trim()}_${file.size}`;
      if (seenFiles.has(key)) {
        duplicatesCount++;
      } else {
        seenFiles.add(key);
        uniqueFiles.push(file);
      }
    });

    if (duplicatesCount > 0) {
      setDedupNotice(`Identified and automatically removed ${duplicatesCount} duplicate image(s).`);
      setTimeout(() => setDedupNotice(null), 5000);
    }

    let baseNumber = isFreshStart ? 1 : startSkuNum;
    const newItems: QueuedItem[] = [];

    for (let index = 0; index < uniqueFiles.length; index++) {
      const file = uniqueFiles[index];
      const currentNumber = baseNumber + queuedItems.length + index;
      const formattedSku = `SH${currentNumber.toString().padStart(2, '0')}`;
      
      setProcessProgress(`Uploading & identifying shoe ${index + 1} of ${uniqueFiles.length}...`);

      // Attempt server upload for permanent static URL, falls back to data URL
      const imageUrl = await uploadImageToServer(file);

      // Clean raw filename and filter placeholder names
      let fallbackName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      
      if (
        fallbackName.toLowerCase().includes('gemini') ||
        fallbackName.toLowerCase().includes('generated') ||
        fallbackName.length < 3 ||
        fallbackName.length > 35
      ) {
        fallbackName = `Performance Runner ${formattedSku}`;
      }

      // Dynamically identify brand, model, and colourway via AI
      let detectedName = fallbackName;
      let detectedColour = 'Standard Colourway';
      try {
        const identified = await identifyShoeFromServer(imageUrl);
        if (identified && identified.name && !identified.name.includes('Performance Runner')) {
          detectedName = identified.name;
          detectedColour = identified.colour || 'Standard Colourway';
        }
      } catch {
        // use fallbackName
      }

      newItems.push({
        sku: formattedSku,
        name: detectedName,
        colour: detectedColour,
        image: imageUrl,
        originalPrice: 74.99,
        discountPercentage: 10,
        sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
      });
    }

    setQueuedItems((prev) => [...prev, ...newItems]);
    setIsProcessing(false);
    setProcessProgress(null);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleItemChange = (index: number, field: keyof QueuedItem, value: any) => {
    setQueuedItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setQueuedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = () => {
    if (queuedItems.length === 0) return;

    const productsToAdd: Product[] = queuedItems.map((item, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      sku: item.sku,
      name: item.name || `Shoe ${item.sku}`,
      colour: item.colour || 'Standard Colourway',
      image: item.image,
      sizes: item.sizes,
      originalPrice: item.originalPrice,
      discountPercentage: item.discountPercentage,
      salePrice: calculateSalePrice(item.originalPrice, item.discountPercentage),
      status: 'Available to Order',
      deliveryTime: 'Approximately 2 weeks',
      collectionPrice: 'FREE',
      deliveryPrice: 2.99,
      createdAt: new Date().toISOString(),
    }));

    onImportBatch(productsToAdd, isFreshStart);
    setQueuedItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl text-stone-100 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Batch Shoe Image Uploader</h2>
            <p className="text-xs text-stone-400">
              Upload multiple shoe photos (up to 10 or 30 at a time). Automatically assigns sequential SKUs!
            </p>
          </div>
        </div>

        {/* Upload Zone with Drag and Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all mb-6 ${
            isDragging
              ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
              : 'border-stone-700 hover:border-amber-400/60 bg-stone-950/60'
          }`}
        >
          {isProcessing ? (
            <div className="py-4 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-white">
                {processProgress || 'Uploading and optimizing shoe photos...'}
              </p>
              <span className="text-xs text-stone-400">Saving directly to store server</span>
            </div>
          ) : (
            <>
              <Upload className={`w-10 h-10 mx-auto mb-2 transition-colors ${isDragging ? 'text-amber-400' : 'text-stone-500'}`} />
              <h3 className="text-sm font-semibold text-stone-200">
                {isDragging ? 'Drop your shoe images here!' : 'Drag & drop all your shoe images here, or click below'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                Supports all images at once in JPG, PNG, or WEBP. Automatically assigns SKUs (SH01, SH02...).
              </p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-colors">
                <Plus className="w-4 h-4" />
                <span>Select Shoe Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>
            </>
          )}

          {dedupNotice && (
            <div className="mt-4 p-2.5 bg-amber-950/70 border border-amber-800/80 rounded-xl text-amber-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <Check className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{dedupNotice}</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-950 rounded-xl border border-stone-800 mb-6 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isFreshStart}
                onChange={(e) => handleToggleFreshStart(e.target.checked)}
                className="rounded bg-stone-800 border-stone-700 text-amber-400 focus:ring-0"
              />
              <span>Replace entire catalogue (Start fresh from SH01)</span>
            </label>
          </div>

          <div className="text-stone-400">
            Loaded in batch: <strong className="text-amber-400">{queuedItems.length} shoes</strong>
          </div>
        </div>

        {/* Queued Items List */}
        {queuedItems.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mb-6">
            {queuedItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs"
              >
                <div className="md:col-span-2 flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.sku}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-mono font-bold text-amber-400">{item.sku}</span>
                </div>

                <div className="md:col-span-4">
                  <label className="text-[10px] text-stone-400 block">Shoe Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] text-stone-400 block">Colour</label>
                  <input
                    type="text"
                    value={item.colour}
                    onChange={(e) => handleItemChange(index, 'colour', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-stone-400 block">Discount %</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountPercentage}
                      onChange={(e) =>
                        handleItemChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                    />
                    <span className="text-[10px] text-stone-400">
                      £{calculateSalePrice(item.originalPrice, item.discountPercentage).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-800">
          <span className="text-xs text-stone-500">
            Original price defaults to £74.99 with editable discounts.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={queuedItems.length === 0}
              onClick={handleConfirmImport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                queuedItems.length > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Import {queuedItems.length} Shoes to Store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
