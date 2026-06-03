import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Expandable row state
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      const res = await api.get('/orders', { params });
      let data = res.data.data.orders;
      
      // Client-side filter status if specified
      if (statusFilter) {
        data = data.filter((o) => o.status === statusFilter);
      }
      setOrders(data);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
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

  const toggleRowExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Orders Manager
          </h1>
          <p className="text-sm text-slate-400">
            Fulfill orders, track lifecycle pipelines, and process cancellations.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            className="input-premium py-1.5 px-3 text-xs w-36"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-xs">Loading orders database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs">
            No orders found matching the filter criteria.
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
                            <User size={12} /> {order.userId?.name || 'Seller'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-white">
                            ₹{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                      {updatingId === order._id ? (
                        <Loader2 className="animate-spin text-brand-400" size={16} />
                      ) : order.status === 'Cancelled' || order.status === 'Delivered' ? (
                        <span className="text-[10px] text-slate-500 font-bold border border-slate-800 bg-slate-900/40 px-3 py-1.5 rounded-xl">
                          Fulfillment Closed
                        </span>
                      ) : (
                        <select
                          className="bg-slate-900 border border-slate-700/60 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancel Order</option>
                        </select>
                      )}

                      <button className="text-slate-400 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-950/45 border-t border-slate-900/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details Summary</span>
                        <a
                          href={`/seller/orders/invoice/${order._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1"
                        >
                          <span>Open Printable Invoice</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      <div className="glass-panel rounded-xl overflow-hidden border border-slate-850">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                              <th className="p-3">Product Item</th>
                              <th className="p-3 text-right">Qty ordered</th>
                              <th className="p-3 text-right">Base SKU Conversion</th>
                              <th className="p-3 text-right">Rate</th>
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

export default OrderManager;
