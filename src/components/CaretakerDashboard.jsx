import React from 'react';
import { CalendarDays, Clock3, HeartHandshake, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/dateTime';

export const CaretakerDashboard = () => {
  const { user, assignedCaretakerBookings, workspaceLoading, workspaceError } = useApp();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <HeartHandshake className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Caretaker Portal</h1>
            <p className="mt-1 text-xs text-slate-500">Welcome, {user?.name}. View the care bookings assigned to your profile.</p>
          </div>
        </div>
      </header>

      {workspaceLoading && <p role="status" className="mb-4 text-sm text-slate-500">Loading assigned bookings…</p>}
      {workspaceError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{workspaceError}</p>}

      {!workspaceLoading && !workspaceError && assignedCaretakerBookings.length === 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-400" />
          <h2 className="mt-3 text-base font-bold text-slate-900">No assigned bookings yet</h2>
          <p className="mt-1 text-sm text-slate-500">New bookings assigned to your caretaker profile will appear here.</p>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {assignedCaretakerBookings.map((booking) => (
          <article key={booking.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">{booking.serviceType || 'Care booking'}</h2>
                <p className="mt-1 text-xs text-slate-500">{booking.caretakerName}{booking.role ? ` · ${booking.role}` : ''}</p>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">{booking.status || 'Assigned'}</span>
            </div>

            <dl className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="flex items-start gap-2 text-slate-600">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div><dt className="font-semibold text-slate-500">Start</dt><dd className="mt-0.5">{booking.startAt ? formatDateTime(booking.startAt) : 'To be confirmed'}</dd></div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div><dt className="font-semibold text-slate-500">Shift</dt><dd className="mt-0.5">{booking.shift || 'Not specified'}</dd></div>
              </div>
              <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div><dt className="font-semibold text-slate-500">Location</dt><dd className="mt-0.5">{booking.location || 'Not specified'}</dd></div>
              </div>
              {booking.specialNeed && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-slate-500">Care requested</dt>
                  <dd className="mt-1 text-xs text-slate-700">{booking.specialNeed}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </main>
  );
};
