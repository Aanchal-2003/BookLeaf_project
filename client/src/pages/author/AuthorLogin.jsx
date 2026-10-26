import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ArrowRight, AlertCircle } from 'lucide-react';

export const AuthorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAuthor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await loginAuthor(email, password);
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full max-h-screen overflow-hidden bg-parchment-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-burgundy-700 text-white shadow-subtle mb-2.5">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-charcoal-900 tracking-tight leading-tight">
            BookLeaf Author Portal
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Sign in to access your author dashboard
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white py-6 px-6 sm:px-8 shadow-card rounded-2xl border border-parchment-300">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Email Address or Author ID
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@email.com or AUTH001"
                className="input-editorial py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
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
              className="w-full btn-primary py-2.5 text-sm font-semibold shadow-subtle mt-2"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </form>

          <div className="mt-5 pt-4 text-center border-t border-parchment-200">
            <Link
              to="/admin/login"
              className="text-xs text-charcoal-500 hover:text-burgundy-700 font-medium transition"
            >
              Switch to Operations Staff Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
