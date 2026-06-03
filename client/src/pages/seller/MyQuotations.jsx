import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileText,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  ShoppingCart,
} from 'lucide-react';

const MyQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedQuoteId, setExpandedQuoteId] = useState(null);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/quotations');
      setQuotations(res.data.data.quotations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve your quotations history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleConvertToOrder = async (quoteId) => {
    setConvertingId(quoteId);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/orders', { quotationId: quoteId });
      setSuccess(`Success! Order placed matching quote: ${res.data.data.orderNumber}`);
      fetchQuotations();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert quotation to order');
    } finally {
      setConvertingId(null);
    }
  };

  const toggleRowExpand = (quoteId) => {
    if (expandedQuoteId === quoteId) {
      setExpandedQuoteId(null);
    } else {
      setExpandedQuoteId(quoteId);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Expired':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          My Quotations
        </h1>
        <p className="text-sm text-slate-400">
          Review generated quotations and convert pending items directly to orders.
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

      {/* Quotation history panel */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-xs">Fetching quotations history...</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs">
            You haven't built any quotations yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {quotations.map((quote) => {
              const isExpanded = expandedQuoteId === quote._id;
              return (
                <div key={quote._id} className="transition-all hover:bg-slate-900/10">
                  {/* Row Overview */}
                  <div
                    onClick={() => toggleRowExpand(quote._id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                        <FileText size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white text-sm">
                            {quote.quotationNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(quote.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-white">
                            Total Valuation: ₹{quote.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                      {quote.status === 'Pending' && (
                        <button
                          onClick={() => handleConvertToOrder(quote._id)}
                          disabled={convertingId === quote._id}
                          className="py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[10px] flex items-center gap-1 shadow shadow-brand-600/25 border border-brand-500/35 disabled:opacity-50"
                        >
                          {convertingId === quote._id ? (
                            <Loader2 className="animate-spin" size={10} />
                          ) : (
                            <ShoppingCart size={10} />
                          )}
                          <span>Convert to Order</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleRowExpand(quote._id)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-950/45 border-t border-slate-900/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Quote Line Items</span>
                      </div>

                      <div className="glass-panel rounded-xl overflow-hidden border border-slate-850">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                              <th className="p-3">Product Name</th>
                              <th className="p-3 text-right">Requested Qty</th>
                              <th className="p-3 text-right">SKU Converted Stock</th>
                              <th className="p-3 text-right">Quoted Rate</th>
                              <th className="p-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 text-slate-300">
                            {quote.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/10">
                                <td className="p-3">
                                  <div>
                                    <span className="font-semibold text-white">
                                      {item.productId?.name || 'Deleted Product'}
                                    </span>
                                    {item.productId?.sku && (
                                      <span className="text-[10px] font-mono text-slate-500 block">
                                        SKU: {item.productId?.sku}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-right font-semibold">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="p-3 text-right text-slate-400 font-mono">
                                  {item.baseQuantity} {item.productId?.baseUnit || item.unit}
                                </td>
                                <td className="p-3 text-right">₹{item.pricePerUnit} / {item.unit}</td>
                                <td className="p-3 text-right font-bold text-white">₹{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuotations;
