import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  Clock,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AuthorTicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState('');

  const messagesEndRef = useRef(null);

  const fetchTicketDetails = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.data.ticket);
      setMessages(res.data.data.messages || []);
      setBook(res.data.data.book || null);
    } catch (err) {
      if (!isPoll) setError(err.message || 'Failed to load ticket details');
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Near-real-time polling (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTicketDetails(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    setReplyError('');

    if (!replyText.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/tickets/${id}/messages`, {
        content: replyText.trim(),
      });

      setMessages((prev) => [...prev, res.data.data.message]);
      if (res.data.data.ticket) {
        setTicket(res.data.data.ticket);
      }
      setReplyText('');
    } catch (err) {
      setReplyError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading conversation thread..." size="lg" />;
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold text-lg mb-1">Ticket Not Found</h3>
        <p className="text-sm">{error || 'Could not locate the requested ticket record.'}</p>
        <Link to="/tickets" className="mt-4 btn-secondary text-xs inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/tickets"
          className="text-xs font-semibold text-charcoal-500 hover:text-burgundy-700 inline-flex items-center mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Support Queries
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-charcoal-200 gap-2">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className="font-mono text-xs font-bold bg-charcoal-900 text-white px-2 py-0.5 rounded">
                {ticket.ticket_number}
              </span>
              <StatusBadge type="status" value={ticket.status} />
              <StatusBadge type="priority" value={ticket.priority} />
            </div>
            <h1 className="text-lg font-bold text-charcoal-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-charcoal-500">
            <div>Submitted {new Date(ticket.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
          </div>
        </div>
      </div>

      {/* Ticket Context Information Card */}
      <div className="card-parchment p-3 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-charcoal-400 font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
            Category
          </span>
          <StatusBadge type="category" value={ticket.category} />
        </div>

        <div>
          <span className="text-charcoal-400 font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
            Associated Title
          </span>
          {book ? (
            <div className="font-semibold text-charcoal-900 flex items-center text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-burgundy-800" />
              {book.title} ({book.book_id})
            </div>
          ) : (
            <span className="italic text-charcoal-500 text-xs">General / Account Level</span>
          )}
        </div>

        <div>
          <span className="text-charcoal-400 font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
            Last Updated
          </span>
          <span className="text-charcoal-700 text-xs">
            {new Date(ticket.updatedAt).toLocaleString('en-IN', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="card-parchment overflow-hidden bg-parchment-50">
        <div className="p-2.5 px-3 bg-white border-b border-charcoal-200 flex items-center justify-between">
          <h2 className="font-bold text-charcoal-900 text-xs">
            Conversation Thread ({messages.length})
          </h2>
        </div>

        <div className="p-3.5 space-y-3.5 max-h-[420px] overflow-y-auto">
          {messages.map((msg, index) => {
            const isAuthor = msg.sender_type === 'author';
            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] text-charcoal-500 mb-1 px-1">
                  {isAuthor ? (
                    <>
                      <span className="font-bold text-charcoal-900">You ({msg.sender_name})</span>
                      <User className="w-3 h-3 text-forest-700" />
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-burgundy-700" />
                      <span className="font-bold text-burgundy-800">
                        BookLeaf Support ({msg.sender_name})
                      </span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-xl p-3 rounded-xl text-xs leading-relaxed shadow-subtle ${
                    isAuthor
                      ? 'bg-forest-800 text-white rounded-tr-none'
                      : 'bg-white text-charcoal-900 border border-charcoal-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Composer Form */}
        <div className="p-4 bg-white border-t border-parchment-300">
          {replyError && (
            <div className="mb-3 text-xs bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              {replyError}
            </div>
          )}

          <form onSubmit={handleSendReply}>
            <div className="relative">
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the support team..."
                className="input-editorial pr-24 resize-none text-sm"
              ></textarea>
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="absolute right-2.5 bottom-2.5 btn-primary py-2 px-4 text-xs font-semibold"
              >
                {sending ? 'Sending...' : 'Reply'}
                <Send className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
