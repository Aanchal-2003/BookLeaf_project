import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  LifeBuoy,
  Search,
  Filter,
  ArrowRight,
  User,
  Shield,
  Clock,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export const AdminTicketQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and pagination state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [assignedAdmin, setAssignedAdmin] = useState(searchParams.get('assigned_admin_id') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(20);

  // Popover state
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Active filter count
  const activeFilterCount = [status, category, priority, assignedAdmin].filter(Boolean).length;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTickets = async (overrideSearch) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const querySearch = overrideSearch !== undefined ? overrideSearch : search;
      if (querySearch && querySearch.trim()) params.search = querySearch.trim();
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (assignedAdmin) params.assigned_admin_id = assignedAdmin;

      const res = await api.get('/admin/tickets', { params });
      setTickets(res.data.data.tickets);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data.data.admins);
    } catch (err) {
      console.error('Failed to load admin list:', err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [status, category, priority, assignedAdmin, currentPage, pageSize]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchTickets();
  };

  const handleClearSearch = () => {
    setSearch('');
    setCurrentPage(1);
    fetchTickets('');
  };

  const handleResetFilters = () => {
    setStatus('');
    setCategory('');
    setPriority('');
    setAssignedAdmin('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Author Ticket Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage author requests, assign staff members, and resolve inquiries
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
            {pagination.total} Tickets Found
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-subtle space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket # (e.g. TCK-1001), author name, or subject keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-editorial pl-9 pr-8 py-1.5 text-xs w-full"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter Button (Replacing Search Queue) */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showFilterDropdown || activeFilterCount > 0
                  ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${showFilterDropdown || activeFilterCount > 0 ? 'text-white' : 'text-slate-500'}`} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-white text-brand-700 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Filter Queue
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200/60">
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input-editorial py-1 text-xs bg-white w-full"
                    >
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input-editorial py-1 text-xs bg-white w-full"
                    >
                      <option value="">All Categories</option>
                      <option value="Royalty & Payments">Royalty & Payments</option>
                      <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                      <option value="Printing & Quality">Printing & Quality</option>
                      <option value="Distribution & Availability">Distribution & Availability</option>
                      <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input-editorial py-1 text-xs bg-white w-full"
                    >
                      <option value="">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Assigned Staff Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Assigned Staff
                    </label>
                    <select
                      value={assignedAdmin}
                      onChange={(e) => {
                        setAssignedAdmin(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input-editorial py-1 text-xs bg-white w-full"
                    >
                      <option value="">All Staff</option>
                      <option value="unassigned">Unassigned</option>
                      {admins.map((adm) => (
                        <option key={adm._id} value={adm._id}>
                          {adm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {pagination.total} tickets found
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(false)}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active:</span>
            {status && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Status: {status}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('');
                    setCurrentPage(1);
                  }}
                  className="hover:text-slate-950 p-0.5"
                  title="Remove status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Category: {category}
                <button
                  type="button"
                  onClick={() => {
                    setCategory('');
                    setCurrentPage(1);
                  }}
                  className="hover:text-slate-950 p-0.5"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priority && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Priority: {priority}
                <button
                  type="button"
                  onClick={() => {
                    setPriority('');
                    setCurrentPage(1);
                  }}
                  className="hover:text-slate-950 p-0.5"
                  title="Remove priority filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {assignedAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Staff: {assignedAdmin === 'unassigned' ? 'Unassigned' : (admins.find((a) => a._id === assignedAdmin)?.name || assignedAdmin)}
                <button
                  type="button"
                  onClick={() => {
                    setAssignedAdmin('');
                    setCurrentPage(1);
                  }}
                  className="hover:text-slate-950 p-0.5"
                  title="Remove staff filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Ticket Queue Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Fetching tickets from database..." size="md" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No tickets match criteria"
            description="Adjust your search terms or clear selected status/priority filters."
            action={
              <button onClick={handleResetFilters} className="btn-secondary text-xs">
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Author Details</th>
                  <th className="py-2.5 px-3">Subject & Book</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => {
                  const isUrgent =
                    (ticket.priority === 'Critical' || ticket.priority === 'High') &&
                    ticket.status !== 'Resolved' &&
                    ticket.status !== 'Closed';

                  return (
                    <tr
                      key={ticket._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isUrgent ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Ticket Number */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {ticket.ticket_number}
                        </div>
                        {isUrgent && (
                          <span className="inline-flex items-center text-[9px] font-bold text-rose-600 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> URGENT
                          </span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">
                          {ticket.author?.name || ticket.author_id}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {ticket.author_id} {ticket.author?.city ? `• ${ticket.author.city}` : ''}
                        </div>
                      </td>

                      {/* Subject & Book */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900 text-xs truncate">
                          {ticket.subject}
                        </div>
                        {ticket.book ? (
                          <div className="text-[10px] text-slate-500 truncate flex items-center mt-0.5">
                            <span className="font-medium text-slate-700 truncate">{ticket.book.title}</span>
                            <span className="mx-1 text-slate-300">&bull;</span>
                            <span className="font-mono text-[9px]">{ticket.book.isbn}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No book attached</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge type="category" value={ticket.category} />
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge type="priority" value={ticket.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge type="status" value={ticket.status} />
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {ticket.assigned_admin ? (
                          <div className="flex items-center space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                              {ticket.assigned_admin.name.charAt(0)}
                            </div>
                            <span className="text-slate-800 font-medium text-xs">
                              {ticket.assigned_admin.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-mono">Unassigned</span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <Link
                          to={`/admin/tickets/${ticket.ticket_number}`}
                          className="btn-secondary text-[11px] py-1 px-2.5 font-medium inline-flex items-center gap-1 hover:border-brand-300 hover:text-brand-700"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              {pagination.total > 0 ? (
                <>
                  Showing <strong className="text-slate-800 font-semibold">{Math.min((pagination.page - 1) * pageSize + 1, pagination.total)}</strong> to <strong className="text-slate-800 font-semibold">{Math.min(pagination.page * pageSize, pagination.total)}</strong> of <strong className="text-slate-800 font-semibold">{pagination.total}</strong> tickets
                </>
              ) : (
                '0 tickets'
              )}
            </span>

            <div className="flex items-center space-x-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-500">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 mr-1">
              Page <strong className="text-slate-800">{pagination.page}</strong> of <strong className="text-slate-800">{pagination.pages || 1}</strong>
            </span>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={pagination.page >= (pagination.pages || 1)}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
