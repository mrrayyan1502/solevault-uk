import React from 'react';
import { SaleRecord, Product } from '../types';
import { TrendingUp, Package, PoundSterling, Award, BarChart3, PieChart, ArrowUpRight } from 'lucide-react';

interface SalesDashboardProps {
  sales: SaleRecord[];
  products: Product[];
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ sales, products }) => {
  // 1. Total pairs sold
  const totalPairsSold = sales.reduce((acc, s) => acc + s.quantity, 0);

  // 2. Total sales revenue (£)
  const totalRevenue = sales.reduce((acc, s) => acc + s.actualSellingPrice * s.quantity, 0);

  // 3. Total distinct products sold
  const distinctSkusSold = new Set(sales.map((s) => s.sku)).size;

  // 4. Sales by Shoe (Units & Revenue)
  const shoeMap: Record<
    string,
    { sku: string; shoeName: string; units: number; revenue: number }
  > = {};

  sales.forEach((s) => {
    if (!shoeMap[s.sku]) {
      const prod = products.find((p) => p.sku === s.sku);
      shoeMap[s.sku] = {
        sku: s.sku,
        shoeName: prod ? prod.name : s.shoeName,
        units: 0,
        revenue: 0,
      };
    }
    shoeMap[s.sku].units += s.quantity;
    shoeMap[s.sku].revenue += s.actualSellingPrice * s.quantity;
  });

  const salesByShoe = Object.values(shoeMap).sort((a, b) => b.units - a.units || b.revenue - a.revenue);

  // Best selling shoe
  const bestSellingShoe = salesByShoe[0] || null;

  // 5. Sales by Size (Units & Revenue)
  const sizeMap: Record<string, { size: string; units: number; revenue: number }> = {};
  sales.forEach((s) => {
    if (!sizeMap[s.size]) {
      sizeMap[s.size] = { size: s.size, units: 0, revenue: 0 };
    }
    sizeMap[s.size].units += s.quantity;
    sizeMap[s.size].revenue += s.actualSellingPrice * s.quantity;
  });

  // Sort standard sizes nicely: UK 7, UK 8, UK 9, UK 10, etc.
  const salesBySize = Object.values(sizeMap).sort((a, b) => b.units - a.units);
  const bestSellingSize = salesBySize[0] || null;

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Pairs Sold */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Pairs Sold</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">{totalPairsSold}</div>
            <p className="text-[11px] text-stone-400 mt-1">Total footwear units sold</p>
          </div>
        </div>

        {/* Total Sales (£) */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Sales (£)</span>
            <PoundSterling className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              £{totalRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Cumulative sales revenue</p>
          </div>
        </div>

        {/* Total Products Sold */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <span>Products Sold</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">{distinctSkusSold}</div>
            <p className="text-[11px] text-stone-400 mt-1">Distinct designs ordered</p>
          </div>
        </div>

        {/* Top Shoe */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <span>Best-Selling Shoe</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            {bestSellingShoe ? (
              <>
                <div className="text-lg font-black text-amber-400 truncate">
                  {bestSellingShoe.sku} — {bestSellingShoe.units} pairs
                </div>
                <p className="text-[11px] text-stone-300 truncate mt-0.5">
                  {bestSellingShoe.shoeName} (£{bestSellingShoe.revenue.toFixed(2)})
                </p>
              </>
            ) : (
              <span className="text-stone-500 text-sm">No sales yet</span>
            )}
          </div>
        </div>

        {/* Top Size */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <span>Best-Selling Size</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            {bestSellingSize ? (
              <>
                <div className="text-2xl font-black text-purple-400 font-mono">
                  {bestSellingSize.size}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {bestSellingSize.units} pairs sold (
                  {totalPairsSold > 0
                    ? Math.round((bestSellingSize.units / totalPairsSold) * 100)
                    : 0}
                  % of total)
                </p>
              </>
            ) : (
              <span className="text-stone-500 text-sm">No sales yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Rankings: Top Performing Shoes & Top Selling Sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Shoes */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Top Performing Shoes</h3>
              <p className="text-xs text-stone-400">Total volume and revenue per shoe model</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              Ranked by pairs
            </span>
          </div>

          {salesByShoe.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">No sales recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {salesByShoe.slice(0, 7).map((item, index) => {
                const percentage =
                  totalPairsSold > 0 ? (item.units / totalPairsSold) * 100 : 0;
                return (
                  <div key={item.sku} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-stone-800 text-stone-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          #{index + 1}
                        </span>
                        <span className="font-mono font-bold text-amber-400">{item.sku}</span>
                        <span className="text-stone-300 font-medium truncate max-w-[150px] sm:max-w-xs">
                          {item.shoeName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white font-mono">{item.units} pairs</span>
                        <span className="text-stone-500 text-[11px] ml-1.5 font-mono">
                          (£{item.revenue.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Selling Sizes */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Top Selling Sizes</h3>
              <p className="text-xs text-stone-400">Footwear demand distribution by UK size</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-lg border border-purple-400/20">
              UK Sizes
            </span>
          </div>

          {salesBySize.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">No sales recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {salesBySize.map((item) => {
                const percentage =
                  totalPairsSold > 0 ? (item.units / totalPairsSold) * 100 : 0;
                return (
                  <div key={item.size} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-stone-800 font-mono font-bold text-stone-200">
                          {item.size}
                        </span>
                        <span className="text-stone-400">
                          {Math.round(percentage)}% of store sales
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white font-mono">{item.units} pairs sold</span>
                        <span className="text-stone-500 text-[11px] ml-1.5 font-mono">
                          (£{item.revenue.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2.5 rounded-full bg-stone-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Tables: Sales by Shoe & Sales by Size */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Full Sales By Shoe Table */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Complete Sales Breakdown by Shoe</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Shoe Name</th>
                  <th className="py-3 px-3 text-right">Units Sold</th>
                  <th className="py-3 px-3 text-right">Total Revenue</th>
                  <th className="py-3 px-3 text-right">Avg Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {salesByShoe.map((shoe) => (
                  <tr key={shoe.sku} className="hover:bg-stone-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{shoe.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{shoe.shoeName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-100">
                      {shoe.units}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      £{shoe.revenue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-400">
                      £{(shoe.revenue / (shoe.units || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Sales By Size Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Sales by Size Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3 text-right">Pairs</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {salesBySize.map((s) => (
                  <tr key={s.size} className="hover:bg-stone-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-300">{s.size}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-100">
                      {s.units}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                      £{s.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
