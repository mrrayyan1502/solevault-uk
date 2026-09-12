import React, { useState, useEffect, useMemo } from 'react';
import { Product, SaleRecord, AppSettings } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  fetchServerProducts,
  getStoredSales,
  saveStoredSales,
  fetchServerSales,
  getStoredSettings,
  saveStoredSettings,
  fetchServerSettings,
  getCatalogueShareUrl,
  generateCatalogueWhatsAppShareUrl,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { PromoTimerBar } from './components/PromoTimerBar';
import { SoleVaultLogo } from './components/SoleVaultLogo';
import { ProductCard } from './components/ProductCard';
import { ProductPage } from './components/ProductPage';
import { AdminPanel } from './components/AdminPanel';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  Truck,
  MessageCircle,
  Footprints,
  Sparkles,
  Share2,
  Check,
  Copy,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [sales, setSales] = useState<SaleRecord[]>(() => getStoredSales());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  // Views: 'catalogue' | 'product' | 'admin'
  const [currentView, setCurrentView] = useState<'catalogue' | 'product' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#/admin') return 'admin';
      if (window.location.hash.startsWith('#/product/')) return 'product';
      return 'catalogue';
    }
    return 'catalogue';
  });
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('ALL');
  const [selectedColourFilter, setSelectedColourFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount-desc'>('default');
  const [bannerCopied, setBannerCopied] = useState<boolean>(false);

  const handleCopyCatalogue = () => {
    const url = getCatalogueShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setBannerCopied(true);
    setTimeout(() => setBannerCopied(false), 2000);
  };

  // Sync state with server backend so shared public links load latest catalogue and uploaded images
  useEffect(() => {
    fetchServerProducts().then((serverProds) => {
      if (serverProds && Array.isArray(serverProds) && serverProds.length > 0) {
        setProducts(serverProds);
      }
    });
    fetchServerSales().then((serverSales) => {
      if (serverSales && Array.isArray(serverSales) && serverSales.length > 0) {
        setSales(serverSales);
      }
    });
    fetchServerSettings().then((serverSettings) => {
      if (serverSettings) {
        setSettings(serverSettings);
      }
    });
  }, []);

  // Handle URL Hash for individual product links (e.g. #/product/SH008 or path /product/SH008)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/product\/([A-Za-z0-9_-]+)/i);
      if (match && match[1]) {
        const skuFromUrl = match[1].toUpperCase();
        setSelectedSku(skuFromUrl);
        setCurrentView('product');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('catalogue');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update localStorage whenever state changes
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleUpdateSales = (newSales: SaleRecord[]) => {
    setSales(newSales);
    saveStoredSales(newSales);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Navigating to product
  const handleSelectProduct = (sku: string) => {
    setSelectedSku(sku);
    setCurrentView('product');
    window.location.hash = `#/product/${sku}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalogue = () => {
    setSelectedSku(null);
    setCurrentView('catalogue');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeView = (view: 'catalogue' | 'admin') => {
    if (view === 'catalogue') {
      handleBackToCatalogue();
    } else {
      setCurrentView('admin');
      window.location.hash = '#/admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extract unique colours for filter
  const availableColours = useMemo(() => {
    const colours = new Set<string>();
    products.forEach((p) => {
      // Extract main words or primary colour
      const parts = p.colour.split(/[\/,]/);
      parts.forEach((c) => {
        const trimmed = c.trim();
        if (trimmed.length > 2) colours.add(trimmed);
      });
    });
    return Array.from(colours).slice(0, 12);
  }, [products]);

  // Filtered and Sorted Products for Catalogue
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude archived from public customer catalogue
        if (p.status === 'Archived') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchName = p.name.toLowerCase().includes(q);
          const matchColour = p.colour.toLowerCase().includes(q);
          if (!matchSku && !matchName && !matchColour) return false;
        }

        // Size filter
        if (selectedSizeFilter !== 'ALL') {
          if (!p.sizes.includes(selectedSizeFilter)) return false;
        }

        // Colour filter
        if (selectedColourFilter !== 'ALL') {
          if (!p.colour.toLowerCase().includes(selectedColourFilter.toLowerCase())) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
        if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
        if (sortBy === 'discount-desc') return b.discountPercentage - a.discountPercentage;
        // Default: SKU order
        return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [products, searchQuery, selectedSizeFilter, selectedColourFilter, sortBy]);

  // Active product for individual product view
  const activeProduct = useMemo(() => {
    if (!selectedSku) return null;
    return products.find((p) => p.sku.toUpperCase() === selectedSku.toUpperCase()) || null;
  }, [selectedSku, products]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-400 selection:text-stone-950">
      {/* Top Countdown Promotional Timer */}
      <PromoTimerBar discountPercent={10} promoTitle="LIMITED TIME FLASH DEAL" />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onChangeView={handleChangeView}
        activeSku={selectedSku}
        itemCount={products.filter((p) => p.status !== 'Archived').length}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {/* VIEW 1: INDIVIDUAL PRODUCT VIEW (/product/SH008) */}
        {currentView === 'product' && activeProduct && (
          <ProductPage
            product={activeProduct}
            whatsappNumber={settings.whatsappNumber}
            onBackToCatalogue={handleBackToCatalogue}
          />
        )}

        {/* VIEW 1b: Product not found fallback */}
        {currentView === 'product' && !activeProduct && (
          <div className="max-w-md mx-auto my-20 p-8 bg-stone-900 border border-stone-800 rounded-3xl text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Shoe Not Found</h2>
            <p className="text-xs text-stone-400">
              The product SKU <strong className="text-amber-400 font-mono">{selectedSku}</strong> could not be located in our catalogue.
            </p>
            <button
              type="button"
              onClick={handleBackToCatalogue}
              className="px-5 py-2.5 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors"
            >
              Browse Full Catalogue
            </button>
          </div>
        )}

        {/* VIEW 2: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel
            products={products}
            sales={sales}
            settings={settings}
            onUpdateProducts={handleUpdateProducts}
            onUpdateSales={handleUpdateSales}
            onUpdateSettings={handleUpdateSettings}
            onSelectProduct={handleSelectProduct}
            onExitAdmin={handleBackToCatalogue}
          />
        )}

        {/* VIEW 3: CUSTOMER-FACING CATALOGUE (READ-ONLY) */}
        {currentView === 'catalogue' && (
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
            {/* Store Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Footwear Vault • Handpicked Sneakers</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                  SOLEVAULT <span className="text-amber-400">UK</span>
                </h1>

                <p className="text-sm md:text-base text-stone-300">
                  Browse our exclusive range of performance runners, retro classics, and street trainers. Order directly on WhatsApp with free UK collection.
                </p>

                {/* Value Props Bar */}
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-stone-300">
                  <div className="flex items-center gap-1.5 bg-stone-950/60 px-3 py-1.5 rounded-xl border border-stone-800">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Collection: <strong>FREE</strong> | Delivery: <strong>£2.99</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-950/60 px-3 py-1.5 rounded-xl border border-stone-800">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Instant WhatsApp Enquiries</span>
                  </div>
                </div>

                {/* Quick Share Catalogue Link */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCatalogue}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {bannerCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{bannerCopied ? 'Catalogue Link Copied!' : 'Copy Catalogue Link'}</span>
                  </button>

                  <a
                    href={generateCatalogueWhatsAppShareUrl(settings.storeName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Official Brand Logo Emblem */}
              <div className="relative z-10 shrink-0 p-6 md:p-8 bg-stone-950/80 rounded-3xl border border-stone-800/90 shadow-2xl backdrop-blur-sm hidden sm:flex items-center justify-center">
                <SoleVaultLogo variant="full" className="w-48 md:w-56" />
              </div>
            </div>

            {/* Search and Filtering Toolbar */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Bar */}
                <div className="md:col-span-6 relative">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by SKU (e.g. SH008), shoe name, or colour..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-500 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Size Filter */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                    {['ALL', 'UK 7', 'UK 8', 'UK 9', 'UK 10'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSizeFilter(sz)}
                        className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                          selectedSizeFilter === sz
                            ? 'bg-amber-400 text-stone-950 shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort dropdown */}
                <div className="md:col-span-3">
                  <div className="relative">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full pl-9 pr-8 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400 appearance-none font-medium"
                    >
                      <option value="default">Sort: SKU Number (SH001...)</option>
                      <option value="discount-desc">Highest Discount %</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Colour Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
                <span className="text-stone-500 text-[11px] whitespace-nowrap">Filter by Colour:</span>
                <button
                  type="button"
                  onClick={() => setSelectedColourFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedColourFilter === 'ALL'
                      ? 'bg-stone-800 text-amber-400 border border-amber-400/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  All Colours
                </button>
                {availableColours.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColourFilter(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedColourFilter === c
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span>
                Showing <strong className="text-white font-mono">{filteredProducts.length}</strong> shoes in catalogue
              </span>
              {(searchQuery || selectedSizeFilter !== 'ALL' || selectedColourFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSizeFilter('ALL');
                    setSelectedColourFilter('ALL');
                  }}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
                <Footprints className="w-12 h-12 mx-auto text-stone-600" />
                <h3 className="text-lg font-bold text-white">No shoes found</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  No shoes matched your search criteria. Try removing filters or searching for another SKU.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSizeFilter('ALL');
                    setSelectedColourFilter('ALL');
                  }}
                  className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.sku}
                    product={product}
                    whatsappNumber={settings.whatsappNumber}
                    onSelectProduct={handleSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-800/80 bg-stone-950 py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SoleVaultLogo variant="mark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-300">SOLEVAULT UK</span>
              <span>•</span>
              <span>Premium Footwear & Lifestyle</span>
              <span>•</span>
              <span>🇬🇧 United Kingdom</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Free UK Collection</span>
            <span>•</span>
            <span>£2.99 Standard Delivery</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleChangeView('admin')}
              className="text-stone-600 hover:text-amber-400 transition-colors p-1 flex items-center gap-1 text-[11px]"
              title="Store Owner Portal (PIN Protected)"
              aria-label="Owner portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="opacity-80">Owner</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
