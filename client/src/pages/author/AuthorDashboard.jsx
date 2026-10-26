import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  PlusCircle,
  LifeBuoy,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AuthorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketPageSize, setTicketPageSize] = useState(5);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading author overview..." size="md" />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs">
        <h3 className="font-semibold text-sm mb-1">Failed to load dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="mt-2 btn-secondary text-xs py-1 px-2.5">
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, ticketSummary, recentTickets = [] } = data;
  const totalTicketPages = Math.ceil(recentTickets.length / ticketPageSize) || 1;
  const paginatedTickets = recentTickets.slice(
    (ticketPage - 1) * ticketPageSize,
    ticketPage * ticketPageSize
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Author Overview &bull; {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor book earnings, royalties, and support inquiries
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="btn-primary text-xs py-1.5 px-3.5 shadow-subtle self-start sm:self-auto flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Support Query</span>
        </Link>
      </div>

      {/* Financial & Book Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Books */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Book Catalog</span>
            <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <BookOpen className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            {metrics.totalBooks} <span className="text-xs font-normal text-slate-400">Titles</span>
          </div>
        </div>

        {/* Royalty Earned */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Royalty Earned</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            ₹{metrics.totalRoyaltyEarned.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Royalty Disbursed */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Royalty Paid</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <CheckCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            ₹{metrics.totalRoyaltyPaid.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Pending Royalty */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Royalty</span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            ₹{metrics.pendingRoyalties.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Recent Tickets Table with Integrated Status Counts */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle">
        <div className="p-2.5 px-3.5 sm:px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/60">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Support Queries
            </h2>
            <div className="h-3.5 w-px bg-slate-200 hidden sm:block"></div>
            {/* Compact inline status counters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Open <span className="font-bold text-amber-900 ml-0.5">{ticketSummary.open}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                In Progress <span className="font-bold text-blue-900 ml-0.5">{ticketSummary.inProgress}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Resolved <span className="font-bold text-emerald-900 ml-0.5">{ticketSummary.resolved}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Closed <span className="font-bold text-slate-900 ml-0.5">{ticketSummary.closed}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <Link
              to="/tickets"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            You haven't submitted any queries yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Ticket #</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Submitted</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge type="category" value={ticket.category} />
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge type="status" value={ticket.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        to={`/tickets/${ticket.ticket_number}`}
                        className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
                      >
                        Thread &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dashboard Pagination Bar */}
        {recentTickets.length > 0 && (
          <div className="p-2.5 px-3.5 sm:px-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing{' '}
              <strong className="text-slate-900 font-semibold">
                {(ticketPage - 1) * ticketPageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 font-semibold">
                {Math.min(ticketPage * ticketPageSize, recentTickets.length)}
              </strong>{' '}
              of <strong className="text-slate-900 font-semibold">{recentTickets.length}</strong> queries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
                disabled={ticketPage <= 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="text-xs px-1 text-slate-600 font-medium">
                Page {ticketPage} of {totalTicketPages}
              </span>

              <button
                type="button"
                onClick={() => setTicketPage((p) => Math.min(totalTicketPages, p + 1))}
                disabled={ticketPage >= totalTicketPages}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
