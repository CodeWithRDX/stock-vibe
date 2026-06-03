import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManager from './pages/admin/ProductManager';
import CategoryManager from './pages/admin/CategoryManager';
import OrderManager from './pages/admin/OrderManager';
import QuotationLogs from './pages/admin/QuotationLogs';

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard';
import Catalog from './pages/seller/Catalog';
import QuotationBuilder from './pages/seller/QuotationBuilder';
import MyQuotations from './pages/seller/MyQuotations';
import MyOrders from './pages/seller/MyOrders';
import InvoiceView from './pages/seller/InvoiceView';

import Home from './pages/Home';
import ProductFinder from './pages/ProductFinder';

const queryClient = new QueryClient();

// Helper to steer authenticated sessions away from public auth pages
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return user.role === 'Admin' ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/seller/dashboard" replace />
    );
  }
  return children;
};

// Helper to auto-redirect from dashboard gateways depending on role
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
        <p className="text-sm font-medium tracking-wide text-slate-400">Loading StockVibe...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'Admin' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/seller/dashboard" replace />
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<ProductFinder />} />

            {/* Public Auth Routes (Redirects if logged in) */}
            <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

            {/* Admin Modules */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<ProductManager />} />
                      <Route path="categories" element={<CategoryManager />} />
                      <Route path="orders" element={<OrderManager />} />
                      <Route path="quotations" element={<QuotationLogs />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Seller Modules */}
            <Route
              path="/seller/*"
              element={
                <ProtectedRoute allowedRoles={['Seller']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<SellerDashboard />} />
                      <Route path="catalog" element={<Catalog />} />
                      <Route path="quotations/new" element={<QuotationBuilder />} />
                      <Route path="quotations" element={<MyQuotations />} />
                      <Route path="orders" element={<MyOrders />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Special invoice view route (accessible by both Admin and Seller, layout-free print layout) */}
            <Route
              path="/seller/orders/invoice/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Seller']}>
                  <InvoiceView />
                </ProtectedRoute>
              }
            />

            {/* Root index redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
