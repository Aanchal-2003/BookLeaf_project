import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  BookMarked,
  LifeBuoy,
  BookOpen,
  Layers,
  LogOut,
  ShieldCheck,
  User,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifData, setNotifData] = useState({
    criticalCount: 0,
    openCount: 0,
    inProgressCount: 0,
  });
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (role === 'admin') {
        const res = await api.get('/admin/metrics');
        const m = res.data.data?.metrics;
        if (m) {
          setNotifData({
            criticalCount: m.criticalHighUnresolved || 0,
            openCount: m.openTickets || 0,
            inProgressCount: m.inProgressTickets || 0,
          });
        }
      } else if (role === 'author') {
        const res = await api.get('/dashboard/summary');
        const s = res.data.data?.ticketSummary;
        if (s) {
          setNotifData({
            criticalCount: 0,
            openCount: s.open || 0,
            inProgressCount: s.inProgress || 0,
          });
        }
      }
    } catch {
      // quiet fail for notification poll
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [user, role, location.pathname]);

  // Click outside to dismiss notification popup & escape key listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotif(false);
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      navigate(role === 'admin' ? '/admin/login' : '/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const authorNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Layers },
    { label: 'My Books', path: '/books', icon: BookOpen },
    { label: 'Submit Ticket', path: '/tickets/new', icon: LifeBuoy },
    { label: 'My Tickets', path: '/tickets', icon: BookMarked },
  ];

  const adminNavItems = [
    { label: 'Overview Metrics', path: '/admin', icon: Layers },
    { label: 'Ticket Queue', path: '/admin/tickets', icon: LifeBuoy },
  ];

  const navItems = role === 'admin' ? adminNavItems : authorNavItems;

  const actionCount =
    role === 'admin'
      ? notifData.criticalCount > 0
        ? notifData.criticalCount
        : notifData.openCount
      : notifData.inProgressCount + notifData.openCount;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-6">
            <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-sm text-slate-900 tracking-tight">
                  BookLeaf <span className="text-brand-600 font-semibold text-[10px] tracking-wider uppercase">Publishing</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  &bull; {role === 'admin' ? 'Operations Portal' : 'Author Portal'}
                </span>
              </div>
            </Link>

            {/* Nav Links Segments */}
            <nav className="hidden md:flex items-center space-x-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-3">
                {/* Notification Bell with Action Required Badge & Popup */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    title={actionCount > 0 ? `${actionCount} Action Required` : 'Notifications'}
                    className={`relative p-1.5 rounded-lg border transition-all focus:outline-none ${
                      showNotif
                        ? 'bg-brand-50 border-brand-200 text-brand-700 ring-2 ring-brand-500/20'
                        : actionCount > 0
                        ? 'border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {actionCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-subtle animate-pulse">
                        {actionCount}
                      </span>
                    )}
                  </button>

                  {/* Action Required Dropdown Popup */}
                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 overflow-hidden">
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                          <Bell className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                          Notifications
                        </span>
                        {actionCount > 0 ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            {actionCount} Action Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            All Caught Up
                          </span>
                        )}
                      </div>

                      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                        {role === 'admin' ? (
                          <>
                            {notifData.criticalCount > 0 && (
                              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center text-xs font-bold text-rose-900">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600 flex-shrink-0" />
                                    <span>{notifData.criticalCount} Critical Tickets</span>
                                  </div>
                                  <p className="text-[11px] text-rose-700">
                                    Unresolved high/critical tickets requiring immediate triage.
                                  </p>
                                </div>
                                <Link
                                  to="/admin/tickets?priority=Critical"
                                  onClick={() => setShowNotif(false)}
                                  className="btn-primary text-[10px] py-1 px-2.5 whitespace-nowrap self-center"
                                >
                                  Triage &rarr;
                                </Link>
                              </div>
                            )}

                            {notifData.openCount > 0 && (
                              <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center text-xs font-bold text-amber-900">
                                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 flex-shrink-0" />
                                    <span>{notifData.openCount} Open Ticket{notifData.openCount > 1 ? 's' : ''}</span>
                                  </div>
                                  <p className="text-[11px] text-amber-700">
                                    Awaiting initial staff review and assignment.
                                  </p>
                                </div>
                                <Link
                                  to="/admin/tickets?status=Open"
                                  onClick={() => setShowNotif(false)}
                                  className="btn-secondary text-[10px] py-1 px-2.5 whitespace-nowrap self-center"
                                >
                                  Review &rarr;
                                </Link>
                              </div>
                            )}

                            {notifData.criticalCount === 0 && notifData.openCount === 0 && (
                              <div className="py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                                <div className="text-xs font-bold text-slate-800">Queue is Clear</div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  No critical or unreviewed tickets pending.
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {notifData.inProgressCount > 0 && (
                              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="text-xs font-bold text-blue-900">
                                    {notifData.inProgressCount} Query Under Review
                                  </div>
                                  <p className="text-[11px] text-blue-700">
                                    BookLeaf operations staff is actively investigating.
                                  </p>
                                </div>
                                <Link
                                  to="/tickets"
                                  onClick={() => setShowNotif(false)}
                                  className="btn-secondary text-[10px] py-1 px-2 whitespace-nowrap self-center"
                                >
                                  View &rarr;
                                </Link>
                              </div>
                            )}

                            {notifData.inProgressCount === 0 && notifData.openCount === 0 && (
                              <div className="py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                                <div className="text-xs font-bold text-slate-800">All Queries Resolved</div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  You have no pending queries awaiting review.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                          to={role === 'admin' ? '/admin/tickets' : '/tickets'}
                          onClick={() => setShowNotif(false)}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1"
                        >
                          <span>{role === 'admin' ? 'Open Full Support Queue' : 'View All Queries'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Name & Profile Badge */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      {role === 'admin' ? (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wider">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Staff
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                          <User className="w-2.5 h-2.5 mr-0.5" /> {user.author_id}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono hidden lg:inline">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal rendered into document.body via Portal */}
      {showLogoutConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Logout
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to log out of your {role === 'admin' ? 'Operations Workbench' : 'Author Portal'} session?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={isLoggingOut}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <span>Logging out...</span>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
