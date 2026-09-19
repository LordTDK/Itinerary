import Papa from 'papaparse';
import { ActivityCategory, DaySchedule, ItineraryData, ItineraryItem } from '../types';
import { formatFriendlyDate, formatShortDate, parseFlexibleDate } from './dateUtils';

interface RawRow {
  [key: string]: string | undefined;
}

const CATEGORY_MAP: Record<string, ActivityCategory> = {
  flight: 'Flight',
  plane: 'Flight',
  airport: 'Flight',
  airline: 'Flight',
  train: 'Transport',
  transport: 'Transport',
  drive: 'Transport',
  bus: 'Transport',
  ferry: 'Transport',
  transit: 'Transport',
  hotel: 'Hotel',
  accommodation: 'Hotel',
  stay: 'Hotel',
  lodging: 'Hotel',
  checkin: 'Hotel',
  'check-in': 'Hotel',
  resort: 'Hotel',
  sightseeing: 'Sightseeing',
  tour: 'Sightseeing',
  museum: 'Sightseeing',
  temple: 'Sightseeing',
  landmark: 'Sightseeing',
  viewpoint: 'Sightseeing',
  monument: 'Sightseeing',
  food: 'Food',
  dinner: 'Food',
  lunch: 'Food',
  breakfast: 'Food',
  dining: 'Food',
  restaurant: 'Food',
  cafe: 'Food',
  drinks: 'Food',
  bar: 'Food',
  activity: 'Activity',
  hiking: 'Activity',
  walk: 'Activity',
  beach: 'Leisure',
  leisure: 'Leisure',
  shopping: 'Leisure',
  relax: 'Leisure',
  spa: 'Leisure',
};

function inferCategory(categoryText?: string, activityText?: string): ActivityCategory {
  const combined = `${categoryText || ''} ${activityText || ''}`.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (combined.includes(key)) {
      return val;
    }
  }
  return 'Activity';
}

function findColumnValue(row: RawRow, candidates: string[]): string {
  const lowerKeys = Object.keys(row).map(k => ({
    orig: k,
    clean: k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  }));

  for (const cand of candidates) {
    const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = lowerKeys.find(k => k.clean === cleanCand || k.clean.includes(cleanCand));
    if (found && row[found.orig] !== undefined) {
      return String(row[found.orig]).trim();
    }
  }
  return '';
}

export function parseItineraryCSV(csvContent: string, tripTitle = 'My Holiday Itinerary'): ItineraryData {
  const parsed = Papa.parse<RawRow>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  const rawRows = parsed.data;
  const items: ItineraryItem[] = [];

  let rowIdx = 0;
  for (const row of rawRows) {
    rowIdx++;
    const rawDate = findColumnValue(row, ['date', 'startdate', 'daydate', 'when', 'day']);
    const parsedDate = parseFlexibleDate(rawDate);

    if (!parsedDate) {
      continue; // Skip rows without identifiable dates
    }

    // Specific spreadsheet columns: From & To
    const fromVal = findColumnValue(row, ['from', 'origin', 'departurefrom', 'source']);
    const toVal = findColumnValue(row, ['to', 'destination', 'place', 'target']);

    // Standard location & activity fallbacks
    const generalLocation = findColumnValue(row, ['location', 'city', 'venue', 'stop']);
    const generalActivity = findColumnValue(row, ['activity', 'event', 'title', 'summary', 'description', 'what', 'plan', 'item']);

    const location = toVal || generalLocation || 'Destination Stop';
    const activity = toVal ? toVal : (generalActivity || location);

    // Timings
    const departure = findColumnValue(row, ['departure', 'departuretime', 'deptime', 'dep', 'fromtime']);
    const arrival = findColumnValue(row, ['arrival', 'arrivaltime', 'arrtime', 'arr', 'totime']);
    const timeGeneric = findColumnValue(row, ['time', 'starttime', 'timing', 'hours', 'schedule', 'when']);
    
    let combinedTime = timeGeneric;
    if (departure && arrival) {
      combinedTime = `${departure} - ${arrival}`;
    } else if (departure) {
      combinedTime = departure;
    } else if (arrival) {
      combinedTime = arrival;
    }

    // Travel & Stay durations
    const duration = findColumnValue(row, ['duration', 'traveltime', 'transit', 'drive']);
    const stayDuration = findColumnValue(row, ['stayduration', 'stay', 'stopduration', 'durationofstay']);

    // Coordinates
    const fromLongStr = findColumnValue(row, ['fromlong', 'fromlongitude', 'fromlng', 'originlong', 'originlng']);
    const fromLatStr = findColumnValue(row, ['fromlat', 'fromlatitude', 'originlat']);
    const toLongStr = findColumnValue(row, ['tolong', 'tolongitude', 'tolng', 'destlong', 'destlng', 'destinationlong']);
    const toLatStr = findColumnValue(row, ['tolat', 'tolatitude', 'destlat', 'destinationlat']);

    const fromLong = fromLongStr && !isNaN(parseFloat(fromLongStr)) ? parseFloat(fromLongStr) : undefined;
    const fromLat = fromLatStr && !isNaN(parseFloat(fromLatStr)) ? parseFloat(fromLatStr) : undefined;
    const toLong = toLongStr && !isNaN(parseFloat(toLongStr)) ? parseFloat(toLongStr) : undefined;
    const toLat = toLatStr && !isNaN(parseFloat(toLatStr)) ? parseFloat(toLatStr) : undefined;

    // Category, Accommodation & Notes
    const categoryRaw = findColumnValue(row, ['category', 'type', 'kind', 'tag']);
    const hotel = findColumnValue(row, ['hotel', 'accommodation', 'stay', 'lodging', 'resort']);
    const notes = findColumnValue(row, ['notes', 'details', 'tip', 'tips', 'booking', 'bookingref', 'confirmation', 'reference', 'ref']);
    const cost = findColumnValue(row, ['costs', 'cost', 'price', 'amount', 'budget']);

    // Extract city from location if possible (e.g. "Castle Combe" or "Poole")
    const city = location.split(/[,/•-]/)[0]?.trim() || location;

    items.push({
      id: `item-${rowIdx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: parsedDate,
      rawDate,
      from: fromVal || undefined,
      to: toVal || location,
      departureTime: departure || undefined,
      arrivalTime: arrival || undefined,
      time: combinedTime || undefined,
      duration: duration || undefined,
      stayDuration: stayDuration || undefined,
      costs: cost || undefined,
      cost: cost || undefined,
      fromLong,
      fromLat,
      toLong,
      toLat,
      location,
      city,
      activity,
      category: inferCategory(categoryRaw || (fromVal && toVal ? 'Transport' : undefined), activity),
      hotel: hotel || undefined,
      notes: notes || undefined,
      completed: false,
    });
  }

  // Sort items chronologically by date and departure/start time
  items.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    const timeA = a.departureTime || a.time || '';
    const timeB = b.departureTime || b.time || '';
    return timeA.localeCompare(timeB);
  });

  return buildItineraryData(items, tripTitle);
}

export function buildItineraryData(items: ItineraryItem[], title = 'My Holiday Itinerary', activeDateOverride?: string): ItineraryData {
  if (items.length === 0) {
    return {
      title,
      destinationSummary: 'No destinations loaded',
      startDate: '',
      endDate: '',
      totalDays: 0,
      items: [],
      days: [],
      cities: [],
    };
  }

  // Group items by date
  const dateMap = new Map<string, ItineraryItem[]>();
  for (const item of items) {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, []);
    }
    dateMap.get(item.date)!.push(item);
  }

  // Sorted dates
  const sortedDates = Array.from(dateMap.keys()).sort();
  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  const citySet = new Set<string>();
  const days: DaySchedule[] = [];

  sortedDates.forEach((dateStr, index) => {
    const dayItems = dateMap.get(dateStr) || [];
    const locations: string[] = [];
    let dayHotel: string | undefined = undefined;

    // Requirement: "do not mark off the final destinatiosn for each day as this will be our accommodation"
    // Mark the final destination of each day as accommodation that cannot be checked off
    if (dayItems.length > 0) {
      const lastItem = dayItems[dayItems.length - 1];
      lastItem.isFinalDestinationOfDay = true;
      if (lastItem.to) {
        lastItem.hotel = lastItem.to;
        dayHotel = lastItem.to;
      }
    }

    dayItems.forEach(it => {
      if (it.city && !citySet.has(it.city)) {
        citySet.add(it.city);
      }
      if (it.from && !citySet.has(it.from)) {
        citySet.add(it.from);
      }
      if (it.to && !citySet.has(it.to)) {
        citySet.add(it.to);
      }
      if (it.location && !locations.includes(it.location)) {
        locations.push(it.location);
      }
      if (it.hotel && !dayHotel) {
        dayHotel = it.hotel;
      }
    });

    const primaryLocation = locations[0] || (dayItems[0]?.city) || 'Destination';

    days.push({
      date: dateStr,
      formattedDate: formatFriendlyDate(dateStr),
      shortDate: formatShortDate(dateStr),
      dayNumber: index + 1,
      isToday: false, // Calculated dynamically against comparison date
      isPast: false,
      isFuture: false,
      locations,
      primaryLocation,
      hotel: dayHotel,
      items: dayItems,
    });
  });

  const cities = Array.from(citySet);
  const destinationSummary = cities.length > 0 
    ? cities.slice(0, 4).join(' → ') + (cities.length > 4 ? ` (+${cities.length - 4} more)` : '')
    : 'Multiple Locations';

  return {
    title,
    destinationSummary,
    startDate,
    endDate,
    totalDays: days.length,
    items,
    days,
    cities,
  };
}

export function exportToCSV(itinerary: ItineraryData): string {
  // Export using the user's comprehensive spreadsheet format
  const rows = itinerary.items.map(item => ({
    From: item.from || '',
    To: item.to || item.location,
    Date: item.rawDate || item.date,
    Departure: item.departureTime || '',
    Arrival: item.arrivalTime || '',
    Duration: item.duration || '',
    Notes: item.notes || '',
    'STAY DURATION': item.stayDuration || '',
    Costs: item.costs || item.cost || '',
    FromLong: item.fromLong !== undefined ? item.fromLong : '',
    FromLat: item.fromLat !== undefined ? item.fromLat : '',
    ToLong: item.toLong !== undefined ? item.toLong : '',
    ToLat: item.toLat !== undefined ? item.toLat : '',
  }));

  return Papa.unparse(rows);
}

export const SAMPLE_CSV_TEMPLATE = `From,To,Date,Departure,Arrival,Duration,Notes,STAY DURATION,Costs,FromLong,FromLat,ToLong,ToLat
Poole,Castle Combe,20/09/2026,07:00,09:00,02:00:00,SN14 7HH,02:00:00,£ 0.80,-1.987000,50.715000,-2.224300,51.495200
Castle Combe,Broadway,20/09/2026,11:00,12:30,01:30:00,Lunch @ Broadway,02:00:00,,-2.224300,51.495200,-1.860000,52.040000
Broadway,Stow-on-the-Wold,20/09/2026,14:30,15:00,00:30:00,Tesco's for supper,01:00:00,,-1.860000,52.040000,-1.723820,51.930080
Stow-on-the-Wold,Hawkstone Brewery,20/09/2026,16:00,16:15,00:15:00,Brewery shop,01:00:00,,-1.723820,51.930080,-1.763002,51.893929
Hawkstone Brewery,Priors Road,20/09/2026,17:15,17:45,00:30:00,Accommodation,N/A,,-1.763002,51.893929,-2.049962,51.904992
Priors Road,Bibury,21/09/2026,07:15,08:00,00:45:00,Arlington Row,01:00:00,,-2.049962,51.904992,-1.832400,51.758200
Bibury,Bourton-on-the-water,21/09/2026,09:00,09:30,00:30:00,,03:00:00,,-1.832400,51.758200,-1.750000,51.866700
Bourton-on-the-water,Stow-on-the-Wold,21/09/2026,12:30,12:45,00:15:00,"Doors of Durin, Porch House, Tures",04:00:00,,-1.750000,51.866700,-1.723820,51.930080
Stow-on-the-Wold,Priors Road,21/09/2026,16:45,17:15,00:30:00,,N/A,,-1.723820,51.930080,-2.049962,51.904992
`;
