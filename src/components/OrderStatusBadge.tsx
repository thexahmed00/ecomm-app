import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    placed: { bg: 'bg-gray-800', text: 'text-gray-300', label: 'Placed' },
    confirmed: { bg: 'bg-blue-900/50', text: 'text-blue-400', label: 'Confirmed' },
    processing: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'Processing' },
    shipped: { bg: 'bg-purple-900/50', text: 'text-purple-400', label: 'Shipped' },
    delivered: { bg: 'bg-green-900/50', text: 'text-green-400', label: 'Delivered' },
    cancelled: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'Cancelled' },
    returned: { bg: 'bg-orange-900/50', text: 'text-orange-400', label: 'Returned' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.placed;

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text} border border-current/20`}>
      {config.label}
    </span>
  );
}
