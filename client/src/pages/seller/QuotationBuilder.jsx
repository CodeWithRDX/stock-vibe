import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  PlusCircle,
  Package,
} from 'lucide-react';

const QuotationBuilder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Local Quotation Builder items state
  const [builderItems, setBuilderItems] = useState([]);

  // Current Add item state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');

  const fetchActiveProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=100'); // gets active products
      const activeProds = res.data.data.products;
      setProducts(activeProds);
      if (activeProds.length > 0) {
        setSelectedProductId(activeProds[0]._id);
      }
    } catch (err) {
      setError('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  // Get currently selected product reference
  const currentProduct = products.find((p) => p._id === selectedProductId);

  // Automatically adjust unit choices when product selection changes
  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.baseUnit === 'mg') setUnit('g');
      else if (currentProduct.baseUnit === 'mL') setUnit('L');
      else setUnit('strip');
    }
  }, [selectedProductId, products]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) {
      alert('Please enter a valid positive quantity');
      return;
    }

    // Check if product already exists in local list
    const existingIndex = builderItems.findIndex((item) => item.productId === selectedProductId && item.unit === unit);
    if (existingIndex > -1) {
      // Increment quantity
      const list = [...builderItems];
      list[existingIndex].quantity += q;
      // Recalculate subtotal
      const { subtotal } = calculateLocalPricing(list[existingIndex].quantity, unit, currentProduct.basePrice);
      list[existingIndex].subtotal = subtotal;
      setBuilderItems(list);
    } else {
      // Calculate pricing estimate
      const { subtotal, pricePerUnit } = calculateLocalPricing(q, unit, currentProduct.basePrice);

      setBuilderItems([
        ...builderItems,
        {
          productId: selectedProductId,
          name: currentProduct.name,
          sku: currentProduct.sku,
          quantity: q,
          unit,
          pricePerUnit,
          subtotal,
          baseUnit: currentProduct.baseUnit,
        },
      ]);
    }

    // Reset item quantity
    setQuantity(1);
  };

  const calculateLocalPricing = (qty, u, basePrice) => {
    let multiplier = 1;
    switch (u) {
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

    const baseQty = qty * multiplier;
    const pricePerUnit = basePrice * multiplier;
    const subtotal = Math.round(baseQty * basePrice * 100) / 100;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      pricePerUnit: Math.round(pricePerUnit * 10000) / 10000,
    };
  };

  const handleRemoveItem = (index) => {
    setBuilderItems(builderItems.filter((_, idx) => idx !== index));
  };

  const handleCreateQuotation = async () => {
    if (builderItems.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const itemsPayload = builderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const res = await api.post('/quotations', { items: itemsPayload });
      setSuccess(`Quotation generated: ${res.data.data.quotationNumber}`);
      setBuilderItems([]);
      setTimeout(() => {
        navigate('/seller/quotations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quotation sheet');
    } finally {
      setSubmitting(false);
    }
  };

  const grandTotal = builderItems.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Quotation Builder
        </h1>
        <p className="text-sm text-slate-400">
          Construct sales estimates by selecting items, entering quantities, and choosing units.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex gap-3 items-center">
          <CheckCircle size={20} />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-200 text-xs flex gap-3">
          <AlertTriangle className="shrink-0" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Selection Panel */}
        <div className="glass-panel p-6 rounded-2xl h-fit space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle size={18} className="text-brand-400" />
            <span>Select Product Item</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="animate-spin text-brand-500 mb-2" size={24} />
              <p className="text-xs">Loading items list...</p>
            </div>
          ) : (
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product</label>
                <select
                  className="input-premium py-2 text-xs"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {currentProduct && (
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Base Unit Rate:</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      ₹{currentProduct.basePrice} / {currentProduct.baseUnit}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Stock Available:</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {currentProduct.inventoryQuantity.toLocaleString()} {currentProduct.baseUnit}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    className="input-premium py-2 text-xs"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Unit</label>
                  <select
                    className="input-premium py-2 text-xs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {currentProduct?.baseUnit === 'mg' && (
                      <>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="mg">Milligrams (mg)</option>
                      </>
                    )}
                    {currentProduct?.baseUnit === 'mL' && (
                      <>
                        <option value="L">Liters (L)</option>
                        <option value="mL">Milliliters (mL)</option>
                      </>
                    )}
                    {currentProduct?.baseUnit === 'item' && (
                      <>
                        <option value="box">Carton Box (box)</option>
                        <option value="strip">Blister Strip (strip)</option>
                        <option value="item">Single Tablet (item)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-premium py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
              >
                <Plus size={14} />
                <span>Add Item to Estimate</span>
              </button>
            </form>
          )}
        </div>

        {/* Builder list Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl min-h-[400px]">
          <div>
            <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/35 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-brand-400" />
                <span>Quotation Estimate Items</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/65">
                Items: {builderItems.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              {builderItems.length === 0 ? (
                <div className="py-24 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <Package size={30} className="text-slate-600 mb-1" />
                  <p>No items added yet. Choose products from side panel to build quote.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Quoted Rate</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {builderItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-900/10">
                        <td className="p-3">
                          <div>
                            <span className="font-semibold text-white">{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 block">SKU: {item.sku}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 text-right">₹{item.pricePerUnit} / {item.unit}</td>
                        <td className="p-3 text-right font-bold text-white">₹{item.subtotal}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all inline-flex"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Submission and Totals footer */}
          {builderItems.length > 0 && (
            <div className="p-6 border-t border-slate-800/60 bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">Total Quote Valuation</span>
                <span className="text-xl font-extrabold text-white">₹{grandTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCreateQuotation}
                disabled={submitting}
                className="w-full sm:w-auto btn-premium py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Submit & Save Quotation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilder;
