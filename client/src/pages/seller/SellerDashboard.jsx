import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertTriangle,
  Plus,
  Compass,
  ArrowRight,
} from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSellerAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/seller');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve seller metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-brand-500" size={36} />
        <p className="text-sm font-medium">Aggregating seller pipeline metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12 border-red-500/20">
        <AlertTriangle className="text-red-400 mx-auto" size={48} />
        <h3 className="text-lg font-bold">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={fetchSellerAnalytics}
          className="btn-premium px-5 py-2.5 bg-slate-900 border border-slate-800 text-sm font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const { summary, recentOrders, recentQuotations } = data;

  const cards = [
    {
      name: 'Total Spent',
      value: `₹${summary.totalSpent.toLocaleString()}`,
      change: 'Fulfilled orders cost',
      icon: DollarSign,
      color: 'text-brand-400',
      bgColor: 'bg-brand-500/10 border-brand-500/20',
      glow: 'glow-indigo',
    },
    {
      name: 'My Orders Count',
      value: summary.totalOrders,
      change: 'Submitted orders',
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'glow-green',
    },
    {
      name: 'My Quotations',
      value: summary.totalQuotations,
      change: 'Quotes generated',
      icon: FileText,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      glow: 'glow-blue',
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-slate-400">
            Build quotation invoices, place orders, and review client statuses.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/seller/catalog"
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all duration-200"
          >
            <Compass size={14} />
            <span>Browse Catalog</span>
          </Link>
          <Link
            to="/seller/quotations/new"
            className="btn-premium py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/20 border border-brand-500/35"
          >
            <Plus size={14} />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className={`glass-panel p-6 rounded-2xl flex items-center justify-between border ${card.bgColor} ${card.glow}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</p>
                <h3 className="text-3xl font-bold font-display tracking-tight text-white">{card.value}</h3>
                <p className="text-xs text-slate-500">{card.change}</p>
              </div>
              <div className={`p-4 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/35 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="text-emerald-400" size={16} />
              <span>Recent Orders</span>
            </h3>
            <Link to="/seller/orders" className="text-xs text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/40">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No orders placed yet.</div>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord._id} className="p-4 hover:bg-slate-900/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-300 text-xs block">{ord.orderNumber}</span>
                    <span className="text-[10px] text-slate-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-white text-xs block">₹{ord.totalAmount.toLocaleString()}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border bg-slate-900 text-slate-400 border-slate-800 font-bold uppercase">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/35 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="text-amber-400" size={16} />
              <span>Recent Quotations</span>
            </h3>
            <Link to="/seller/quotations" className="text-xs text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/40">
            {recentQuotations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No quotations created yet.</div>
            ) : (
              recentQuotations.map((qt) => (
                <div key={qt._id} className="p-4 hover:bg-slate-900/10 flex items-center justify-between animate-fade-in">
                  <div>
                    <span className="font-mono font-bold text-slate-300 text-xs block">{qt.quotationNumber}</span>
                    <span className="text-[10px] text-slate-500">{new Date(qt.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-white text-xs block">₹{qt.totalAmount.toLocaleString()}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border bg-slate-900 text-slate-400 border-slate-800 font-bold uppercase">
                      {qt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
