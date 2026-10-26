import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  LifeBuoy,
  AlertTriangle,
  Clock,
  CheckCircle,
  Inbox,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      setData(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load operations metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Compiling operational metrics..." size="md" />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs">
        <h3 className="font-semibold text-sm mb-1">Failed to Load Metrics</h3>
        <p>{error}</p>
        <button onClick={fetchMetrics} className="mt-2 btn-secondary text-xs py-1 px-2.5">
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, categoryBreakdown, recentTickets } = data;

  return (
    <div className="space-y-4">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Support Operations Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Queue Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ticketing workflow, priority dispatch, and author inquiry tracking
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/tickets"
            className="btn-primary text-xs py-1.5 px-3.5 shadow-subtle flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Ticket Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>


      {/* Compact 5-Metric KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* Total */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Inbox className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {metrics.totalTickets}
          </div>
        </div>

        {/* Open */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Open</span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {metrics.openTickets}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">In Progress</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <LifeBuoy className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {metrics.inProgressTickets}
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {metrics.resolvedTickets}
          </div>
        </div>

        {/* Closed */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle hover:shadow-card transition-all group col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Closed</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <CheckCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {metrics.closedTickets}
          </div>
        </div>
      </div>

      {/* 2-Column Balanced Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Category Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                Category Distribution
              </h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Total: {metrics.totalTickets}
              </span>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map((item) => {
                const percentage =
                  metrics.totalTickets > 0
                    ? ((item.count / metrics.totalTickets) * 100).toFixed(0)
                    : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2 text-[11px]">
                        {item.category}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px] whitespace-nowrap bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                        {item.count} &bull; {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workload Insights Card */}
          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-3.5 rounded-b-xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workload Health
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <div className="text-base font-bold text-slate-900">
                  {metrics.openTickets + metrics.inProgressTickets}
                </div>
                <div className="text-[9px] text-slate-500 font-medium">Active Load</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                <div className="text-base font-bold text-emerald-700">
                  {metrics.totalTickets > 0
                    ? ((metrics.resolvedTickets / metrics.totalTickets) * 100).toFixed(0)
                    : 100}%
                </div>
                <div className="text-[9px] text-slate-500 font-medium">Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle flex flex-col">
          <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Incoming Tickets
            </h2>
            <Link
              to="/admin/tickets"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tickets received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-3 px-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-200/60">
                        {ticket.ticket_number}
                      </span>
                      <StatusBadge type="status" value={ticket.status} />
                      <StatusBadge type="priority" value={ticket.priority} />
                      <span className="text-[10px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                      {ticket.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                      <span>Author: <span className="font-mono font-medium text-slate-700">{ticket.author_id}</span></span>
                      <span>&bull;</span>
                      <span>{ticket.category}</span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/tickets/${ticket.ticket_number}`}
                    className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap self-center font-medium shadow-none hover:shadow-subtle group-hover:border-slate-300"
                  >
                    Workbench &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
