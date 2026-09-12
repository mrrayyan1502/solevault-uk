import React, { useState } from 'react';
import { Product, SaleRecord } from '../types';
import { ShoppingBag, Plus, Calendar, Tag, Check, Trash2, Search } from 'lucide-react';

interface AdminSalesEntryProps {
  products: Product[];
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onDeleteSale: (saleId: string) => void;
}

export const AdminSalesEntry: React.FC<AdminSalesEntryProps> = ({
  products,
  sales,
  onAddSale,
  onDeleteSale,
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(products[0]?.sku || 'SH001');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [size, setSize] = useState<string>('UK 9');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const selectedProduct = products.find((p) => p.sku === selectedSku) || products[0];

  const [actualSellingPrice, setActualSellingPrice] = useState<number>(
    selectedProduct ? selectedProduct.salePrice : 67.49
  );

  const handleSkuChange = (sku: string) => {
    setSelectedSku(sku);
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      setActualSellingPrice(prod.salePrice);
      if (prod.sizes.length > 0 && !prod.sizes.includes(size)) {
        setSize(prod.sizes[0]);
      }
    }
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      date,
      sku: selectedProduct.sku,
      shoeName: selectedProduct.name,
      size,
      quantity: Number(quantity) || 1,
      actualSellingPrice: Number(actualSellingPrice),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddSale(newSale);
    setNotes('');
    setSuccessToast(`Saved sale: ${newSale.quantity}x ${newSale.sku} (${newSale.size}) for £${(newSale.actualSellingPrice * newSale.quantity).toFixed(2)}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredSales = sales.filter((s) => {
    const q = searchFilter.toLowerCase();
    return (
      s.sku.toLowerCase().includes(q) ||
      s.shoeName.toLowerCase().includes(q) ||
      s.size.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Manual Sales Entry Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Manual Sales Entry</h2>
            <p className="text-xs text-stone-400">
              Record customer orders and sales to immediately update performance analytics
            </p>
          </div>
        </div>

        {successToast && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        <form onSubmit={handleSaveSale} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Date of Sale *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* SKU / Shoe Picker */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Shoe (SKU & Name) *</span>
              </label>
              <select
                value={selectedSku}
                onChange={(e) => handleSkuChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>
                    {p.sku} — {p.name} ({p.colour}) [Catalogue Price: £{p.salePrice.toFixed(2)}]
                  </option>
                ))}
              </select>
            </div>

            {/* Automatically Display Shoe Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                Shoe Name (Automatic)
              </label>
              <div className="px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-amber-300 font-medium truncate">
                {selectedProduct ? selectedProduct.name : 'Select a shoe'}
              </div>
            </div>

            {/* Size Sold */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Size Sold *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                {(selectedProduct?.sizes || ['UK 7', 'UK 8', 'UK 9', 'UK 10']).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Actual Selling Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Actual Selling Price per Pair (£) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 text-sm">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={actualSellingPrice}
                  onChange={(e) => setActualSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Optional Notes (Customer name, WhatsApp chat, delivery method, etc.)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. WhatsApp buyer, free collection, repeat customer"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Form Submit Bar */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <div className="text-xs text-stone-400">
              Total for this transaction:{' '}
              <strong className="text-lg font-bold text-white">
                £{(actualSellingPrice * quantity).toFixed(2)}
              </strong>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record & Save Sale</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recorded Sales History */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Sales History Log</h3>
            <p className="text-xs text-stone-400">
              {sales.length} recorded sale transactions (persisted automatically)
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by SKU, shoe or size..."
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-8 text-center bg-stone-950 rounded-2xl border border-stone-800 text-stone-500 text-sm">
            No sales matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[11px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Shoe Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Price / Total</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-400">{sale.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{sale.sku}</td>
                    <td className="py-3 px-4 font-medium text-white">{sale.shoeName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono font-bold text-stone-200">
                        {sale.size}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-100">{sale.quantity}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-white font-bold">
                        £{(sale.actualSellingPrice * sale.quantity).toFixed(2)}
                      </span>
                      {sale.quantity > 1 && (
                        <span className="text-[10px] text-stone-400 block">
                          (£{sale.actualSellingPrice.toFixed(2)} each)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-400 italic max-w-xs truncate">
                      {sale.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteSale(sale.id)}
                        title="Delete sale record"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
