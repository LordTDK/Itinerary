import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '../utils/geoUtils';

export interface GeolocationState {
  coords: Coordinates | null;
  status: 'idle' | 'locating' | 'located' | 'error' | 'simulated';
  errorMessage: string | null;
  locationName: string | null;
  isSimulated: boolean;
  detectLocation: () => void;
  setSimulatedLocation: (lat: number, long: number, name: string) => void;
  clearLocation: () => void;
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'located' | 'error' | 'simulated'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('locating');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus('located');
        setLocationName('Live Device GPS');
        setIsSimulated(false);
      },
      (error) => {
        setStatus('error');
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still select your location manually or simulate GPS.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setErrorMessage(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const setSimulatedLocation = useCallback((lat: number, long: number, name: string) => {
    setCoords({
      latitude: lat,
      longitude: long,
      accuracy: 10,
    });
    setStatus('simulated');
    setLocationName(name);
    setIsSimulated(true);
    setErrorMessage(null);
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setStatus('idle');
    setLocationName(null);
    setIsSimulated(false);
    setErrorMessage(null);
  }, []);

  return {
    coords,
    status,
    errorMessage,
    locationName,
    isSimulated,
    detectLocation,
    setSimulatedLocation,
    clearLocation,
  };
}
