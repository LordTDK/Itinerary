export type ActivityCategory = 
  | 'Transport' 
  | 'Flight' 
  | 'Hotel' 
  | 'Sightseeing' 
  | 'Food' 
  | 'Activity' 
  | 'Leisure' 
  | 'Other';

export interface ItineraryItem {
  id: string;
  date: string; // Normalized YYYY-MM-DD
  rawDate: string; // Original text in CSV
  from?: string; // Origin e.g. "Poole"
  to?: string; // Destination e.g. "Castle Combe"
  departureTime?: string; // e.g. "07:00"
  arrivalTime?: string; // e.g. "09:00"
  duration?: string; // e.g. "02:00:00"
  stayDuration?: string; // e.g. "02:00:00" or "N/A"
  costs?: string; // e.g. "£ 0.80"
  fromLong?: number;
  fromLat?: number;
  toLong?: number;
  toLat?: number;
  isFinalDestinationOfDay?: boolean; // Accommodation at the end of day - cannot be marked off!
  time?: string; // Combined display time e.g. "07:00 - 09:00"
  location: string; // Destination location e.g. "Castle Combe"
  city?: string; // Primary city
  activity: string; // Display title e.g. "Castle Combe"
  category: ActivityCategory;
  hotel?: string; // Overnight accommodation
  notes?: string;
  bookingRef?: string;
  cost?: string;
  completed?: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Friday, 18 Sep 2026"
  shortDate: string; // e.g. "Fri, Sep 18"
  dayNumber: number; // 1-indexed (Day 1, Day 2)
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  locations: string[];
  primaryLocation: string;
  hotel?: string;
  items: ItineraryItem[];
}

export interface ItineraryData {
  title: string;
  destinationSummary: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  items: ItineraryItem[];
  days: DaySchedule[];
  cities: string[];
}

export type MobileTab = 'today' | 'schedule' | 'route' | 'hub';

export interface TripStatus {
  phase: 'upcoming' | 'active' | 'completed';
  currentDayNumber?: number;
  daysUntilTrip?: number;
  daysCompleted?: number;
  todaySchedule?: DaySchedule;
  nextItem?: ItineraryItem;
  currentLocation?: string;
  currentHotel?: string;
}

export interface SavedTrip {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  startDate: string;
  endDate: string;
  destinationSummary: string;
  data: ItineraryData;
}

