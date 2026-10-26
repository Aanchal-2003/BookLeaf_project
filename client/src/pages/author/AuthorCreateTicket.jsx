import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  LifeBuoy,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Send,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const AuthorCreateTicket = () => {
  const [searchParams] = useSearchParams();
  const initialBookId = searchParams.get('book_id') || '';

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [bookId, setBookId] = useState(initialBookId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      try {
        const res = await api.get('/books');
        setBooks(res.data.data.books);
      } catch (err) {
        console.error('Failed to load author books:', err);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchAuthorBooks();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject.trim() || subject.trim().length < 3) {
      setError('Please provide a subject line with at least 3 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description with at least 10 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        book_id: bookId ? bookId : null,
      };

      const res = await api.post('/tickets', payload);
      setSuccessTicket(res.data.data.ticket);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successTicket) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-card text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Ticket #{successTicket.ticket_number} Submitted Successfully!
        </h2>
        <p className="text-xs text-slate-600 mb-4 max-w-md mx-auto leading-relaxed">
          Our support team and AI classification system have received your query. An initial investigation has been started.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left max-w-md mx-auto mb-5 text-xs space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Assigned Category:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{successTicket.category}</span>
          </div>
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Priority Level:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{successTicket.priority}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Associated Title:</span>
            <span className="font-semibold text-slate-900">
              {successTicket.book_id ? successTicket.book_id : 'General / Account Level'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-2.5">
          <button
            onClick={() => navigate(`/tickets/${successTicket.ticket_number}`)}
            className="btn-primary text-xs py-2 px-4 shadow-subtle"
          >
            Go to Conversation Thread &rarr;
          </button>
          <button
            onClick={() => {
              setSuccessTicket(null);
              setSubject('');
              setDescription('');
              setSelectedFile(null);
            }}
            className="btn-secondary text-xs py-2 px-4"
          >
            Submit Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Breadcrumb */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <Link to="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/tickets" className="hover:text-slate-900 transition-colors">Support Queries</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">New Query</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Submit a Support Query
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Have questions about royalties, book inventory, or distribution? Our operations team and automated triage will assist you.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Web View Grid: 2/3 Form + 1/3 Guidance Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-subtle">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Associated Book Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Book Related to Query
              </label>
              {loadingBooks ? (
                <div className="text-xs text-slate-400 py-1">Loading author titles...</div>
              ) : (
                <div className="relative">
                  <select
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    className="input-editorial bg-white text-xs py-2 pr-8"
                  >
                    <option value="">&mdash; General / Account Level Query (No Specific Book) &mdash;</option>
                    {books.map((b) => (
                      <option key={b.book_id} value={b.book_id}>
                        [{b.book_id}] {b.title} &bull; {b.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="text-[11px] text-slate-400 mt-1 block">
                Linking your query to a specific title helps our operations team look up distributor logs immediately.
              </span>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Discrepancy with ISBN listed on Amazon India"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-editorial py-2 text-xs"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Min. 10 characters</span>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Please describe your query with as much detail as possible (e.g. retailer, dates, order numbers, or expected vs actual royalty)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-editorial py-2 text-xs leading-relaxed resize-y"
              ></textarea>
            </div>

            {/* File Attachment Interface */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attachment (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 transition-colors rounded-xl p-3.5 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 cursor-pointer hover:text-brand-600 transition-colors">
                        <span>Click to attach documents or screenshots</span>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Supports PNG, JPG, or PDF (up to 10MB)</span>
                    </div>
                  </div>

                  {selectedFile ? (
                    <div className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 font-medium px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span className="truncate max-w-[160px]">{selectedFile.name}</span>
                      <span className="text-emerald-600 font-normal">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="ml-1 text-emerald-700 hover:text-emerald-900 font-bold"
                        title="Remove attachment"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No file selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                All inquiries are classified and assigned automatically.
              </span>
              <div className="flex items-center space-x-2.5 ml-auto">
                <Link to="/tickets" className="btn-secondary text-xs py-1.5 px-3.5">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-1.5 px-4 text-xs font-semibold shadow-subtle flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" label="" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Web View Context & Guidance Cards */}
        <div className="space-y-3.5">
          {/* Card 1: Fast Resolution Tips */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Resolution Best Practices</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                <span><strong>Select Title:</strong> Linking your specific book pulls up ISBN, print partner, and sales logs for our team instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                <span><strong>Include Numbers:</strong> If reporting royalty or inventory mismatch, mention exact figures or payout dates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                <span><strong>Attach Proof:</strong> Screenshots of retailer listings (Amazon, Flipkart) help verify distribution issues rapidly.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Operations Support SLA */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-brand-600" />
              <span>Operations Support SLA</span>
            </div>
            <p className="text-indigo-900/80 leading-relaxed text-xs">
              Staff operations are active Monday to Saturday, 9:30 AM &ndash; 6:30 PM IST. Typical AI triage turnaround is immediate, with staff replies in under <strong>4 business hours</strong>.
            </p>
          </div>

          {/* Card 3: Quick Links */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-subtle flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Need to review current earnings?</span>
            <Link to="/books" className="text-brand-600 hover:text-brand-700 font-bold">
              View Books &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
