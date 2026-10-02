import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '../types/transit';
import { NEARBY_STOPS } from '../data/transitData';
import { findNearestBusStop, isInSingapore } from '../utils/geo';

// Default Singapore fallback coordinates (Bishan St 22, Opp Blk 245)
export const DEFAULT_SINGAPORE_LOCATION = {
  latitude: 1.35824,
  longitude: 103.84928,
  accuracy: 15,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLiveGPS, setIsLiveGPS] = useState<boolean>(false);

  const processCoordinates = useCallback(
    (lat: number, lng: number, accuracy: number, isReal = true) => {
      const inSg = isInSingapore(lat, lng);
      const nearest = findNearestBusStop(lat, lng, NEARBY_STOPS);

      const userLoc: UserLocation = {
        latitude: lat,
        longitude: lng,
        accuracy,
        timestamp: Date.now(),
        nearestStopCode: nearest?.stop.code,
        nearestStopName: nearest?.stop.name,
        distanceToNearestStopMeters: nearest?.distanceMeters,
        isSimulated: !isReal,
        inSingapore: inSg,
      };

      setLocation(userLoc);
      setIsLiveGPS(isReal);
      setIsLocating(false);
      setErrorMessage(null);
    },
    []
  );

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      processCoordinates(
        DEFAULT_SINGAPORE_LOCATION.latitude,
        DEFAULT_SINGAPORE_LOCATION.longitude,
        DEFAULT_SINGAPORE_LOCATION.accuracy,
        false
      );
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionState('granted');
        processCoordinates(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy,
          true
        );
      },
      (err) => {
        setIsLocating(false);
        setPermissionState('denied');
        let msg = 'Could not acquire GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Showing Bishan St 22 simulated transit corridor.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable. Falling back to default corridor.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Retrying with fallback.';
        }
        setErrorMessage(msg);

        // Fallback to default Singapore location
        processCoordinates(
          DEFAULT_SINGAPORE_LOCATION.latitude,
          DEFAULT_SINGAPORE_LOCATION.longitude,
          DEFAULT_SINGAPORE_LOCATION.accuracy,
          false
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  }, [processCoordinates]);

  // Automatically start location request on mount and watch position
  useEffect(() => {
    let watchId: number | null = null;

    if (navigator.geolocation) {
      // First try to check permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then((result) => {
            setPermissionState(result.state);
            result.onchange = () => {
              setPermissionState(result.state);
            };
          })
          .catch(() => {
            // ignore
          });
      }

      requestCurrentLocation();

      // Start background watcher for continuous live transit updates
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          processCoordinates(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
            true
          );
        },
        () => {
          // ignore watcher errors to prevent alert spam
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
        }
      );
    } else {
      processCoordinates(
        DEFAULT_SINGAPORE_LOCATION.latitude,
        DEFAULT_SINGAPORE_LOCATION.longitude,
        DEFAULT_SINGAPORE_LOCATION.accuracy,
        false
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requestCurrentLocation, processCoordinates]);

  return {
    location,
    isLocating,
    isLiveGPS,
    permissionState,
    errorMessage,
    requestCurrentLocation,
  };
}
