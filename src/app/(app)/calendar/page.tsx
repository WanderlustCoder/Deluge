'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, ChevronLeft, ChevronRight, Gift, Clock, DollarSign } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ScheduleGiftModal } from '@/components/calendar/schedule-gift-modal';

interface ScheduledGift {
  id: string;
  scheduledDate: string;
  amount: number;
  status: string;
  customOccasion: string | null;
  recipientName: string | null;
  occasion: {
    name: string;
    iconName: string | null;
    color: string | null;
  } | null;
}

export default function GivingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledGifts, setScheduledGifts] = useState<ScheduledGift[]>([]);
  const [upcomingGifts, setUpcomingGifts] = useState<ScheduledGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const [calendarRes, upcomingRes] = await Promise.all([
        fetch(`/api/calendar?view=month&year=${year}&month=${month}`),
        fetch('/api/calendar?view=upcoming&days=30'),
      ]);

      if (calendarRes.ok) {
        const data = await calendarRes.json();
        // Flatten the calendar data
        const gifts: ScheduledGift[] = [];
        for (const day in data.calendar) {
          gifts.push(...data.calendar[day]);
        }
        setScheduledGifts(gifts);
      }

      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcomingGifts(data.gifts || []);
      }
    } catch (error) {
      console.error('Failed to load calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Pad start of month to align with weekday
  const startPadding = startOfMonth(currentDate).getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...daysInMonth];

  const getGiftsForDay = (date: Date | null) => {
    if (!date) return [];
    return scheduledGifts.filter((gift) =>
      isSameDay(new Date(gift.scheduledDate), date)
    );
  };

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-ocean dark:text-sky">
            Giving Calendar
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Plan and schedule your giving throughout the year
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 w-fit"
        >
          <Plus className="w-4 h-4" />
          Schedule Gift
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-dark-border/50 rounded-xl p-6"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 dark:hover:bg-foam/5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-storm-light dark:text-dark-text-secondary" />
            </button>
            <h2 className="text-xl font-semibold text-storm dark:text-dark-text">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 dark:hover:bg-foam/5 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-storm-light dark:text-dark-text-secondary" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-storm-light dark:text-dark-text-secondary py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((date, index) => {
              const gifts = getGiftsForDay(date);
              const hasGifts = gifts.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(date)}
                  disabled={!date}
                  className={`aspect-square p-1 rounded-lg transition-colors ${
                    !date
                      ? 'bg-transparent cursor-default'
                      : isToday(date)
                      ? 'bg-ocean/10 dark:bg-sky/10'
                      : 'hover:bg-gray-50 dark:hover:bg-foam/5'
                  } ${!isSameMonth(date || new Date(), currentDate) ? 'opacity-50' : ''}`}
                >
                  {date && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-sm ${
                          isToday(date)
                            ? 'font-bold text-ocean dark:text-sky'
                            : 'text-storm dark:text-dark-text'
                        }`}
                      >
                        {format(date, 'd')}
                      </span>
                      {hasGifts && (
                        <div className="flex gap-0.5 mt-1">
                          {gifts.slice(0, 3).map((gift, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-teal"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Gifts Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6">
            <h3 className="font-semibold text-storm dark:text-dark-text mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-ocean dark:text-sky" />
              Upcoming Gifts
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingGifts.length === 0 ? (
              <p className="text-sm text-storm-light dark:text-dark-text-secondary text-center py-4">
                No upcoming scheduled gifts
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-foam/5 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm text-storm dark:text-dark-text">
                        {gift.occasion?.name || gift.customOccasion || 'Scheduled Gift'}
                      </p>
                      <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                        {format(new Date(gift.scheduledDate), 'MMM d, yyyy')}
                        {gift.recipientName && ` • For ${gift.recipientName}`}
                      </p>
                    </div>
                    <span className="font-medium text-teal">
                      ${gift.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6">
            <h3 className="font-semibold text-storm dark:text-dark-text mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-ocean dark:text-sky" />
              This Month
            </h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal">
                $
                {scheduledGifts
                  .filter((g) => g.status === 'scheduled')
                  .reduce((sum, g) => sum + g.amount, 0)
                  .toFixed(2)}
              </p>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
                scheduled to give
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Schedule Modal */}
      <ScheduleGiftModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadCalendarData}
        preselectedDate={selectedDate}
      />
    </div>
  );
}
