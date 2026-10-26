import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthorLayout } from './layouts/AuthorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Author Pages
import { AuthorLogin } from './pages/author/AuthorLogin';
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { AuthorBooks } from './pages/author/AuthorBooks';
import { AuthorTickets } from './pages/author/AuthorTickets';
import { AuthorCreateTicket } from './pages/author/AuthorCreateTicket';
import { AuthorTicketDetail } from './pages/author/AuthorTicketDetail';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTicketQueue } from './pages/admin/AdminTicketQueue';
import { AdminTicketDetail } from './pages/admin/AdminTicketDetail';

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthorLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Author Protected Routes */}
          <Route element={<AuthorLayout />}>
            <Route path="/dashboard" element={<AuthorDashboard />} />
            <Route path="/books" element={<AuthorBooks />} />
            <Route path="/tickets" element={<AuthorTickets />} />
            <Route path="/tickets/new" element={<AuthorCreateTicket />} />
            <Route path="/tickets/:id" element={<AuthorTicketDetail />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTicketQueue />} />
            <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
