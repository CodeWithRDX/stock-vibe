import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [page, setPage] = useState(1);

  // Modal / Drawer state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    baseUnit: 'g',
    basePrice: 0,
    inventoryQuantity: 0,
    active: true,
  });

  const [stockForm, setStockForm] = useState({
    transactionType: 'IN',
    quantity: 0,
    notes: '',
  });

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
        page,
        limit: 10,
        search,
        categoryId: selectedCategory,
        unitType: selectedUnit,
      };
      const res = await api.get('/products', { params });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve products catalog');
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
    }, 300); // debounce search input

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedUnit, page]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setProductForm({
      sku: '',
      name: '',
      description: '',
      categoryId: categories[0]?._id || '',
      baseUnit: 'g',
      basePrice: 0,
      inventoryQuantity: 0,
      active: true,
    });
    setError(null);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setProductForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId,
      baseUnit: product.baseUnit,
      basePrice: product.basePrice,
      inventoryQuantity: product.inventoryQuantity,
      active: product.active,
    });
    setError(null);
    setShowProductModal(true);
  };

  const handleOpenStockModal = (product) => {
    setSelectedProduct(product);
    setStockForm({
      transactionType: 'IN',
      quantity: 0,
      notes: '',
    });
    setError(null);
    setShowStockModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (modalMode === 'create') {
        await api.post('/products', productForm);
      } else {
        await api.put(`/products/${selectedProduct._id}`, productForm);
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/inventory/adjust/${selectedProduct._id}`, stockForm);
      setShowStockModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock level');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { active: !product.active });
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Products Catalog
          </h1>
          <p className="text-sm text-slate-400">
            Define pricing models, base units, active triggers, and log stock adjustments.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-premium py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 border border-brand-500/35 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <select
            className="input-premium py-2 text-xs"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Unit Types</option>
            <option value="g">Grams (g)</option>
            <option value="mL">Milliliters (mL)</option>
            <option value="item">Items (item)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-2 flex flex-col items-center">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-xs">Fetching items catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs">
            No products found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Unit</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4">Stock Qty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-900/30 transition-all">
                    <td className="p-4 font-mono font-bold text-brand-400">{product.sku}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{product.description}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{product.categoryId?.name || 'Unassigned'}</td>
                    <td className="p-4 font-mono">{product.baseUnit}</td>
                    <td className="p-4 font-semibold text-white">₹{product.basePrice} <span className="text-[10px] text-slate-500">/{product.baseUnit}</span></td>
                    <td className="p-4 font-bold text-white">
                      <button
                        onClick={() => handleOpenStockModal(product)}
                        className={`text-left hover:underline ${product.inventoryQuantity < (product.baseUnit === 'item' ? 10 : 2000) ? 'text-red-400' : 'text-emerald-400'}`}
                      >
                        {product.inventoryQuantity.toLocaleString()} {product.baseUnit}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                          product.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700/60'
                        }`}
                      >
                        {product.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all inline-flex"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenStockModal(product)}
                        className="py-1.5 px-2.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 text-[10px] font-bold transition-all inline-flex"
                      >
                        Manage Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 bg-slate-900/30">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT CREATION / EDITING MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <h3 className="text-base font-bold text-white">
                {modalMode === 'create' ? 'Add Catalog Product' : `Edit Product: ${selectedProduct?.sku}`}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex gap-2">
                  <AlertTriangle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRN-RICE-001"
                    className="input-premium py-2 text-xs"
                    disabled={modalMode === 'edit'} // SKU is unique and immutable
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice"
                    className="input-premium py-2 text-xs"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  placeholder="Details, specifications..."
                  className="input-premium py-2 text-xs h-20 resize-none"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <select
                    className="input-premium py-2 text-xs"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Storage Unit</label>
                  <select
                    className="input-premium py-2 text-xs"
                    disabled={modalMode === 'edit'} // Unit category should not change
                    value={productForm.baseUnit}
                    onChange={(e) => setProductForm({ ...productForm, baseUnit: e.target.value })}
                  >
                    <option value="g">Grams (g)</option>
                    <option value="mL">Milliliters (mL)</option>
                    <option value="item">Items (item)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price per Base Unit (₹)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    className="input-premium py-2 text-xs"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {modalMode === 'create' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Stock Level</label>
                    <input
                      type="number"
                      required
                      className="input-premium py-2 text-xs"
                      value={productForm.inventoryQuantity}
                      onChange={(e) => setProductForm({ ...productForm, inventoryQuantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-950"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-xs font-semibold text-slate-300">
                  Allow sales/orders (Active Catalog)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-premium py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden animate-slide-up shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div>
                <h3 className="text-sm font-bold text-white">Adjust Stock: {selectedProduct?.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono">SKU: {selectedProduct?.sku}</p>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex gap-2">
                  <AlertTriangle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-850 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Stock Quantity:</span>
                <span className="font-bold text-white text-sm">
                  {selectedProduct?.inventoryQuantity.toLocaleString()} {selectedProduct?.baseUnit}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'IN', label: 'Restock (+)', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                    { type: 'OUT', label: 'Disburse (-)', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
                    { type: 'ADJUSTMENT', label: 'Audit Delta (±)', color: 'border-brand-500/20 text-brand-400 bg-brand-500/5' },
                  ].map((btn) => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => setStockForm({ ...stockForm, transactionType: btn.type })}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-lg transition-all ${
                        stockForm.transactionType === btn.type
                          ? 'border-brand-500 bg-brand-500/15 text-white'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Adjustment Quantity ({selectedProduct?.baseUnit})
                </label>
                <input
                  type="number"
                  required
                  step="0.001"
                  placeholder="e.g. 50"
                  className="input-premium py-2 text-xs"
                  value={stockForm.quantity || ''}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auditing Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Annual stock reconciliation check"
                  className="input-premium py-2 text-xs"
                  value={stockForm.notes}
                  onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-premium py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
