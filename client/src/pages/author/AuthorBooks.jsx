import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  Search,
  Filter,
  Check,
  PlusCircle,
  LifeBuoy,
  Layers,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AuthorBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data.data.books);
    } catch (err) {
      setError(err.message || 'Failed to fetch author books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pageSize]);

  if (loading) {
    return <LoadingSpinner label="Retrieving your published titles and catalog..." size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold text-lg mb-1">Error Loading Catalog</h3>
        <p className="text-sm">{error}</p>
        <button onClick={fetchBooks} className="mt-4 btn-secondary text-xs">
          Try Again
        </button>
      </div>
    );
  }

  const publishedCount = books.filter((b) => b.status === 'Published & Live').length;
  const productionCount = books.filter((b) => b.status.includes('In Production')).length;

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase()) ||
      book.genre.toLowerCase().includes(search.toLowerCase()) ||
      book.book_id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'LIVE' && book.status === 'Published & Live') ||
      (statusFilter === 'PRODUCTION' && book.status.includes('In Production'));

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Books
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View publishing details, ISBNs, distribution channels, and sales royalties
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 px-3 shadow-subtle flex items-center gap-2 relative">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ISBN, genre..."
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
              statusFilter !== 'ALL'
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {statusFilter === 'LIVE'
                ? 'Status: Published'
                : statusFilter === 'PRODUCTION'
                ? 'Status: In Production'
                : 'Filter'}
            </span>
            {statusFilter !== 'ALL' && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-card z-50 p-1.5 animate-fadeIn">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Filter by Status</span>
                {statusFilter !== 'ALL' && (
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
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
                  { label: `All Titles (${books.length})`, value: 'ALL', color: null },
                  { label: `Published (${publishedCount})`, value: 'LIVE', color: 'bg-emerald-500' },
                  { label: `In Production (${productionCount})`, value: 'PRODUCTION', color: 'bg-amber-500' },
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

      {/* Books Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-subtle">
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No matching books found"
            description="Try adjusting your search criteria or filter to locate the desired title."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Book Details</th>
                  <th className="py-2.5 px-3">ISBN & Genre</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">MRP</th>
                  <th className="py-2.5 px-3 text-right">Copies Sold</th>
                  <th className="py-2.5 px-3 text-right">Royalty Earned</th>
                  <th className="py-2.5 px-3 text-right">Royalty Paid</th>
                  <th className="py-2.5 px-3 text-right">Pending</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBooks.map((book) => {
                  return (
                    <tr key={book.book_id} className="hover:bg-slate-50 transition-colors">
                      {/* Title & ID */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 text-xs">
                          {book.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {book.book_id} &bull; Print: {book.print_partner || 'Not available'}
                        </div>
                        {/* Distribution badges */}
                        {book.available_on && book.available_on.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {book.available_on.map((platform) => (
                              <span
                                key={platform}
                                className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600 border border-slate-200/80"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* ISBN & Genre */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-[11px] text-slate-800 font-medium">
                          {book.isbn}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {book.genre}
                        </div>
                      </td>

                      {/* Status & Publication Date */}
                      <td className="py-2.5 px-3">
                        <div>
                          <StatusBadge type="bookStatus" value={book.status} />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {book.publication_date ? (
                            new Date(book.publication_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="italic text-slate-400">Date not available</span>
                          )}
                        </div>
                      </td>

                      {/* MRP */}
                      <td className="py-2.5 px-3 text-right font-medium text-xs text-slate-900">
                        {book.mrp !== null ? (
                          `₹${book.mrp}`
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Not available</span>
                        )}
                      </td>

                      {/* Copies Sold */}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 text-xs">
                        {book.total_copies_sold !== undefined && book.total_copies_sold !== null ? (
                          book.total_copies_sold.toLocaleString('en-IN')
                        ) : (
                          '0'
                        )}
                      </td>

                      {/* Royalty Earned */}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 text-xs">
                        {book.total_royalty_earned !== null ? (
                          `₹${book.total_royalty_earned.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Not available</span>
                        )}
                      </td>

                      {/* Royalty Paid */}
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-700 text-xs">
                        {book.royalty_paid !== null ? (
                          `₹${book.royalty_paid.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Not available</span>
                        )}
                      </td>

                      {/* Royalty Pending */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-xs">
                        {book.royalty_pending !== null ? (
                          `₹${book.royalty_pending.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Not available</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          to={`/tickets/new?book_id=${book.book_id}`}
                          title={`Raise query for ${book.title}`}
                          className="btn-secondary text-[11px] py-1 px-2.5 shadow-subtle hover:border-brand-300 hover:text-brand-700 font-medium inline-flex items-center gap-0.5"
                        >
                          <span>Query</span>
                          <span className="text-xs">&rarr;</span>
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
        {filteredBooks.length > 0 && (
          <div className="p-2.5 px-3 sm:px-4 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="text-slate-900 font-semibold">
                  {(page - 1) * pageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-900 font-semibold">
                  {Math.min(page * pageSize, filteredBooks.length)}
                </strong>{' '}
                of <strong className="text-slate-900 font-semibold">{filteredBooks.length}</strong> titles
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="text-xs px-2 text-slate-600 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
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
