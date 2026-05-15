'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { cn, formatPrice } from '@/lib/utils';
import type { Seat } from '@/lib/api';
import { useBookingStore } from '@/store/booking';

const categoryColors: Record<string, string> = {
  REGULAR: 'bg-emerald-500/80 hover:bg-emerald-400',
  GOLD: 'bg-amber-500/80 hover:bg-amber-400',
  PLATINUM: 'bg-violet-500/80 hover:bg-violet-400',
  RECLINER: 'bg-rose-500/80 hover:bg-rose-400',
  PREMIUM: 'bg-blue-500/80 hover:bg-blue-400',
  VIP: 'bg-pink-500/80 hover:bg-pink-400',
};

export function SeatMap({ showtimeId, initialSeats }: { showtimeId: string; initialSeats: Seat[] }) {
  const [seats, setSeats] = useState(initialSeats);
  const { selectedSeats, toggleSeat } = useBookingStore();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
    const socket = io(`${wsUrl}/seats`, { transports: ['websocket'] });
    socket.emit('join-showtime', { showtimeId });
    socket.on('seat-map', (data: { seats: Seat[] }) => setSeats(data.seats));
    socket.on('seat-update', (data: { seats: Seat[] }) => setSeats(data.seats));
    return () => {
      socket.emit('leave-showtime', { showtimeId });
      socket.disconnect();
    };
  }, [showtimeId]);

  const rows = [...new Set(seats.map((s) => s.row))].sort();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-lg rounded-t-full bg-gradient-to-b from-white/20 to-white/5 py-2 text-center text-xs uppercase tracking-widest text-white/60">
        Screen
      </div>

      <div className="space-y-2 overflow-x-auto">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs font-medium text-white/50">{row}</span>
            <div className="flex gap-1.5">
              {seats
                .filter((s) => s.row === row)
                .sort((a, b) => a.number - b.number)
                .map((seat) => {
                  const selected = selectedSeats.some((s) => s.id === seat.id);
                  const disabled = seat.status === 'BOOKED' || seat.status === 'BLOCKED';
                  const locked = seat.status === 'LOCKED' && !selected;

                  return (
                    <button
                      key={seat.id}
                      disabled={disabled || locked}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.row}${seat.number} · ${seat.category} · ${formatPrice(seat.price)}`}
                      className={cn(
                        'h-7 w-7 rounded-md text-[10px] font-medium transition',
                        disabled && 'cursor-not-allowed bg-white/10 opacity-40',
                        locked && 'cursor-not-allowed bg-orange-500/50',
                        !disabled && !locked && categoryColors[seat.category] ?? 'bg-emerald-500/80',
                        selected && 'ring-2 ring-white scale-110',
                      )}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded', color.split(' ')[0])} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
