import { BusStop } from '../types/transit';

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks if coordinates are within the geographical bounds of Singapore
 */
export function isInSingapore(lat: number, lng: number): boolean {
  return lat >= 1.15 && lat <= 1.48 && lng >= 103.58 && lng <= 104.08;
}

/**
 * Finds the nearest bus stop to the given coordinates
 */
export function findNearestBusStop(
  userLat: number,
  userLng: number,
  stops: BusStop[]
): { stop: BusStop; distanceMeters: number; walkMinutes: number } | null {
  const stopsWithCoords = stops.filter((s) => s.lat !== undefined && s.lng !== undefined);
  if (stopsWithCoords.length === 0) return null;

  let closestStop = stopsWithCoords[0];
  let minDistance = calculateDistanceMeters(
    userLat,
    userLng,
    closestStop.lat!,
    closestStop.lng!
  );

  for (let i = 1; i < stopsWithCoords.length; i++) {
    const s = stopsWithCoords[i];
    const d = calculateDistanceMeters(userLat, userLng, s.lat!, s.lng!);
    if (d < minDistance) {
      minDistance = d;
      closestStop = s;
    }
  }

  // Average walking speed ~75m per minute (~4.5 km/h)
  const walkMinutes = Math.max(1, Math.round(minDistance / 75));

  return {
    stop: closestStop,
    distanceMeters: minDistance,
    walkMinutes,
  };
}

/**
 * Formats distance in meters into human-readable string
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters}m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}
