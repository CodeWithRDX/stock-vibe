import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Compass, Loader2, AlertTriangle } from 'lucide-react';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 100, // retrieve all active catalog items
        search,
        categoryId: selectedCategory,
        unitType: selectedUnit,
      };
      const res = await api.get('/products', { params });
      setProducts(res.data.data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedUnit]);

  // Formats display rate
  const getPricingRate = (product) => {
    if (product.baseUnit === 'mg') {
      return `₹${(product.basePrice * 1000000).toLocaleString()}/kg | ₹${(product.basePrice * 1000).toFixed(2)}/g`;
    }
    if (product.baseUnit === 'mL') {
      return `₹${(product.basePrice * 1000).toFixed(2)}/L | ₹${product.basePrice.toFixed(2)}/mL`;
    }
    return `₹${(product.basePrice * 100).toFixed(2)}/box | ₹${(product.basePrice * 10).toFixed(2)}/strip`;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Product Catalog
        </h1>
        <p className="text-sm text-slate-400">
          Browse active catalog products, check availability, and review base rate tiers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by Product Name or SKU..."
            className="input-premium pl-10 py-2 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="input-premium py-2 text-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="input-premium py-2 text-xs"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">All Unit Types</option>
            <option value="mg">Weight-based (mg/g/kg)</option>
            <option value="mL">Volume-based (mL/L)</option>
            <option value="item">Count-based (item/strip/box)</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-brand-500" size={32} />
          <p className="text-xs">Fetching items catalog...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center text-red-400 text-xs flex flex-col items-center gap-2">
          <AlertTriangle size={24} />
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center text-slate-500 text-xs">
          No catalog items found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const lowStock = product.inventoryQuantity < (product.baseUnit === 'item' ? 10 : 2000);
            return (
              <div
                key={product._id}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 glass-panel-hover"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-brand-400">
                      {product.sku}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        lowStock
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {lowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-brand-300 font-semibold">{product.categoryId?.name}</p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 h-8 font-normal">{product.description || 'No description provided.'}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Standard Rate</span>
                    <span className="text-xs font-bold text-white">{getPricingRate(product)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Stock Available</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {product.inventoryQuantity.toLocaleString()} {product.baseUnit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
