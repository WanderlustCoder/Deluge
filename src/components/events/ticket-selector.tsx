'use client';

import { useState } from 'react';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: number | null;
  maxPerOrder: number;
  includedItems: string[];
  salesOpen: boolean;
}

interface TicketSelectorProps {
  tickets: TicketType[];
  onSelectionChange: (selection: Array<{ ticketTypeId: string; quantity: number }>) => void;
}

export function TicketSelector({ tickets, onSelectionChange }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    const newQuantities = { ...quantities, [ticketId]: quantity };
    setQuantities(newQuantities);

    const selection = Object.entries(newQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    onSelectionChange(selection);
  };

  const getTotal = () => {
    return tickets.reduce((total, ticket) => {
      return total + (quantities[ticket.id] || 0) * ticket.price;
    }, 0);
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const quantity = quantities[ticket.id] || 0;
        const canAdd = ticket.salesOpen && (ticket.available === null || ticket.available > quantity);
        const maxQty = Math.min(
          ticket.maxPerOrder,
          ticket.available !== null ? ticket.available : ticket.maxPerOrder
        );

        return (
          <div
            key={ticket.id}
            className={`border rounded-lg p-4 ${
              ticket.salesOpen
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-gray-100 dark:border-gray-800 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {ticket.name}
                </h4>
                {ticket.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {ticket.description}
                  </p>
                )}
                {ticket.includedItems.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {ticket.includedItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-teal">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
                {ticket.available !== null && ticket.salesOpen && (
                  <p className="text-xs text-gray-500 mt-2">
                    {ticket.available} available
                  </p>
                )}
                {!ticket.salesOpen && (
                  <p className="text-xs text-red-500 mt-2">
                    Not available
                  </p>
                )}
              </div>

              <div className="text-right ml-4">
                <p className="text-lg font-semibold text-ocean">
                  ${ticket.price.toFixed(2)}
                </p>

                {ticket.salesOpen && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(ticket.id, Math.max(0, quantity - 1))}
                      disabled={quantity === 0}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(ticket.id, Math.min(maxQty, quantity + 1))}
                      disabled={!canAdd}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-2xl font-bold text-ocean">
            ${getTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
