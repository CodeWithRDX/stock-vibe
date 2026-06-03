import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, ArrowRight, Package } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/seller/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const prefillCredentials = (role) => {
    if (role === 'Admin') {
      setValue('email', 'admin@example.com');
      setValue('password', 'Password@123');
    } else {
      setValue('email', 'seller@example.com');
      setValue('password', 'Password@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background radial gradients for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 items-center justify-center text-brand-400 mb-2">
            <Package size={26} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome to StockVibe
          </h1>
          <p className="text-sm text-slate-400">
            Log in to manage catalog inventory, quotes, and orders.
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex gap-2 items-start">
                <ShieldAlert className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={`input-premium pl-10 ${errors.email ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`input-premium pl-10 ${errors.password ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-premium py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/35 border border-brand-500/40 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick prefills for demonstration */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-3">
            <p className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Demo Credentials Quick Connect
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => prefillCredentials('Admin')}
                className="py-2 px-3 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-brand-300 font-medium transition-all"
              >
                ⚡ Admin Profile
              </button>
              <button
                type="button"
                onClick={() => prefillCredentials('Seller')}
                className="py-2 px-3 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-emerald-400 font-medium transition-all"
              >
                ⚡ Seller Profile
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Need a seller account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-all">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
