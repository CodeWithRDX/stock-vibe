import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve orders history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleRowExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shipped':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          My Placed Orders
        </h1>
        <p className="text-sm text-slate-400">
          Track fulfillment status, review quantities, and print order invoice details.
        </p>
      </div>

      {/* Orders history list */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-xs">Fetching orders history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              return (
                <div key={order._id} className="transition-all hover:bg-slate-900/10">
                  {/* Row Overview */}
                  <div
                    onClick={() => toggleRowExpand(order._id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                        <ShoppingCart size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white text-sm">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-white">
                            Total Paid: ₹{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/seller/orders/invoice/${order._id}`}
                        className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[10px] flex items-center gap-1"
                      >
                        <ExternalLink size={10} />
                        <span>Print Invoice</span>
                      </Link>

                      <button
                        onClick={() => toggleRowExpand(order._id)}
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</span>
                      </div>

                      <div className="glass-panel rounded-xl overflow-hidden border border-slate-850">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                              <th className="p-3">Product Name</th>
                              <th className="p-3 text-right">Quantity Ordered</th>
                              <th className="p-3 text-right">SKU Converted Stock</th>
                              <th className="p-3 text-right">Fulfillment Rate</th>
                              <th className="p-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 text-slate-300">
                            {order.items.map((item, idx) => (
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

export default MyOrders;
