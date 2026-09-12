import React, { useState } from 'react';
import { Lock, Sparkles, Layers, Share2, Check, MessageCircle, Copy, ShieldCheck } from 'lucide-react';
import { getCatalogueShareUrl, generateCatalogueWhatsAppShareUrl } from '../utils/storage';
import { SoleVaultLogo } from './SoleVaultLogo';

interface NavbarProps {
  currentView: 'catalogue' | 'product' | 'admin';
  onChangeView: (view: 'catalogue' | 'admin') => void;
  activeSku?: string | null;
  itemCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  activeSku,
  itemCount,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = getCatalogueShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const handleWhatsAppShare = () => {
    const waUrl = generateCatalogueWhatsAppShareUrl();
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onChangeView('catalogue')}
          className="flex items-center cursor-pointer group select-none transition-transform hover:opacity-95 active:scale-98"
          title="SOLEVAULT UK - Home"
        >
          <SoleVaultLogo variant="horizontal" size="md" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Catalogue Dropdown/Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-all"
              title="Share Catalogue Link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">Share Catalogue</span>
              <span className="sm:hidden">Share</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 p-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Share Public Catalogue
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Public Link
                  </span>
                </div>

                <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-mono text-amber-400 break-all select-all">
                  {getCatalogueShareUrl()}
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-stone-950 transition-colors shadow-md active:scale-95"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{copied ? 'Public Link Copied!' : 'Copy Public Catalogue Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <a
                    href={getCatalogueShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 transition-colors border border-stone-700"
                  >
                    <span>Test Public Link In New Tab</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-300 space-y-1">
                  <p className="text-amber-300 font-bold">
                    ⚠️ 404 (Page Not Found) kyun aa raha hai?
                  </p>
                  <p className="text-stone-400 text-[10px] leading-relaxed">
                    Google AI Studio mein public link tab active hota hai jab aap screen ke bilkul upar right side par <strong>"Share"</strong> button dabakar <strong>"Share App"</strong> confirm karte hain.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Catalogue Button */}
          <button
            type="button"
            onClick={() => onChangeView('catalogue')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'catalogue'
                ? 'bg-stone-800 text-white border border-stone-700'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Catalogue</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-stone-900 text-stone-300 rounded-full">
              {itemCount}
            </span>
          </button>

          {/* Quick WhatsApp Contact */}
          <a
            href="https://wa.me/447454291587?text=Hi%20SOLEVAULT%20UK,%20I%20have%20an%20enquiry%20about%20your%20shoes."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95"
            title="Chat with us on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Admin Exit Button (Only visible when store owner is actively in Admin View) */}
          {currentView === 'admin' && (
            <button
              type="button"
              onClick={() => onChangeView('catalogue')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-stone-950 shadow-md hover:bg-amber-300 transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
