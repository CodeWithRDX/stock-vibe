import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/admin');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-brand-500" size={36} />
        <p className="text-sm font-medium">Aggregating platform metrics...</p>
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
          onClick={fetchAnalytics}
          className="btn-premium px-5 py-2.5 bg-slate-900 border border-slate-800 text-sm font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const { summary, lowStockProducts, salesTrend, categoryDistribution } = data;

  const cards = [
    {
      name: 'Total Revenue',
      value: `₹${summary.revenue.toLocaleString()}`,
      change: 'Gross processed',
      icon: TrendingUp,
      color: 'text-brand-400',
      bgColor: 'bg-brand-500/10 border-brand-500/20',
      glow: 'glow-indigo',
    },
    {
      name: 'Total Products',
      value: summary.totalProducts,
      change: 'Active catalog',
      icon: Package,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      glow: 'glow-blue',
    },
    {
      name: 'Total Orders Placed',
      value: summary.totalOrders,
      change: 'Fulfillment queue',
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'glow-green',
    },
    {
      name: 'Quotations Created',
      value: summary.totalQuotations,
      change: 'Sellers pipelines',
      icon: FileText,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      glow: 'glow-blue',
    },
  ];

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 select-none">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time analytics, inventory levels, and order pipelines.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all duration-200"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold">Revenue & Sales Trends</h3>
            <p className="text-xs text-slate-400">Daily transaction volume over the past 30 days</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelClassName="text-slate-400 text-xs font-bold"
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold">Category Distribution</h3>
            <p className="text-xs text-slate-400">Catalog representation across categories</p>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-500">No category data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="productCount" name="Products" radius={[6, 6, 0, 0]}>
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Low stock alerts & quick redirect table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="text-amber-400" size={20} />
            <div>
              <h3 className="text-lg font-bold">Low Stock Warning Indicators</h3>
              <p className="text-xs text-slate-400">Products requiring restocking soon</p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1.5 transition-all"
          >
            <span>Manage Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ All products have optimal stock levels.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider font-semibold">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Available Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {lowStockProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-900/30 transition-all">
                    <td className="p-4 font-mono font-bold text-slate-300">{prod.sku}</td>
                    <td className="p-4 font-medium text-white">{prod.name}</td>
                    <td className="p-4 text-slate-400">{prod.categoryId?.name || 'Unassigned'}</td>
                    <td className="p-4 text-right font-bold text-red-400">
                      {prod.inventoryQuantity.toLocaleString()} {prod.baseUnit}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to="/admin/products"
                        className="py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-[10px] font-bold transition-all"
                      >
                        Adjust Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
