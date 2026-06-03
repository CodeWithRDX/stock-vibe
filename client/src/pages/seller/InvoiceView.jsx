import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Printer, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

const InvoiceView = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve order invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-brand-500" size={36} />
        <p className="text-sm font-medium">Compiling invoice particulars...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-md border-red-500/20 shadow-2xl">
          <AlertTriangle className="text-red-400 mx-auto" size={48} />
          <h3 className="text-lg font-bold">Failed to Generate Invoice</h3>
          <p className="text-sm text-slate-400">{error || 'Order data unavailable'}</p>
          <Link
            to="/seller/orders"
            className="btn-premium px-5 py-2.5 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Go Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 select-none">
      {/* Control Actions (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link
          to="/seller/orders"
          className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to History</span>
        </Link>

        <button
          onClick={handlePrint}
          className="btn-premium py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
        >
          <Printer size={14} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Invoice Sheet container */}
      <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 bg-slate-900/40 border border-slate-800/80 print:bg-transparent print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-800 pb-8 print:border-slate-300">
          <div className="space-y-1">
            <span className="text-2xl font-black bg-gradient-to-r from-brand-400 to-indigo-500 bg-clip-text text-transparent print:text-slate-900">
              📦 StockVibe
            </span>
            <p className="text-xs text-slate-400 print:text-slate-500">Enterprise Inventory & Fulfillment Systems</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="text-3xl font-extrabold tracking-tight text-white uppercase font-display print:text-slate-900">
              Invoice
            </span>
            <p className="text-xs font-mono text-brand-400 print:text-slate-700">Order ID: {order.orderNumber}</p>
          </div>
        </div>

        {/* Invoice metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-400 border-b border-slate-800 pb-8 print:border-slate-300 print:text-slate-800">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 print:text-slate-600">Billed To:</h4>
            <p className="font-semibold text-white text-sm print:text-slate-900">{order.userId?.name}</p>
            <p className="font-normal">{order.userId?.email}</p>
            <p className="text-[10px] font-bold text-brand-400 border border-brand-500/20 bg-brand-500/5 px-2 py-0.5 rounded-full inline-block mt-1">
              Fulfillment Agent: Seller
            </p>
          </div>
          <div className="space-y-1.5 text-left sm:text-right">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 print:text-slate-600">Fulfillment Meta:</h4>
            <p><span className="font-semibold text-slate-300 print:text-slate-800">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold text-slate-300 print:text-slate-800">Payment Status:</span> Cash On Delivery</p>
            <p className="capitalize">
              <span className="font-semibold text-slate-300 print:text-slate-800">Order Status:</span>{' '}
              <span className="font-bold text-white print:text-slate-950">{order.status}</span>
            </p>
          </div>
        </div>

        {/* Invoice table breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800">Line Items Breakdown</h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                  <th className="p-4">SKU / Item Name</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 text-right">Base Conversion</th>
                  <th className="p-4 text-right">Rate</th>
                  <th className="p-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-slate-300 print:text-slate-800">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 print:hover:bg-transparent">
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-white print:text-slate-900">
                          {item.productId?.name || 'Deleted Product'}
                        </span>
                        {item.productId?.sku && (
                          <span className="text-[10px] font-mono text-slate-500 print:text-slate-600 block">
                            SKU: {item.productId?.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4 text-right text-slate-500 print:text-slate-600 font-mono">
                      {item.baseQuantity} {item.productId?.baseUnit || item.unit}
                    </td>
                    <td className="p-4 text-right">₹{item.pricePerUnit} / {item.unit}</td>
                    <td className="p-4 text-right font-bold text-white print:text-slate-950">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary Total */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Tax/GST (0%):</span>
              <span>₹0.00</span>
            </div>
            <hr className="border-slate-800 print:border-slate-300" />
            <div className="flex justify-between text-sm font-extrabold text-white print:text-slate-950">
              <span>Grand Total:</span>
              <span className="text-brand-400 print:text-slate-950">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer note */}
        <div className="text-center pt-8 border-t border-slate-800 text-[10px] text-slate-500 print:border-slate-300 print:text-slate-600">
          <p>Thank you for doing business with StockVibe. This is a system-generated computer invoice.</p>
          <p className="mt-1">For any queries, please reach out to billing@stockvibe.internal</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
