import React, { useState } from 'react';
import { Product, SaleRecord, AppSettings, calculateSalePrice } from '../types';
import {
  getNextSku,
  getProductShareUrl,
  getCatalogueShareUrl,
  generateCatalogueWhatsAppShareUrl,
  exportStoreData,
  importStoreData,
  resetStoredProducts,
  cleanExtraAndRenumber,
  renumberProducts,
  isUserUploadedImage,
} from '../utils/storage';
import { AdminProductModal } from './AdminProductModal';
import { AdminBatchUploader } from './AdminBatchUploader';
import { AdminSalesEntry } from './AdminSalesEntry';
import { SalesDashboard } from './SalesDashboard';
import { SoleVaultLogo } from './SoleVaultLogo';
import {
  Lock,
  Unlock,
  Plus,
  Layers,
  Search,
  Edit2,
  Trash2,
  Share2,
  Check,
  ShoppingBag,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Phone,
  Key,
  Sparkles,
  Hash,
  CheckCircle2,
  Globe,
  Copy,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  sales: SaleRecord[];
  settings: AppSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSales: (sales: SaleRecord[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onSelectProduct: (sku: string) => void;
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  sales,
  settings,
  onUpdateProducts,
  onUpdateSales,
  onUpdateSettings,
  onSelectProduct,
  onExitAdmin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('solevault_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'catalogue' | 'sales' | 'dashboard' | 'settings'>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Settings local state
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(settings.whatsappNumber);
  const [adminPinInput, setAdminPinInput] = useState(settings.adminPin);
  const [customStoreUrlInput, setCustomStoreUrlInput] = useState(settings.customStoreUrl || '');

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = (settings.adminPin || '1234').trim();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('solevault_admin_auth', 'true');
      } catch {}
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Please check and try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('solevault_admin_auth');
    } catch {}
    onExitAdmin();
  };

  // Product CRUD
  const handleSaveProduct = (savedProduct: Product) => {
    const exists = products.some((p) => p.sku === savedProduct.sku);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.sku === savedProduct.sku ? savedProduct : p));
      showToast(`Updated product ${savedProduct.sku}`);
    } else {
      updated = [savedProduct, ...products];
      showToast(`Added new shoe ${savedProduct.sku}`);
    }
    onUpdateProducts(updated);
  };

  const handleDeleteProduct = (sku: string) => {
    const updated = products.filter((p) => p.sku !== sku);
    onUpdateProducts(updated);
    showToast(`Removed ${sku} from catalogue.`);
  };

  const handleResetToDefault = () => {
    const resetList = resetStoredProducts();
    onUpdateProducts(resetList);
    showToast('Reset catalogue to official 25 user image shoes.');
  };

  const handleCleanExtraAndRenumber = () => {
    const cleaned = cleanExtraAndRenumber(products);
    onUpdateProducts(cleaned);
    showToast(`Cleaned: Keeping ${cleaned.length} uploaded shoes, numbered sequentially from SH01.`);
  };

  const handleRenumberAll = () => {
    const renumbered = renumberProducts(products);
    onUpdateProducts(renumbered);
    showToast(`Renumbered all ${renumbered.length} shoes starting from SH01.`);
  };

  const handleQuickDiscountChange = (sku: string, newDiscount: number) => {
    const updated = products.map((p) => {
      if (p.sku === sku) {
        const discount = Math.max(0, Math.min(100, newDiscount));
        return {
          ...p,
          discountPercentage: discount,
          salePrice: calculateSalePrice(p.originalPrice, discount),
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleQuickPriceChange = (sku: string, newOriginalPrice: number) => {
    const updated = products.map((p) => {
      if (p.sku === sku) {
        const price = Math.max(0, newOriginalPrice);
        return {
          ...p,
          originalPrice: price,
          salePrice: calculateSalePrice(price, p.discountPercentage),
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleBatchImport = (newProducts: Product[], replaceAll?: boolean) => {
    if (replaceAll) {
      onUpdateProducts(newProducts);
      showToast(`Replaced catalogue with ${newProducts.length} new shoes.`);
    } else {
      onUpdateProducts([...products, ...newProducts]);
      showToast(`Added ${newProducts.length} shoes in batch.`);
    }
  };

  // Sales CRUD
  const handleAddSale = (newSale: SaleRecord) => {
    onUpdateSales([newSale, ...sales]);
  };

  const handleDeleteSale = (saleId: string) => {
    onUpdateSales(sales.filter((s) => s.id !== saleId));
    showToast('Sale record deleted');
  };

  // Share link copy
  const handleCopyLink = (sku: string) => {
    const url = getProductShareUrl(sku);
    navigator.clipboard.writeText(url);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Export / Import
  const handleExportData = () => {
    const jsonStr = exportStoreData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Store data downloaded successfully');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content && importStoreData(content)) {
        // Reload from local storage
        window.location.reload();
      } else {
        showToast('Failed to import data. Please verify the JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      whatsappNumber: whatsappNumberInput.trim(),
      adminPin: adminPinInput.trim() || '1234',
      customStoreUrl: customStoreUrlInput.trim(),
    });
    showToast('Settings saved successfully');
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.colour.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="flex justify-center pb-2">
            <SoleVaultLogo variant="full" className="w-40" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Store Owner Access</span>
            </div>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              This area is restricted to the store manager. Enter your 4-digit PIN to edit products, prices, or sales.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter 4-digit PIN (Default: 1234)"
                className="w-full text-center tracking-widest text-xl font-mono px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                autoFocus
              />
              {pinError && (
                <p className="mt-2 text-xs font-semibold text-rose-400">{pinError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                Unlock Admin Panel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(true);
                  try {
                    sessionStorage.setItem('solevault_admin_auth', 'true');
                  } catch {}
                }}
                className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl transition-all border border-stone-700"
                title="Quick Access"
              >
                Direct Open
              </button>
            </div>
            <p className="text-[11px] text-stone-500">Default PIN is <strong className="text-amber-400 font-mono">1234</strong> (can be changed in Settings)</p>
          </form>

          <div className="pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs text-stone-400 hover:text-white transition-colors"
            >
              ← Back to Customer Catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-amber-400 text-stone-950 font-bold text-sm rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <Check className="w-5 h-5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SoleVaultLogo variant="mark" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-400/20 text-amber-400 rounded">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                ADMIN CONTROL PANEL
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">SOLEVAULT UK Management</h1>
            <p className="text-xs text-stone-400">
              Edit products, adjust discounts, record sales, and monitor shoe & size analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
            title="Lock and exit"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock & Exit to Catalogue</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('catalogue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalogue'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalogue & Shoes ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sales'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Record Sales ({sales.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sales & Performance Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Backup</span>
        </button>
      </div>

      {/* TAB 1: CATALOGUE MANAGEMENT */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* UPLOADED VS PLACEHOLDER SMART STATUS BANNER */}
          {products.filter((p) => isUserUploadedImage(p.image)).length > 0 &&
            products.filter((p) => !isUserUploadedImage(p.image)).length > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-950/60 to-stone-900 border border-amber-500/50 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 shrink-0 mt-0.5 border border-amber-400/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Uploaded Photos Ready!</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-400 text-stone-950 font-black">
                        {products.filter((p) => isUserUploadedImage(p.image)).length} Uploaded
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-stone-800 text-stone-400 font-semibold">
                        {products.filter((p) => !isUserUploadedImage(p.image)).length} Extra Placeholders
                      </span>
                    </h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Keep only the shoe images you uploaded, automatically remove all extra placeholders, and assign clean sequential numbering (SH001, SH002, SH003...).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCleanExtraAndRenumber}
                  className="whitespace-nowrap px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Keep Uploaded Only & Renumber</span>
                </button>
              </div>
            )}

          {/* ALL CLEAN CONFIRMATION (When only user-uploaded images remain) */}
          {products.length > 0 &&
            products.every((p) => isUserUploadedImage(p.image)) && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Catalogue Cleaned:</strong> All {products.length} shoes contain your uploaded photos and are numbered sequentially from SH01 to SH{products.length.toString().padStart(2, '0')}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRenumberAll}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] rounded-lg border border-stone-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>Re-check Numbering</span>
                </button>
              </div>
            )}

          {/* Live Sync Banner */}
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-white">Live Cloud Sync Active:</span>
              <span className="text-stone-400">
                Uploaded shoe photos and catalogue changes are saved to the server and appear instantly on your public link.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateProducts([...products]);
                showToast('Catalogue synchronized with live server');
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save & Sync Server Now</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU, name, colour..."
                className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCleanExtraAndRenumber}
                title="Keep only shoes with uploaded images and renumber sequentially"
                className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Clean & Renumber</span>
              </button>

              <button
                type="button"
                onClick={handleRenumberAll}
                title="Renumber all products starting from SH01 sequentially"
                className="flex items-center gap-1.5 px-3 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
              >
                <Hash className="w-3.5 h-3.5 text-stone-400" />
                <span>Renumber (SH01...)</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                title="Reload default 25 shoes catalogue"
                className="flex items-center gap-1.5 px-3 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Batch Upload Photos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Shoe ({getNextSku(products)})</span>
              </button>
            </div>
          </div>

          {/* Products Table with Quick Discount/Price Editor */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[11px] border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Shoe</th>
                    <th className="py-3 px-4">No. / SKU</th>
                    <th className="py-3 px-4">Name & Colour</th>
                    <th className="py-3 px-4">Original (£)</th>
                    <th className="py-3 px-4">Discount (%)</th>
                    <th className="py-3 px-4">Final Sale Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.sku} className="hover:bg-stone-800/40 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          className="w-12 h-12 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 cursor-pointer"
                          onClick={() => onSelectProduct(product.sku)}
                        >
                          <img
                            src={product.image}
                            alt={product.sku}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>

                      {/* No. / SKU */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-stone-800 text-stone-300 font-mono px-1.5 py-0.5 rounded border border-stone-700">
                            #{filteredProducts.indexOf(product) + 1}
                          </span>
                          <span className="text-amber-400 font-bold font-mono">
                            {product.sku}
                          </span>
                          {isUserUploadedImage(product.image) ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-sans font-medium">
                              <Check className="w-2.5 h-2.5" />
                              <span>Your Photo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-stone-800/80 text-stone-400 border border-stone-700 font-sans">
                              Extra Dummy
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name & Colour */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{product.name}</div>
                        <div className="text-stone-400 text-[11px]">{product.colour}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Sizes: {product.sizes.join(' | ')}
                        </div>
                      </td>

                      {/* Editable Original Price */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-500">£</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={product.originalPrice}
                            onChange={(e) =>
                              handleQuickPriceChange(
                                product.sku,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </td>

                      {/* Editable Discount % */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={product.discountPercentage}
                            onChange={(e) =>
                              handleQuickDiscountChange(
                                product.sku,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-16 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-stone-400 font-bold">%</span>
                        </div>
                        {/* Quick Presets */}
                        <div className="flex gap-1 mt-1">
                          {[0, 5, 10, 15].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleQuickDiscountChange(product.sku, pct)}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                product.discountPercentage === pct
                                  ? 'bg-amber-400 text-stone-950 font-bold'
                                  : 'bg-stone-800 text-stone-400 hover:text-white'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Final Sale Price */}
                      <td className="py-3 px-4 font-mono">
                        <span className="text-sm font-extrabold text-amber-300">
                          £{product.salePrice.toFixed(2)}
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="text-[10px] text-emerald-400 block">
                            Save £{(product.originalPrice - product.salePrice).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(product.sku)}
                            title="Copy shareable link"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                          >
                            {copiedSku === product.sku ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            title="Edit product details"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.sku)}
                            title="Delete shoe"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-stone-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL SALES TRACKING */}
      {activeTab === 'sales' && (
        <AdminSalesEntry
          products={products}
          sales={sales}
          onAddSale={handleAddSale}
          onDeleteSale={handleDeleteSale}
        />
      )}

      {/* TAB 3: SALES & PERFORMANCE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <SalesDashboard sales={sales} products={products} />
      )}

      {/* TAB 4: SETTINGS & BACKUP */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Public Catalogue Share Card */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-2xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Public Customer Catalogue Link</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300">
                    Send this URL to customers on WhatsApp, Instagram, or SMS. Customers will see your shoes and can place orders directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const url = getCatalogueShareUrl();
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                    }
                    showToast('Catalogue Link copied to clipboard!');
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Store Link</span>
                </button>

                <a
                  href={generateCatalogueWhatsAppShareUrl(settings.storeName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  <span>View Storefront</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 font-mono text-xs text-amber-400 break-all select-all flex items-center justify-between gap-2">
              <span>{typeof window !== 'undefined' ? getCatalogueShareUrl() : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-2xl">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Store Settings</h3>
                <p className="text-xs text-stone-400">Configure WhatsApp recipient and admin PIN</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Business Phone Number (International Format)</span>
                </label>
                <input
                  type="text"
                  value={whatsappNumberInput}
                  onChange={(e) => setWhatsappNumberInput(e.target.value)}
                  placeholder="e.g. 447911123456"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Enquiries from customers will automatically open a chat with this phone number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Security PIN</span>
                </label>
                <input
                  type="text"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Custom / Public Store Link (Optional)</span>
                </label>
                <input
                  type="url"
                  value={customStoreUrlInput}
                  onChange={(e) => setCustomStoreUrlInput(e.target.value)}
                  placeholder="e.g. https://mybrand.com or https://ais-pre-...run.app"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Leave blank to auto-use your public Google AI Studio preview link.
                </p>
              </div>

              {/* 403 Alert & Advice */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <span>💡 403 Error Solution:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Google AI Studio's internal dev links (<code className="bg-stone-900 px-1 py-0.5 rounded font-mono text-stone-300">ais-dev-...</code>) are private and give 403 errors to anyone else. To activate the public link for all customers, click the <strong>"Share"</strong> button at the top right corner of the Google AI Studio screen!
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Backup & Restore */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-2xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Backup & Restore Data</h3>
                <p className="text-xs text-stone-400">
                  Export your entire 30-shoe catalogue and sales history as JSON
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Export Full Store Backup</div>
                  <div className="text-[11px] text-stone-400">
                    Download a file containing all shoes, prices, discounts, and recorded sales.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Import Store Backup</div>
                  <div className="text-[11px] text-stone-400">
                    Restore products and sales from an existing backup file.
                  </div>
                </div>
                <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-400">Reset to Initial Seed Data</div>
                  <div className="text-[11px] text-stone-400">
                    Resets to the 30 default shoes (SH001 - SH030) and sample sales records.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all shoes and sales to initial default?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold rounded-xl border border-red-800/60 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Edit/Add Product Modal */}
      <AdminProductModal
        product={editingProduct}
        nextSku={getNextSku(products)}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Batch Image Uploader Modal */}
      <AdminBatchUploader
        currentProducts={products}
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImportBatch={handleBatchImport}
      />
    </div>
  );
};
