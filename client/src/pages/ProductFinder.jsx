import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Compass,
  Search,
  Filter,
  Layers,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Calculator,
  HeartPulse,
} from 'lucide-react';

const ProductFinder = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Local state for calculations per product
  const [calculatorState, setCalculatorState] = useState({}); // { [prodId]: { quantity: 1, unit: '...' } }

  // Admin request form states
  const [showForm, setShowForm] = useState({}); // { [prodId]: boolean }
  const [submittedRequests, setSubmittedRequests] = useState({}); // { [prodId]: boolean }
  const [requestDetails, setRequestDetails] = useState({}); // { [prodId]: { name, email, notes } }

  const handleFormChange = (prodId, field, value) => {
    setRequestDetails((prev) => ({
      ...prev,
      [prodId]: {
        ...prev[prodId],
        [field]: value,
      },
    }));
  };

  const handleRequestSubmit = (prodId) => {
    setSubmittedRequests((prev) => ({
      ...prev,
      [prodId]: true,
    }));
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to retrieve categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 100, // fetch all active products
        search,
        categoryId: selectedCategory,
      };
      const res = await api.get('/products', { params });
      const activeProducts = res.data.data.products;
      setProducts(activeProducts);

      // Initialize calculator inputs for each loaded product
      const initialCalculator = {};
      activeProducts.forEach((p) => {
        let defaultUnit = 'mg';
        if (p.baseUnit === 'mL') defaultUnit = 'mL';
        else if (p.baseUnit === 'item') defaultUnit = 'item';
        initialCalculator[p._id] = { quantity: 1, unit: defaultUnit };
      });
      setCalculatorState(initialCalculator);
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
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory]);

  const handleCalcChange = (prodId, field, value) => {
    setCalculatorState((prev) => ({
      ...prev,
      [prodId]: {
        ...prev[prodId],
        [field]: value,
      },
    }));
  };

  // Pricing conversion grid generator
  const getPriceConversionSheet = (product) => {
    const base = product.basePrice;
    if (product.baseUnit === 'mg') {
      return [
        { label: 'per Milligram (mg)', rate: base },
        { label: 'per Gram (g)', rate: base * 1000 },
        { label: 'per Kilogram (kg)', rate: base * 1000000 },
      ];
    }
    if (product.baseUnit === 'mL') {
      return [
        { label: 'per Milliliter (mL)', rate: base },
        { label: 'per Liter (L)', rate: base * 1000 },
      ];
    }
    // baseUnit 'item'
    return [
      { label: 'per Tablet (item)', rate: base },
      { label: 'per Strip (10 tabs)', rate: base * 10 },
      { label: 'per Box (100 tabs)', rate: base * 100 },
    ];
  };

  // Calculates estimated price for customized search variables
  const getCustomEstimation = (product) => {
    const calc = calculatorState[product._id];
    if (!calc) return 0;
    
    const qty = parseFloat(calc.quantity);
    if (isNaN(qty) || qty <= 0) return 0;

    let multiplier = 1;
    switch (calc.unit) {
      case 'kg':
        multiplier = 1000000;
        break;
      case 'g':
        multiplier = 1000;
        break;
      case 'mg':
        multiplier = 1;
        break;
      case 'L':
        multiplier = 1000;
        break;
      case 'mL':
        multiplier = 1;
        break;
      case 'box':
        multiplier = 100;
        break;
      case 'strip':
        multiplier = 10;
        break;
      case 'item':
        multiplier = 1;
        break;
    }

    return qty * multiplier * product.basePrice;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Orbs background */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-panel h-16 sticky top-0 z-50 px-6 flex items-center justify-between border-b border-slate-800/40 print:hidden">
        <Link to="/" className="flex items-center gap-2">
          <HeartPulse className="text-brand-400" size={22} />
          <span className="text-lg font-bold font-display bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            StockVibe <span className="text-brand-400 text-xs font-semibold ml-1 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">MEDICO</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-bold py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Wrapper */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8 z-10">
        
        {/* Page Head */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Link
            to="/"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all print:hidden"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Medications Search & Pricing Finder
            </h1>
            <p className="text-sm text-slate-400 font-light">
              Look up active clinical formulas, inspect rates per packaging sizes, and calculate costs.
            </p>
          </div>
        </div>

        {/* Search controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 glass-panel p-4 rounded-2xl print:hidden">
          <div className="relative sm:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by Medication Name or SKU code..."
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
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-brand-500" size={36} />
            <p className="text-xs">Fetching clinical database...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 text-center text-red-400 flex flex-col items-center gap-2 max-w-md mx-auto">
            <AlertTriangle size={32} />
            <p className="text-xs">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs">
            No medication products found matching your search request.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => {
              const rates = getPriceConversionSheet(product);
              const customEstimate = getCustomEstimation(product);
              const calc = calculatorState[product._id] || { quantity: 1, unit: product.baseUnit };

              return (
                <div
                  key={product._id}
                  className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-6 border border-slate-800/40 glass-panel-hover"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-brand-400">
                          {product.sku}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight mt-1.5">{product.name}</h3>
                        <p className="text-[10px] text-brand-300 font-semibold">{product.categoryId?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">
                          Active
                        </span>
                        {product.inventoryQuantity > 0 ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            In Stock: {product.inventoryQuantity.toLocaleString()} {product.baseUnit}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-normal leading-relaxed h-10 line-clamp-2">
                      {product.description || 'No description provided.'}
                    </p>

                    {/* Pricing conversion grids */}
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                        Price Conversion Matrix
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {rates.map((rate, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-0.5 text-center"
                          >
                            <span className="text-[8px] text-slate-500 font-semibold block">{rate.label}</span>
                            <span className="text-xs font-bold text-white">₹{rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculator footer */}
                  <div className="pt-4 border-t border-slate-800/60 space-y-3.5 bg-slate-900/15 p-4 rounded-2xl border border-slate-900">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calculator size={13} className="text-brand-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Dynamic Cost Estimator</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 relative flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="input-premium py-1.5 px-3 text-xs"
                          value={calc.quantity}
                          onChange={(e) => handleCalcChange(product._id, 'quantity', e.target.value)}
                        />
                        <select
                          className="input-premium py-1.5 px-2 text-xs w-28 shrink-0"
                          value={calc.unit}
                          onChange={(e) => handleCalcChange(product._id, 'unit', e.target.value)}
                        >
                          {product.baseUnit === 'mg' && (
                            <>
                              <option value="mg">mg</option>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                            </>
                          )}
                          {product.baseUnit === 'mL' && (
                            <>
                              <option value="mL">mL</option>
                              <option value="L">L</option>
                            </>
                          )}
                          {product.baseUnit === 'item' && (
                            <>
                              <option value="item">tablet (item)</option>
                              <option value="strip">strip (10)</option>
                              <option value="box">box (100)</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-bold">Estimated Cost</span>
                        <span className="text-sm font-extrabold text-white">₹{customEstimate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Form to Admin (Visible only if product is in stock / inventory) */}
                  {product.inventoryQuantity > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
                      {submittedRequests[product._id] ? (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1">
                          <span className="text-emerald-400 font-bold text-xs block">✓ Request Sent to Admin!</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Your inquiry for {calc.quantity} {calc.unit} of {product.name} has been logged. Admin will reach out to you at {requestDetails[product._id]?.email}.
                          </p>
                          <button
                            onClick={() => {
                              setSubmittedRequests(prev => ({ ...prev, [product._id]: false }));
                            }}
                            className="text-[9px] text-brand-400 hover:underline font-semibold mt-2 block mx-auto"
                          >
                            Submit another request
                          </button>
                        </div>
                      ) : (
                        <div>
                          {showForm[product._id] ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleRequestSubmit(product._id);
                              }}
                              className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 space-y-3"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                  Request Stock Dispatch
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowForm(prev => ({ ...prev, [product._id]: false }))}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-400 font-bold">Your Name</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Name"
                                    className="input-premium py-1 px-2.5 text-[11px]"
                                    value={requestDetails[product._id]?.name || ''}
                                    onChange={(e) => handleFormChange(product._id, 'name', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-400 font-bold">Your Email</label>
                                  <input
                                    type="email"
                                    required
                                    placeholder="email@example.com"
                                    className="input-premium py-1 px-2.5 text-[11px]"
                                    value={requestDetails[product._id]?.email || ''}
                                    onChange={(e) => handleFormChange(product._id, 'email', e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-bold">Purpose / Notes</label>
                                <textarea
                                  placeholder="e.g. Urgent stock replenishment request..."
                                  rows={2}
                                  className="input-premium py-1 px-2.5 text-[11px] resize-none"
                                  value={requestDetails[product._id]?.notes || ''}
                                  onChange={(e) => handleFormChange(product._id, 'notes', e.target.value)}
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2 bg-brand-600 hover:bg-brand-500 border border-brand-500/30 rounded-xl text-white text-xs font-bold transition-all shadow-md shadow-brand-600/10"
                              >
                                Send Request for {calc.quantity} {calc.unit}
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowForm(prev => ({ ...prev, [product._id]: true }))}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>Request Stock from Admin</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel py-6 text-center border-t border-slate-900/50 text-[10px] text-slate-500 z-10 mt-12 print:hidden">
        <p>© {new Date().getFullYear()} StockVibe Medico Platform. Intended for healthcare billing lookups.</p>
      </footer>
    </div>
  );
};

export default ProductFinder;
