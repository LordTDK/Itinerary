import { ItineraryData, SavedTrip } from '../types';
import { parseItineraryCSV, buildItineraryData } from './csvParser';

const SAVED_TRIPS_STORAGE_KEY = 'holiday_app_saved_trips_v1';
const ACTIVE_TRIP_ID_KEY = 'holiday_app_active_trip_id_v1';

export const COTSWOLDS_INITIAL_CSV = `From,To,Date,Departure,Arrival,Duration,Notes,STAY DURATION,Costs,FromLong,FromLat,ToLong,ToLat
Poole,Castle Combe,20/09/2026,07:00,09:00,02:00:00,SN14 7HH,02:00:00,£ 0.80,-1.987000,50.715000,-2.224300,51.495200
Castle Combe,Broadway,20/09/2026,11:00,12:30,01:30:00,Lunch @ Broadway,02:00:00,,-2.224300,51.495200,-1.860000,52.040000
Broadway,Stow-on-the-Wold,20/09/2026,14:30,15:00,00:30:00,Tesco's for supper,01:00:00,,-1.860000,52.040000,-1.723820,51.930080
Stow-on-the-Wold,Hawkstone Brewery,20/09/2026,16:00,16:15,00:15:00,Brewery shop,01:00:00,,-1.723820,51.930080,-1.763002,51.893929
Hawkstone Brewery,Priors Road,20/09/2026,17:15,17:45,00:30:00,Accommodation,N/A,,-1.763002,51.893929,-2.049962,51.904992
Priors Road,Bibury,21/09/2026,07:15,08:00,00:45:00,Arlington Row,01:00:00,,-2.049962,51.904992,-1.832400,51.758200
Bibury,Bourton-on-the-water,21/09/2026,09:00,09:30,00:30:00,,03:00:00,,-1.832400,51.758200,-1.750000,51.866700
Bourton-on-the-water,Stow-on-the-Wold,21/09/2026,12:30,12:45,00:15:00,"Doors of Durin, Porch House, Tures",04:00:00,,-1.750000,51.866700,-1.723820,51.930080
Stow-on-the-Wold,Priors Road,21/09/2026,16:45,17:15,00:30:00,,N/A,,-1.723820,51.930080,-2.049962,51.904992
Priors Road,Burford,22/09/2026,08:00,08:30,00:30:00,Burford high street,01:30:00,,-2.049962,51.904992,-1.636600,51.807800
Burford,Minster Lovell,22/09/2026,10:00,10:15,00:15:00,Minster lovell ruins,01:00:00,,-1.636600,51.807800,-1.536700,51.798300
Minster Lovell,Witney,22/09/2026,11:15,11:30,00:15:00,Witney wool mill/shop,01:30:00,,-1.536700,51.798300,-1.485400,51.785800
Witney,Woodstock,22/09/2026,13:00,13:30,00:30:00,Lunch @ woodstock / Blenheim palace walk,02:00:00,,-1.485400,51.785800,-1.353300,51.848300
Woodstock,43 Valence Cres,22/09/2026,15:30,16:00,00:30:00,Accommodation,N/A,,-1.353300,51.848300,-1.238400,51.776500
43 Valence Cres,Salisbury,23/09/2026,08:30,10:15,01:45:00,Salisbury Cathedral & historic market,02:30:00,,-1.238400,51.776500,-1.795000,51.069000
Salisbury,Poole,23/09/2026,12:45,14:00,01:15:00,Return journey home,N/A,,-1.795000,51.069000,-1.987000,50.715000
`;

/**
 * Reconstitutes ItineraryData from saved item list if needed
 */
function restoreItinerary(data: any): ItineraryData {
  if (data && Array.isArray(data.items) && data.items.length > 0) {
    return buildItineraryData(data.items, data.title || 'Holiday Itinerary');
  }
  return parseItineraryCSV(COTSWOLDS_INITIAL_CSV, 'Cotswolds Holiday Tour');
}

/**
 * Initializes and retrieves all saved trips from localStorage
 */
export function getSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          data: restoreItinerary(item.data)
        }));
      }
    }
  } catch (err) {
    console.error('Failed to read saved trips from localStorage', err);
  }

  // If no saved trips exist yet, create the default Cotswolds trip as the first saved trip
  const initialItinerary = parseItineraryCSV(COTSWOLDS_INITIAL_CSV, 'Cotswolds Holiday Tour');
  const defaultTrip: SavedTrip = {
    id: 'trip_cotswolds_' + Date.now(),
    title: initialItinerary.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: initialItinerary.items.length,
    startDate: initialItinerary.startDate,
    endDate: initialItinerary.endDate,
    destinationSummary: initialItinerary.destinationSummary,
    data: initialItinerary,
  };

  const initialList = [defaultTrip];
  try {
    localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(initialList));
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, defaultTrip.id);
  } catch {
    // ignore
  }

  return initialList;
}

/**
 * Saves a new trip or updates an existing trip in localStorage
 */
export function saveTrip(itineraryData: ItineraryData, existingId?: string): { trip: SavedTrip; trips: SavedTrip[] } {
  const currentTrips = getSavedTrips();
  const now = new Date().toISOString();

  const id = existingId || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const savedTrip: SavedTrip = {
    id,
    title: itineraryData.title || 'Holiday Itinerary',
    createdAt: now,
    updatedAt: now,
    itemCount: itineraryData.items.length,
    startDate: itineraryData.startDate,
    endDate: itineraryData.endDate,
    destinationSummary: itineraryData.destinationSummary,
    data: itineraryData,
  };

  const index = currentTrips.findIndex(t => t.id === id);
  let updatedList: SavedTrip[];

  if (index >= 0) {
    savedTrip.createdAt = currentTrips[index].createdAt;
    updatedList = [...currentTrips];
    updatedList[index] = savedTrip;
  } else {
    // Place newly saved/uploaded trip at the top
    updatedList = [savedTrip, ...currentTrips];
  }

  try {
    localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save trip to localStorage', err);
  }

  return { trip: savedTrip, trips: updatedList };
}

/**
 * Updates the itinerary items/state (e.g. check-offs) for a specific trip
 */
export function updateActiveTripData(tripId: string, itineraryData: ItineraryData): void {
  try {
    const currentTrips = getSavedTrips();
    const index = currentTrips.findIndex(t => t.id === tripId);
    if (index >= 0) {
      currentTrips[index].data = itineraryData;
      currentTrips[index].itemCount = itineraryData.items.length;
      currentTrips[index].startDate = itineraryData.startDate;
      currentTrips[index].endDate = itineraryData.endDate;
      currentTrips[index].destinationSummary = itineraryData.destinationSummary;
      currentTrips[index].updatedAt = new Date().toISOString();
      localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(currentTrips));
    }
  } catch (err) {
    console.error('Failed to update active trip data', err);
  }
}

/**
 * Deletes a trip by ID from localStorage
 */
export function deleteTrip(tripId: string): SavedTrip[] {
  try {
    const currentTrips = getSavedTrips();
    const filtered = currentTrips.filter(t => t.id !== tripId);
    localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(filtered));
    
    // If deleted trip was active, update active ID
    const activeId = getActiveTripId();
    if (activeId === tripId) {
      if (filtered.length > 0) {
        setActiveTripId(filtered[0].id);
      } else {
        localStorage.removeItem(ACTIVE_TRIP_ID_KEY);
      }
    }
    return filtered;
  } catch (err) {
    console.error('Failed to delete trip', err);
    return [];
  }
}

/**
 * Returns currently active trip ID
 */
export function getActiveTripId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TRIP_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets active trip ID in localStorage
 */
export function setActiveTripId(tripId: string): void {
  try {
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, tripId);
  } catch {
    // ignore
  }
}
