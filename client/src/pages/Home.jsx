import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Compass, LogIn, UserPlus, HeartPulse, ShieldAlert, Cpu, Printer, Sparkles, LayoutDashboard } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const dashboardLink = user?.role === 'Admin' ? '/admin/dashboard' : '/seller/dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="glass-panel h-16 sticky top-0 z-50 px-6 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-brand-400" size={24} />
          <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            StockVibe <span className="text-brand-400 text-sm font-semibold ml-1 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">MEDICO</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/find"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-1"
          >
            <Compass size={14} />
            <span>Medications Finder</span>
          </Link>
          {user ? (
            <Link
              to={dashboardLink}
              className="py-1.5 px-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <LayoutDashboard size={13} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
          <Sparkles size={11} />
          <span>Next-Generation Medico Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none max-w-3xl">
          Clinical Inventory & Order Management System
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl font-light leading-relaxed">
          Streamline medical stock, calculate custom weights and volumes dynamically (mg/g/kg, mL/L, item/strip/box), build quotation lists, and dispatch order fulfillments on-the-fly.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md pt-4">
          <Link
            to="/find"
            className="w-full sm:w-auto btn-premium py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
          >
            <Compass size={16} />
            <span>Search Medications</span>
          </Link>
          {user ? (
            <Link
              to={dashboardLink}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <LogIn size={16} />
              <span>Enter Staff Portal</span>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          {[
            {
              title: 'Multi-Unit Convertor',
              desc: 'Convert seamlessly between milligrams, grams, kilograms, liters, mL, and strip/box units. Server-validated calculations.',
              icon: Cpu,
              color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
            },
            {
              title: 'Real-Time Audit Trail',
              desc: 'Log check-ins, fulfillments, and cancellations automatically in the database for comprehensive compliance audit.',
              icon: Package,
              color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            },
            {
              title: 'Printable Invoice Engine',
              desc: 'Generate clean, professional cash-on-delivery printable invoices optimized for dispatch receipts.',
              icon: Printer,
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            },
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="glass-panel p-6 rounded-2xl border flex flex-col gap-4 glass-panel-hover"
              >
                <div className={`p-3 rounded-xl w-fit ${feat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel py-6 text-center border-t border-slate-900/50 text-[10px] text-slate-500 z-10 mt-12">
        <p>© {new Date().getFullYear()} StockVibe Medico Platform. All rights reserved. Intended for institutional clinic use.</p>
      </footer>
    </div>
  );
};

export default Home;
