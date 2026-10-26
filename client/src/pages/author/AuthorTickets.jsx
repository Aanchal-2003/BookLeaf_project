import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookMarked,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export const AuthorTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTickets = async (page = 1, limit = pageSize, status = statusFilter) => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (status) params.status = status;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.data.tickets);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchTickets(1, pageSize, statusFilter);
  }, [statusFilter, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setCurrentPage(newPage);
    fetchTickets(newPage, pageSize, statusFilter);
  };

  const filteredTickets = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.ticket_number.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.book_id && t.book_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Support Queries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and reply to your queries regarding book royalties, distribution, and publishing
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="btn-primary text-xs py-1.5 px-3.5 shadow-subtle flex items-center self-start sm:self-auto gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Query</span>
        </Link>
      </div>

      {/* Filter and Search Bar: Full remaining width given to Search bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle flex items-center gap-2 relative">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket #, subject, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-editorial pl-9 py-1.5 text-xs w-full"
          />
        </div>

        {/* Filter Button with Dropdown Popover */}
        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`text-xs py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all shadow-subtle ${
              statusFilter
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>{statusFilter ? `Status: ${statusFilter}` : 'Filter'}</span>
            {statusFilter && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-card z-50 p-1.5 animate-fadeIn">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Filter by Status</span>
                {statusFilter && (
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setFilterOpen(false);
                    }}
                    className="text-brand-600 hover:text-brand-800 normal-case font-medium text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="py-1 space-y-0.5">
                {[
                  { label: 'All Statuses', value: '' },
                  { label: 'Open', value: 'Open', color: 'bg-amber-500' },
                  { label: 'In Progress', value: 'In Progress', color: 'bg-blue-500' },
                  { label: 'Resolved', value: 'Resolved', color: 'bg-emerald-500' },
                  { label: 'Closed', value: 'Closed', color: 'bg-slate-400' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.color && <span className={`w-1.5 h-1.5 rounded-full ${opt.color}`}></span>}
                      {opt.label}
                    </span>
                    {statusFilter === opt.value && (
                      <Check className="w-3.5 h-3.5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Loading support queries..." size="md" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No support tickets found"
            description={
              statusFilter
                ? `You have no tickets currently in the "${statusFilter}" state.`
                : 'You have not submitted any queries yet.'
            }
            action={
              <Link to="/tickets/new" className="btn-primary text-xs py-1.5 px-3">
                Submit a Support Query
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ticket #</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Associated Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600">
                      {ticket.book_id ? (
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-800 text-[11px]">
                          {ticket.book_id}
                        </span>
                      ) : (
                        <span className="italic text-slate-400 text-[11px]">General / Account</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge type="category" value={ticket.category} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge type="priority" value={ticket.priority} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge type="status" value={ticket.status} />
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <Link
                        to={`/tickets/${ticket.ticket_number}`}
                        className="btn-secondary text-[11px] py-1 px-2.5 shadow-subtle hover:border-brand-300 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                      >
                        <span>Thread</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredTickets.length > 0 && (
          <div className="p-2.5 px-3 sm:px-4 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="text-slate-900 font-semibold">
                  {Math.min((currentPage - 1) * pageSize + 1, pagination.total || filteredTickets.length)}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-900 font-semibold">
                  {Math.min(currentPage * pageSize, pagination.total || filteredTickets.length)}
                </strong>{' '}
                of <strong className="text-slate-900 font-semibold">{pagination.total || filteredTickets.length}</strong> queries
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-slate-400">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors ${
                          currentPage === p
                            ? 'bg-brand-600 text-white shadow-subtle'
                            : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= (pagination.pages || 1)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
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
