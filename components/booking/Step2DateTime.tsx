'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service, Staff } from '@/lib/types';
import type { BookingSelections, DateTimeSelection } from '@/lib/validation/booking';
import {
  getAvailableDates,
  getAvailableSlotsForDay,
  type TimeSlot,
} from '@/lib/actions/availability';
import { createBrowserClient } from '@supabase/ssr';

const TIMEZONE = 'Africa/Nairobi';

interface Step2Props {
  service: Service;
  selections: BookingSelections;
  onUpdate: (dateTime: Partial<DateTimeSelection>) => void;
}

export function Step2DateTime({ service, selections, onUpdate }: Step2Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (selections.dateTime.date) {
      return new Date(selections.dateTime.date);
    }
    return undefined;
  });
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(() => {
    if (selections.dateTime.slotStart && selections.dateTime.slotEnd && selections.dateTime.slotId) {
      return {
        id: selections.dateTime.slotId,
        slotStart: selections.dateTime.slotStart,
        slotEnd: selections.dateTime.slotEnd,
        timeString: new Date(selections.dateTime.slotStart).toLocaleTimeString('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }),
        timeStringEnd: new Date(selections.dateTime.slotEnd).toLocaleTimeString('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }),
        available: true,
      };
    }
    return null;
  });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(
    selections.dateTime.staffId
  );
  const [loadingDates, startLoadingDates] = useTransition();
  const [loadingSlots, startLoadingSlots] = useTransition();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  /* ── Load staff on mount ────────────────────────────────── */
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setStaff(data as Staff[]);
      });
  }, []);

  /* ── Fetch available dates when month changes ──────────── */
  const fetchDatesForMonth = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      startLoadingDates(async () => {
        try {
          const dates = await getAvailableDates(service.id, year, month);
          setAvailableDates(dates);
        } catch {
          setAvailableDates([]);
        }
      });
    },
    [service.id]
  );

  useEffect(() => {
    fetchDatesForMonth(currentMonth);
  }, [currentMonth, fetchDatesForMonth]);

  /* ── Fetch time slots when day is selected ──────────────── */
  const fetchSlotsForDay = useCallback(
    (date: Date) => {
      const dateStr = formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');

      startLoadingSlots(async () => {
        try {
          const slots = await getAvailableSlotsForDay(
            service.id,
            dateStr,
            selectedStaffId
          );
          setTimeSlots(slots);
        } catch {
          setTimeSlots([]);
        }
      });
    },
    [service.id, selectedStaffId]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDay(selectedDate);
    }
  }, [selectedDate, fetchSlotsForDay]);

  /* ── Disable date logic ─────────────────────────────────── */
  const disabledDates = useCallback(
    (date: Date): boolean => {
      // Past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;

      // Sundays
      if (date.getDay() === 0) return true;

      // Not in available dates list
      const dateStr = formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
      if (availableDates.length > 0 && !availableDates.includes(dateStr)) {
        return true;
      }

      return false;
    },
    [availableDates]
  );

  /* ── Handlers ───────────────────────────────────────────── */
  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setTimeSlots([]);

    // Update parent with date only (slot will come from slot selection)
    onUpdate({
      date,
      staffId: selectedStaffId,
    });
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available || !selectedDate) return;
    setSelectedSlot(slot);

    onUpdate({
      date: selectedDate,
      slotId: slot.id,
      slotStart: slot.slotStart,
      slotEnd: slot.slotEnd,
      staffId: selectedStaffId,
    });
  };

  const handleStaffChange = (staffId: string | undefined) => {
    setSelectedStaffId(staffId);
    setSelectedSlot(null);

    if (selectedDate) {
      onUpdate({
        date: selectedDate,
        staffId,
      });
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-blossome-brown mb-1">
        Date & Heure
      </h2>
      <p className="text-sm text-blossome-mid mb-6">
        Choisissez le jour et le créneau horaire
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Calendar ──────────────────────────────────────── */}
        <div>
          <div className="rounded-xl border border-blossome-taupe/20 bg-blossome-cream/30 p-5 max-w-md">
            {loadingDates ? (
              <Skeleton className="h-[380px] w-full rounded-xl" />
            ) : (
              <DayPicker
                mode="single"
                locale={fr}
                selected={selectedDate}
                onSelect={handleDaySelect}
                onMonthChange={(month) => setCurrentMonth(month)}
                disabled={disabledDates}
                fromDate={new Date()}
                classNames={{
                  root: 'text-blossome-brown w-full',
                  months: 'relative w-full',
                  month: 'w-full',
                  month_caption: 'flex justify-center items-center h-12 mb-1',
                  caption_label: 'text-base font-semibold text-blossome-brown',
                  nav: 'absolute inset-x-0 top-0 flex items-center justify-between h-12 px-1 z-10',
                  button_previous: 'p-2 rounded-lg hover:bg-blossome-cream transition-colors inline-flex items-center justify-center',
                  button_next: 'p-2 rounded-lg hover:bg-blossome-cream transition-colors inline-flex items-center justify-center',
                  table: 'w-full border-collapse',
                  weekdays: 'grid grid-cols-7',
                  weekday: 'text-center text-sm font-semibold text-blossome-mid py-2',
                  week: 'grid grid-cols-7',
                  day: 'flex items-center justify-center py-1',
                  day_button: 'w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all hover:bg-blossome-gold-lt cursor-pointer',
                  selected:
                    'bg-blossome-gold text-white hover:bg-blossome-gold/90 rounded-lg font-bold',
                  today: 'font-bold text-blossome-gold ring-2 ring-blossome-gold/30 rounded-lg',
                  disabled: 'text-blossome-taupe/40 cursor-not-allowed hover:bg-transparent',
                  outside: 'text-blossome-taupe/25',
                  chevron: 'text-blossome-gold size-5',
                }}
              />
            )}
          </div>

          {/* ── Staff selector ────────────────────────────────── */}
          {staff.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-blossome-brown mb-3 block">
                <User className="inline h-4 w-4 mr-1.5" />
                Praticien(ne)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStaffChange(undefined)}
                  className={`rounded-lg px-4 py-2 text-sm transition-all ${
                    !selectedStaffId
                      ? 'bg-blossome-gold text-white'
                      : 'bg-blossome-cream text-blossome-mid hover:bg-blossome-gold-lt'
                  }`}
                >
                  Pas de préférence
                </button>
                {staff.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStaffChange(s.id)}
                    className={`rounded-lg px-4 py-2 text-sm transition-all inline-flex items-center gap-2 ${
                      selectedStaffId === s.id
                        ? 'bg-blossome-gold text-white'
                        : 'bg-blossome-cream text-blossome-mid hover:bg-blossome-gold-lt'
                    }`}
                  >
                    {s.avatar_url && (
                      <img
                        src={s.avatar_url}
                        alt={s.full_name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    {s.full_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Time slots grid ─────────────────────────────────── */}
        <div>
          {selectedDate ? (
            <>
              <p className="text-sm font-medium text-blossome-brown mb-3">
                <Clock className="inline h-4 w-4 mr-1.5" />
                Créneaux du{' '}
                <span className="text-blossome-gold">
                  {formatInTimeZone(selectedDate, TIMEZONE, 'EEEE d MMMM', {
                    locale: fr,
                  })}
                </span>
              </p>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected =
                      // Use the unique slot row id to avoid duplicates when multiple staff share the same time range.
                      selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => handleSlotSelect(slot)}
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                              ? 'bg-blossome-gold text-white ring-2 ring-blossome-gold/30'
                              : 'bg-blossome-cream text-blossome-mid hover:bg-blossome-gold-lt hover:text-blossome-brown'
                        }`}
                      >
                        {slot.timeString}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-blossome-mid py-8 text-center">
                  Aucun créneau disponible pour cette date.
                </p>
              )}

              {/* ── Selected summary ──────────────────────────────── */}
              {selectedSlot && (
                <div className="mt-4 rounded-lg bg-blossome-gold-lt/50 border border-blossome-gold/20 p-3">
                  <p className="text-sm text-blossome-brown">
                    <span className="font-medium">Votre créneau :</span>{' '}
                    {formatInTimeZone(selectedDate, TIMEZONE, 'EEEE d MMMM yyyy', {
                      locale: fr,
                    })}{' '}
                    de{' '}
                    <span className="font-bold text-blossome-gold">
                      {selectedSlot.timeString}
                    </span>{' '}
                    à{' '}
                    <span className="font-bold text-blossome-gold">
                      {selectedSlot.timeStringEnd}
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-blossome-mid text-center">
                ← Sélectionnez une date pour voir les créneaux disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
