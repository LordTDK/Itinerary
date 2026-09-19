/**
 * Geolocation and Haversine distance calculation utilities
 * Matches traveler's current GPS position to itinerary starting points
 * and generates navigation routing.
 */

import { ItineraryItem } from '../types';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MatchedStartingPoint {
  item: ItineraryItem;
  fromName: string;
  toName: string;
  distanceMeters: number;
  isExactStart: boolean; // within 2km of leg origin
  navigationUrl: string;
}

/**
 * Calculates great-circle distance between two points in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Build universal Google Maps navigation URL
 */
export function buildNavigationUrl(
  destLat?: number,
  destLong?: number,
  destName?: string,
  userCoords?: Coordinates | null,
  fromLat?: number,
  fromLong?: number
): string {
  const travelMode = 'driving';
  
  if (destLat !== undefined && destLong !== undefined) {
    const destination = `${destLat},${destLong}`;
    let originParam = '';
    
    if (userCoords) {
      originParam = `&origin=${userCoords.latitude},${userCoords.longitude}`;
    } else if (fromLat !== undefined && fromLong !== undefined) {
      originParam = `&origin=${fromLat},${fromLong}`;
    }
    
    return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination}&travelmode=${travelMode}`;
  }

  // Fallback to name search
  const encodedDest = encodeURIComponent(destName || 'Destination');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&travelmode=${travelMode}`;
}

/**
 * Identifies if user is at or near any starting point of the day's itinerary items
 * Threshold default: 2500 meters (2.5 km) for starting point detection
 */
export function findMatchingStartingPoint(
  userCoords: Coordinates,
  dayItems: ItineraryItem[],
  thresholdMeters = 3000
): MatchedStartingPoint | null {
  if (!userCoords || !dayItems || dayItems.length === 0) return null;

  // Filter items that have coordinates
  const itemsWithCoords = dayItems.filter(
    item => (item.fromLat !== undefined && item.fromLong !== undefined) ||
            (item.toLat !== undefined && item.toLong !== undefined)
  );

  if (itemsWithCoords.length === 0) return null;

  // 1. Check for leg whose FROM matches user's location
  let bestFromMatch: { item: ItineraryItem; distance: number } | null = null;

  for (const item of itemsWithCoords) {
    if (item.fromLat !== undefined && item.fromLong !== undefined) {
      const dist = calculateDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        item.fromLat,
        item.fromLong
      );

      if (dist <= thresholdMeters) {
        if (!bestFromMatch || dist < bestFromMatch.distance) {
          bestFromMatch = { item, distance: dist };
        }
      }
    }
  }

  if (bestFromMatch) {
    const { item, distance } = bestFromMatch;
    return {
      item,
      fromName: item.from || item.location,
      toName: item.to || item.activity,
      distanceMeters: distance,
      isExactStart: true,
      navigationUrl: buildNavigationUrl(
        item.toLat,
        item.toLong,
        item.to,
        userCoords,
        item.fromLat,
        item.fromLong
      ),
    };
  }

  // 2. If user is at the destination of a previous completed stop, that is the starting point for the next stop!
  // Find nearest starting point overall among uncompleted items
  const uncompletedItems = itemsWithCoords.filter(i => !i.completed);
  const targetPool = uncompletedItems.length > 0 ? uncompletedItems : itemsWithCoords;

  let nearestItem: { item: ItineraryItem; distance: number } | null = null;
  for (const item of targetPool) {
    if (item.fromLat !== undefined && item.fromLong !== undefined) {
      const dist = calculateDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        item.fromLat,
        item.fromLong
      );
      if (!nearestItem || dist < nearestItem.distance) {
        nearestItem = { item, distance: dist };
      }
    }
  }

  if (nearestItem) {
    const { item, distance } = nearestItem;
    return {
      item,
      fromName: item.from || item.location,
      toName: item.to || item.activity,
      distanceMeters: distance,
      isExactStart: distance <= thresholdMeters,
      navigationUrl: buildNavigationUrl(
        item.toLat,
        item.toLong,
        item.to,
        userCoords,
        item.fromLat,
        item.fromLong
      ),
    };
  }

  return null;
}

// Preset GPS coordinates from the user's Cotswolds spreadsheet for instant testing/simulation
export const COTSWOLDS_PRESET_LOCATIONS = [
  { name: 'Poole (Trip Start)', lat: 50.715000, long: -1.987000, day: 1 },
  { name: 'Castle Combe', lat: 51.495200, long: -2.224300, day: 1 },
  { name: 'Broadway', lat: 52.040000, long: -1.860000, day: 1 },
  { name: 'Stow-on-the-Wold', lat: 51.930080, long: -1.723820, day: 1 },
  { name: 'Hawkstone Brewery', lat: 51.893929, long: -1.763002, day: 1 },
  { name: 'Priors Road (Accommodation)', lat: 51.904992, long: -2.049962, day: 1 },
  { name: 'Bibury (Arlington Row)', lat: 51.758200, long: -1.832400, day: 2 },
  { name: 'Bourton-on-the-Water', lat: 51.866700, long: -1.750000, day: 2 },
  { name: 'Rollright Stones', lat: 51.975727, long: -1.570654, day: 3 },
  { name: 'Diddly Squat Farm Shop', lat: 51.916245, long: -1.541525, day: 3 },
  { name: '43 Valence Cres (Accommodation)', lat: 51.788187, long: -1.508998, day: 3 },
  { name: "The Farmer's Dog", lat: 51.789616, long: -1.584047, day: 3 },
  { name: 'Designer Outlet Swindon', lat: 51.562450, long: -1.798120, day: 4 },
  { name: 'Salisbury', lat: 51.069000, long: -1.795000, day: 4 },
  { name: 'The Royal Oak', lat: 51.043324, long: -2.051619, day: 4 },
];
