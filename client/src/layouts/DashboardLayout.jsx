import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  Tags,
  FileText,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  User,
  History,
  TrendingUp,
  Settings,
  HeartPulse,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalog', href: '/admin/products', icon: Box },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders Manager', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Quotations Logs', href: '/admin/quotations', icon: FileText },
  ];

  const sellerNavigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Browse Catalog', href: '/seller/catalog', icon: Box },
    { name: 'Quotation Builder', href: '/seller/quotations/new', icon: FileText },
    { name: 'My Quotations', href: '/seller/quotations', icon: History },
    { name: 'My Orders', href: '/seller/orders', icon: ShoppingCart },
  ];

  const navigation = user?.role === 'Admin' ? adminNavigation : sellerNavigation;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile Header */}
      <header className="md:hidden glass-panel h-16 px-4 flex items-center justify-between z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-brand-400" size={18} />
          <span className="text-xl font-bold font-display bg-gradient-to-r from-brand-400 to-indigo-500 bg-clip-text text-transparent">
            StockVibe
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
            {user?.role}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-slate-400 hover:text-slate-100 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/60 sticky top-0 h-screen p-4 justify-between z-40">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <HeartPulse className="text-brand-400" size={20} />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-indigo-500 bg-clip-text text-transparent">
                StockVibe
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {user?.role}
            </span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/65 rounded-xl border border-slate-800/40">
            <div className="h-10 w-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/20 font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm">
          <nav className="fixed top-16 left-0 right-0 glass-panel border-b border-slate-800 p-4 space-y-3 animate-slide-up">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <hr className="border-slate-800" />
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 rounded-xl"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
