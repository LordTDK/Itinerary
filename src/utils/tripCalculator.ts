import { DaySchedule, ItineraryData, ItineraryItem, TripStatus } from '../types';
import { daysBetween, formatFriendlyDate, formatShortDate } from './dateUtils';

export function calculateTripStatus(itinerary: ItineraryData, activeDate: string): TripStatus {
  if (!itinerary || itinerary.days.length === 0) {
    return { phase: 'upcoming' };
  }

  const { startDate, endDate, days } = itinerary;

  // Comparison to start and end
  const diffToStart = daysBetween(activeDate, startDate);
  const diffToEnd = daysBetween(activeDate, endDate);

  // Mark each day's status relative to activeDate
  days.forEach((d) => {
    const diff = daysBetween(activeDate, d.date);
    d.isToday = diff === 0;
    d.isPast = diff > 0;
    d.isFuture = diff < 0;
  });

  if (diffToStart > 0) {
    // Reference date is BEFORE trip starts
    return {
      phase: 'upcoming',
      daysUntilTrip: diffToStart,
      todaySchedule: undefined,
      currentLocation: days[0]?.primaryLocation || 'Starting Point',
      currentHotel: days[0]?.hotel,
      nextItem: days[0]?.items[0],
    };
  }

  if (diffToEnd < 0) {
    // Reference date is AFTER trip completed
    return {
      phase: 'completed',
      daysCompleted: itinerary.totalDays,
      todaySchedule: undefined,
      currentLocation: days[days.length - 1]?.primaryLocation,
      currentHotel: undefined,
    };
  }

  // ACTIVE TRIP! Active date is on or between startDate and endDate
  const todayDay = days.find((d) => d.date === activeDate);
  const dayIndex = days.findIndex((d) => d.date === activeDate);
  const currentDayNumber = dayIndex !== -1 ? dayIndex + 1 : 1;

  // If today is a travel or free day without specific entries, fall back to nearest prior or next day
  const effectiveDay = todayDay || days[Math.max(0, Math.min(days.length - 1, dayIndex))];

  // Find next upcoming item for today
  let nextItem: ItineraryItem | undefined = undefined;
  if (todayDay && todayDay.items.length > 0) {
    // First uncompleted item or first item
    nextItem = todayDay.items.find(i => !i.completed) || todayDay.items[0];
  } else if (dayIndex + 1 < days.length) {
    nextItem = days[dayIndex + 1]?.items[0];
  }

  return {
    phase: 'active',
    currentDayNumber,
    todaySchedule: todayDay,
    currentLocation: effectiveDay?.primaryLocation || effectiveDay?.locations[0] || 'Destination',
    currentHotel: effectiveDay?.hotel,
    nextItem,
  };
}
