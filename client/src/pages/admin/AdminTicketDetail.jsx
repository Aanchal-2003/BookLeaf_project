import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  BookOpen,
  Sparkles,
  Lock,
  Send,
  RefreshCw,
  AlertTriangle,
  History,
  FileText,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const AdminTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [author, setAuthor] = useState(null);
  const [book, setBook] = useState(null);
  const [messages, setMessages] = useState([]);
  const [internalNotes, setInternalNotes] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab in workbench: 'ai-studio' | 'notes' | 'audit'
  const [activeTab, setActiveTab] = useState('ai-studio');

  // Response Editor State
  const [draftContent, setDraftContent] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Internal Note State
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Override States
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchTicketDetails = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await api.get(`/admin/tickets/${id}`);
      const d = res.data.data;
      setTicket(d.ticket);
      setAuthor(d.author);
      setBook(d.book);
      setMessages(d.messages || []);
      setInternalNotes(d.internalNotes || []);
      setAuditEvents(d.auditEvents || []);

      // Pre-fill draft response if empty
      if (!draftContent && d.ticket.ai_draft_response) {
        setDraftContent(d.ticket.ai_draft_response);
      }
    } catch (err) {
      if (!isPoll) setError(err.message || 'Failed to load ticket workbench');
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data.data.admins);
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    fetchAdmins();
  }, [id]);

  // Polling for new incoming messages every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTicketDetails(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Status Change Handler
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/tickets/${id}/status`, { status: newStatus });
      setTicket(res.data.data.ticket);
      setActionSuccess(`Status successfully changed to "${newStatus}"`);
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Category Override Handler
  const handleCategoryOverride = async (newCategory) => {
    setUpdatingCategory(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/tickets/${id}/category`, { category: newCategory });
      setTicket(res.data.data.ticket);
      setActionSuccess(`Category overridden to "${newCategory}"`);
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Priority Override Handler
  const handlePriorityOverride = async (newPriority) => {
    setUpdatingPriority(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/tickets/${id}/priority`, { priority: newPriority });
      setTicket(res.data.data.ticket);
      setActionSuccess(`Priority adjusted to "${newPriority}"`);
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to update priority');
    } finally {
      setUpdatingPriority(false);
    }
  };

  // Assignment Handler
  const handleAssigneeChange = async (adminId) => {
    setUpdatingAssignee(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/tickets/${id}/assign`, {
        admin_id: adminId || null,
      });
      setTicket(res.data.data.ticket);
      setActionSuccess('Assignment updated');
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to assign ticket');
    } finally {
      setUpdatingAssignee(false);
    }
  };

  // AI Draft Regeneration
  const handleRegenerateDraft = async () => {
    setGeneratingDraft(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/tickets/${id}/ai-draft`);
      setDraftContent(res.data.data.draft);
      setActionSuccess('Fresh grounded AI draft generated using BookLeaf Knowledge Base!');
    } catch (err) {
      setActionError(err.message || 'Failed to generate AI draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Dispatch Approved Reply to Author
  const handleSendReply = async () => {
    if (!draftContent.trim()) {
      setActionError('Response draft cannot be empty.');
      return;
    }

    setSendingReply(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/tickets/${id}/messages`, {
        content: draftContent.trim(),
      });

      setMessages((prev) => [...prev, res.data.data.message]);
      setTicket(res.data.data.ticket);
      setActionSuccess('Approved response successfully sent to the author!');
      setDraftContent('');
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Save Internal Note
  const handleSaveInternalNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSavingNote(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/tickets/${id}/notes`, {
        content: noteContent.trim(),
      });
      setInternalNotes((prev) => [...prev, res.data.data.note]);
      setNoteContent('');
      setActionSuccess('Private note saved to ticket audit log.');
      await fetchTicketDetails(true);
    } catch (err) {
      setActionError(err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading ticket workbench..." size="lg" />;
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold text-lg mb-1">Ticket Not Found</h3>
        <p className="text-sm">{error}</p>
        <Link to="/admin/tickets" className="mt-4 btn-secondary text-xs inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div>
        <Link
          to="/admin/tickets"
          className="text-xs font-semibold text-charcoal-500 hover:text-burgundy-700 inline-flex items-center mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Ticket Queue
        </Link>

        {/* Action feedback notifications */}
        {actionSuccess && (
          <div className="mb-4 bg-forest-50 border border-forest-300 text-forest-800 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-subtle">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-forest-600" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-forest-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-subtle">
            <span className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              {actionError}
            </span>
            <button onClick={() => setActionError('')} className="text-red-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="card-parchment p-3.5 bg-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className="font-mono text-xs font-bold bg-charcoal-900 text-white px-2 py-0.5 rounded">
                {ticket.ticket_number}
              </span>
              <StatusBadge type="status" value={ticket.status} />
              <StatusBadge type="priority" value={ticket.priority} />
              <span className="text-[11px] text-charcoal-400">
                Created {new Date(ticket.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <h1 className="text-lg font-bold text-charcoal-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                Change Status
              </label>
              <select
                disabled={updatingStatus}
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input-editorial py-1.5 px-3 text-xs bg-parchment-50 font-semibold"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Category Override */}
            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                Category Override
              </label>
              <select
                disabled={updatingCategory}
                value={ticket.category}
                onChange={(e) => handleCategoryOverride(e.target.value)}
                className="input-editorial py-1.5 px-3 text-xs bg-parchment-50"
              >
                <option value="Royalty & Payments">Royalty & Payments</option>
                <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                <option value="Printing & Quality">Printing & Quality</option>
                <option value="Distribution & Availability">Distribution & Availability</option>
                <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {/* Priority Override */}
            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                Priority Override
              </label>
              <select
                disabled={updatingPriority}
                value={ticket.priority}
                onChange={(e) => handlePriorityOverride(e.target.value)}
                className="input-editorial py-1.5 px-3 text-xs bg-parchment-50 font-semibold"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                Assign Staff
              </label>
              <select
                disabled={updatingAssignee}
                value={ticket.assigned_admin_id?._id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="input-editorial py-1.5 px-3 text-xs bg-parchment-50"
              >
                <option value="">&mdash; Unassigned &mdash;</option>
                {admins.map((adm) => (
                  <option key={adm._id} value={adm._id}>
                    {adm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Context & Conversation (Left) vs Workbench Tools (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Author Info & Associated Book & Public Thread */}
        <div className="lg:col-span-5 space-y-6">
          {/* Author Details Card */}
          <div className="card-parchment p-5 bg-white">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 flex items-center mb-3">
              <User className="w-3.5 h-3.5 mr-1.5 text-burgundy-700" />
              Author Context
            </h3>
            {author ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Author Name:</span>
                  <span className="font-bold text-charcoal-900">{author.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Author ID:</span>
                  <span className="font-mono bg-parchment-200 px-1.5 py-0.5 rounded text-charcoal-800">
                    {author.author_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Email:</span>
                  <span className="font-mono text-charcoal-800">{author.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Phone & City:</span>
                  <span className="text-charcoal-800">{author.phone} &bull; {author.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Joined Date:</span>
                  <span className="text-charcoal-800">
                    {new Date(author.joined_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-charcoal-400">Author profile details not found.</div>
            )}
          </div>

          {/* Book Context Card */}
          <div className="card-parchment p-5 bg-white">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 flex items-center mb-3">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-burgundy-700" />
              Associated Book Record
            </h3>
            {book ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-charcoal-500 font-medium">Title:</span>
                  <span className="font-bold text-charcoal-900 text-right max-w-[200px]">{book.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">ISBN:</span>
                  <span className="font-mono text-charcoal-800">{book.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Status:</span>
                  <StatusBadge type="bookStatus" value={book.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Retail Price (MRP):</span>
                  <span className="text-charcoal-800 font-medium">
                    {book.mrp !== null ? `₹${book.mrp}` : <span className="italic text-charcoal-400">Not available</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Lifetime Copies Sold:</span>
                  <span className="font-semibold text-charcoal-900">{book.total_copies_sold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Royalty (Earned / Paid / Pending):</span>
                  <span className="font-mono text-charcoal-800">
                    ₹{book.total_royalty_earned} / ₹{book.royalty_paid} / <strong className="text-burgundy-700">₹{book.royalty_pending}</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-medium">Print Partner:</span>
                  <span className="text-charcoal-800">{book.print_partner || <span className="italic text-charcoal-400">None assigned</span>}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-charcoal-500 italic p-2 bg-parchment-100 rounded-lg">
                Query raised as General / Account Level &mdash; no specific book attached.
              </div>
            )}
          </div>

          {/* Public Conversation Thread Stream */}
          <div className="card-parchment overflow-hidden bg-parchment-50">
            <div className="p-3 bg-white border-b border-charcoal-200 flex items-center justify-between">
              <h3 className="font-bold text-charcoal-900 text-xs">
                Public Ticket Thread ({messages.length} messages)
              </h3>
              <span className="text-[10px] text-forest-700 font-mono flex items-center">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: '4s' }} /> live
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto text-xs">
              {messages.map((msg, idx) => {
                const isAuthor = msg.sender_type === 'author';
                return (
                  <div
                    key={msg._id || idx}
                    className={`p-3.5 rounded-xl border shadow-subtle ${
                      isAuthor
                        ? 'bg-white border-parchment-300'
                        : 'bg-burgundy-50/50 border-burgundy-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span className="font-semibold text-charcoal-900">
                        {isAuthor ? `Author (${msg.sender_name})` : `Staff (${msg.sender_name})`}
                      </span>
                      <span className="text-charcoal-400">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-charcoal-800 leading-relaxed text-xs">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): AI Studio & Dispatch Workbench & Internal Notes & Audit Trail */}
        <div className="lg:col-span-7 space-y-4">
          {/* Workbench Mode Tabs */}
          <div className="flex border-b border-parchment-300 space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('ai-studio')}
              className={`py-2.5 px-4 font-semibold border-b-2 transition flex items-center ${
                activeTab === 'ai-studio'
                  ? 'border-burgundy-700 text-burgundy-800 bg-white rounded-t-lg'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amberGold-600" />
              AI Draft Studio & Reply
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2.5 px-4 font-semibold border-b-2 transition flex items-center ${
                activeTab === 'notes'
                  ? 'border-burgundy-700 text-burgundy-800 bg-white rounded-t-lg'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-charcoal-600" />
              Internal Notes ({internalNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2.5 px-4 font-semibold border-b-2 transition flex items-center ${
                activeTab === 'audit'
                  ? 'border-burgundy-700 text-burgundy-800 bg-white rounded-t-lg'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-charcoal-600" />
              Audit Log ({auditEvents.length})
            </button>
          </div>

          {/* TAB 1: AI DRAFT STUDIO & DISPATCH */}
          {activeTab === 'ai-studio' && (
            <div className="space-y-5">
              {/* AI Prediction & Grounding Banner */}
              <div className="card-parchment p-4 bg-parchment-50 border-amberGold-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-charcoal-900 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5 text-amberGold-600" />
                    AI Intelligence & Policy Grounding
                  </span>
                  <span className="text-[10px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-mono">
                    Model: {ticket.ai_processing_status === 'completed' ? 'BookLeaf Policy Engine v1' : 'Manual'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-parchment-200">
                  <div>
                    <span className="text-charcoal-500 block text-[11px]">AI Predicted Category:</span>
                    <span className="font-semibold text-charcoal-800">
                      {ticket.ai_predicted_category || 'General Inquiry'}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal-500 block text-[11px]">AI Predicted Priority:</span>
                    <span className="font-semibold text-charcoal-800">
                      {ticket.ai_predicted_priority || 'Medium'}
                    </span>
                  </div>
                </div>

                {ticket.ai_reasoning && (
                  <p className="mt-2 text-[11px] text-charcoal-600 italic bg-white/70 p-2 rounded border border-parchment-300">
                    &ldquo;{ticket.ai_reasoning}&rdquo;
                  </p>
                )}
              </div>

              {/* Editable Response Draft */}
              <div className="card-parchment p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-charcoal-900 text-xs">
                    AI Response Draft
                  </h3>
                  <button
                    type="button"
                    onClick={handleRegenerateDraft}
                    disabled={generatingDraft}
                    className="btn-secondary text-xs py-1 px-2.5 flex items-center"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${generatingDraft ? 'animate-spin' : ''}`} />
                    {generatingDraft ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>

                <textarea
                  rows={9}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="AI draft appears here. Edit before dispatching..."
                  className="input-editorial font-mono text-xs leading-relaxed"
                ></textarea>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sendingReply || !draftContent.trim()}
                    className="btn-primary py-1.5 px-4 text-xs font-semibold shadow-subtle flex items-center"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {sendingReply ? 'Dispatching...' : 'Dispatch Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVATE INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">

              {/* Add Note Form */}
              <div className="card-parchment p-4 bg-white">
                <form onSubmit={handleSaveInternalNote} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add an internal observation, escalation notes, or coordination comments for team members..."
                    className="input-editorial text-xs"
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !noteContent.trim()}
                      className="btn-secondary text-xs py-1.5 px-4 font-semibold"
                    >
                      {savingNote ? 'Saving...' : 'Add Private Note'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes List */}
              <div className="card-parchment p-3.5 bg-white space-y-2.5">
                <h4 className="font-bold text-xs text-charcoal-900 border-b border-charcoal-100 pb-1.5">
                  Recorded Internal Notes ({internalNotes.length})
                </h4>

                {internalNotes.length === 0 ? (
                  <div className="text-center py-6 text-charcoal-400 text-xs italic">
                    No private notes added to this ticket yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {internalNotes.map((note) => (
                      <div key={note._id} className="p-3 bg-parchment-100 rounded-lg border border-parchment-300 text-xs">
                        <div className="flex justify-between items-center text-charcoal-500 mb-1 text-[11px]">
                          <span className="font-semibold text-charcoal-900 flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-burgundy-700" />
                            {note.admin_name}
                          </span>
                          <span>
                            {new Date(note.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-charcoal-800 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL LOG */}
          {activeTab === 'audit' && (
            <div className="card-parchment p-3.5 bg-white space-y-2.5">
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
                <h3 className="font-bold text-xs text-charcoal-900 flex items-center">
                  <History className="w-3.5 h-3.5 mr-1.5 text-burgundy-700" />
                  Compliance & State Change Audit Trail
                </h3>
                <span className="text-[11px] text-charcoal-400">
                  {auditEvents.length} events logged
                </span>
              </div>

              {auditEvents.length === 0 ? (
                <div className="text-center py-6 text-charcoal-400 text-xs italic">
                  No audit events recorded for this ticket.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {auditEvents.map((event) => (
                    <div key={event._id} className="p-3 bg-parchment-50 border border-parchment-300 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-charcoal-900 uppercase tracking-wider">
                          {event.action.replace('_', ' ')}
                        </span>
                        <span className="text-charcoal-400 font-mono">
                          {new Date(event.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-charcoal-600">
                        Actor: <strong>{event.actor_name}</strong> ({event.actor_type})
                      </div>
                      {event.field_changed && (
                        <div className="text-[11px] font-mono text-charcoal-700 bg-white p-1.5 rounded border border-parchment-200">
                          {event.field_changed}: {String(event.previous_value)} &rarr; <strong>{String(event.new_value)}</strong>
                        </div>
                      )}
                      {event.notes && (
                        <p className="text-charcoal-500 italic text-[11px]">{event.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
