import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ShieldAlert, ArrowRight, Package } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      // Default to 'Seller' role for self-registrations
      await registerUser(data.name, data.email, data.password, 'Seller');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 items-center justify-center text-brand-400 mb-2">
            <Package size={26} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-slate-400">
            Sign up for a Seller account to build quotations and log orders.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center mx-auto text-xl animate-bounce">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-100">Registration Successful!</h3>
              <p className="text-xs text-slate-400">Redirecting to login portal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex gap-2 items-start">
                  <ShieldAlert className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`input-premium pl-10 ${errors.name ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                    {...formRegister('name')}
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    className={`input-premium pl-10 ${errors.email ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                    {...formRegister('email')}
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
                    {...formRegister('password')}
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
                    <span>Register</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-all">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
