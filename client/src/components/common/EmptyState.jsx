import React from 'react';
import { BookOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No records found',
  description = 'There is currently no data to display.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-white border border-dashed border-charcoal-200 rounded-xl my-2">
      <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-burgundy-800 mb-2.5">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-charcoal-900 mb-0.5">{title}</h3>
      <p className="text-xs text-charcoal-500 max-w-sm mb-3">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
