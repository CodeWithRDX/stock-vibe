import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tags, Plus, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/products/categories', { name, description });
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Categories Manager
        </h1>
        <p className="text-sm text-slate-400">
          Organize inventory assets by grouping related catalog products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="glass-panel p-6 rounded-2xl h-fit space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus size={18} className="text-brand-400" />
            <span>Create Category</span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex gap-2">
                <AlertTriangle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dairy"
                className="input-premium py-2 text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                placeholder="Brief summary..."
                className="input-premium py-2 text-xs h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-premium py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 border border-brand-500/35"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tags size={18} className="text-sky-400" />
              <span>Existing Categories</span>
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/65">
              Count: {categories.length}
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-brand-500" size={32} />
              <p className="text-xs">Fetching categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-xs">
              No categories established yet. Establish your first category.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/40">
              {categories.map((cat) => (
                <div key={cat._id} className="p-6 hover:bg-slate-900/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                    <p className="text-xs text-slate-400 font-normal">{cat.description || 'No description provided.'}</p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 shrink-0 select-text">
                    ID: {cat._id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
