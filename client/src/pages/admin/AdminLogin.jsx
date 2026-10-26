import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@bookleaf.com');
  const [password, setPassword] = useState('Admin@BookLeaf2025');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, role, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('admin@bookleaf.com');
    setPassword('Admin@BookLeaf2025');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail !== 'admin@bookleaf.com' && (cleanEmail.includes('priya') || cleanEmail.includes('author') || cleanEmail.includes('@email.com') || cleanEmail.includes('@example.com'))) {
      setError('You have entered an Author email (Priya Sharma). The Operations Workbench requires Staff credentials. Please click "✨ Demo Fill" above to load staff credentials (admin@bookleaf.com).');
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await loginAdmin(email, password);
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin') {
        navigate('/admin');
      } else {
        setError('These credentials belong to an Author account. Please sign in with Staff credentials (admin@bookleaf.com) to access the Operations Workbench.');
      }
    } catch (err) {
      setError(err.message || 'Staff authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-subtle mb-2.5 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Operations Workbench
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to BookLeaf Staff Operations
          </p>
        </div>

        {/* Notice if currently signed in as an Author */}
        {user && role === 'author' && (
          <div className="mb-3.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs flex items-start gap-2.5 shadow-subtle">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Author Session Currently Active</span>
              <span className="text-[11px] text-amber-700">
                You are currently signed in as <strong>{user.name} ({user.author_id})</strong>. Signing in below will switch your session to Operations Staff.
              </span>
            </div>
          </div>
        )}

        {/* Clean Login Card */}
        <div className="bg-white py-6 px-6 sm:px-8 shadow-card rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Staff Email Address
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Fill</span>
                </button>
              </div>
              <input
                type="text"
                name="staff_user_email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookleaf.com"
                className="input-editorial py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Password
              </label>
              <input
                type="password"
                name="staff_user_password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-editorial py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-2.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 mt-2 shadow-subtle flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Signing in...' : 'Sign In as Staff'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Helper box */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 text-center">
            Staff Demo: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">admin@bookleaf.com</code> &bull; <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">Admin@BookLeaf2025</code>
          </div>

          <div className="mt-4 pt-3 text-center border-t border-slate-100">
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium transition"
            >
              Switch to Author Portal Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
