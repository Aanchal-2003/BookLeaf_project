import React from 'react';

export const StatusBadge = ({ type = 'status', value }) => {
  if (!value) return <span className="text-slate-400 text-[10px] italic">N/A</span>;

  // Ticket Status Badges
  if (type === 'status') {
    const statusStyles = {
      'Open': 'bg-amber-50 text-amber-700 border-amber-200/80',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/80',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      'Closed': 'bg-slate-100 text-slate-600 border-slate-200/80',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight border ${statusStyles[value] || 'bg-slate-100 text-slate-700'}`}>
        <span className="w-1.5 h-1.5 rounded-full mr-1 bg-current opacity-80"></span>
        {value}
      </span>
    );
  }

  // Priority Badges
  if (type === 'priority') {
    const priorityStyles = {
      'Critical': 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
      'High': 'bg-orange-50 text-orange-700 border-orange-200/80 font-semibold',
      'Medium': 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium',
      'Low': 'bg-slate-100 text-slate-600 border-slate-200 font-normal',
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${priorityStyles[value] || 'bg-slate-100 text-slate-700'}`}>
        {value}
      </span>
    );
  }

  // Book Status Badges
  if (type === 'bookStatus') {
    const isLive = value === 'Published & Live';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isLive ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
        {value}
      </span>
    );
  }

  // Category Badges
  if (type === 'category') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800">
      {value}
    </span>
  );
};
