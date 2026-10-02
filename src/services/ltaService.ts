import { BusArrivalInfo, CrowdLevel, DeckType } from '../types/transit';
import { BUS_DATABASE } from '../data/transitData';

export interface LtaRawBus {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Monitored?: number;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string;
  Feature?: 'WAB' | string;
  Type?: 'SD' | 'DD' | 'BD' | string;
  etaMinutes?: number;
  etaSeconds?: number;
  etaText?: string;
  isArriving?: boolean;
  crowd?: CrowdLevel;
  crowdLabel?: string;
  deckType?: DeckType;
  isWAB?: boolean;
}

export interface LtaServiceItem {
  ServiceNo: string;
  Operator: string;
  NextBus?: LtaRawBus;
  NextBus2?: LtaRawBus;
  NextBus3?: LtaRawBus;
  parsedArrivals?: LtaRawBus[];
}

export interface LtaArrivalResponse {
  success?: boolean;
  liveData?: boolean;
  source?: 'lta_datamall_live' | 'simulated_fallback';
  note?: string;
  BusStopCode?: string;
  Services?: LtaServiceItem[];
  enrichedServices?: LtaServiceItem[];
  timestamp?: string;
  error?: boolean;
  message?: string;
}

export const LTA_KEY_STORAGE = 'buslah_lta_account_key';

export function getStoredLtaKey(): string {
  try {
    return localStorage.getItem(LTA_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveStoredLtaKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(LTA_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(LTA_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

// Convert LTA API service item to frontend BusArrivalInfo model
export function transformLtaServiceToBusInfo(
  service: LtaServiceItem,
  busNumber: string
): BusArrivalInfo {
  const fallback = BUS_DATABASE[busNumber] || {
    busNumber,
    destination: `Towards Destination (${service.NextBus?.DestinationCode || 'Terminal'})`,
    origin: `Origin (${service.NextBus?.OriginCode || 'Depot'})`,
    operator: 'SBS Transit',
    viaRoute: 'Direct LTA Telemetry Service Route',
    speedKmh: 35,
    direction: 1 as const,
    arrivals: [
      {
        etaMinutes: 2,
        etaSeconds: 30,
        crowd: 'seats' as const,
        crowdText: 'Seats Steady',
        subtitle: 'Approaching stop',
        deck: 'Double Deck' as const,
        wab: true,
        plateNumber: undefined,
      },
      {
        etaMinutes: 10,
        etaSeconds: 15,
        crowd: 'standing' as const,
        crowdText: 'Can Squeeze',
        subtitle: '2 stops back',
        deck: 'Single Deck' as const,
        wab: true,
        plateNumber: undefined,
      },
      {
        etaMinutes: 22,
        etaSeconds: 45,
        crowd: 'seats' as const,
        crowdText: 'Seats Avail',
        subtitle: 'Scheduled',
        deck: 'Double Deck' as const,
        wab: true,
        plateNumber: undefined,
      },
    ],
  };

  const rawList = [service.NextBus, service.NextBus2, service.NextBus3].filter(Boolean);

  const parsedList = rawList.map((bus, idx) => {
    let etaMin = idx === 0 ? 1 : idx === 1 ? 8 : 18;
    let etaSec = 30;

    if (bus?.EstimatedArrival) {
      const diffMs = new Date(bus.EstimatedArrival).getTime() - Date.now();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      etaMin = Math.floor(totalSec / 60);
      etaSec = totalSec % 60;
    }

    const crowdMap: Record<string, { level: CrowdLevel; text: string }> = {
      SEA: { level: 'seats', text: 'Seats Steady' },
      SDA: { level: 'standing', text: 'Can Squeeze' },
      LSD: { level: 'full', text: 'Packed Sardine' },
    };

    const loadKey = bus?.Load || 'SEA';
    const crowdInfo = crowdMap[loadKey] || { level: 'seats', text: 'Seats Steady' };

    const deckMap: Record<string, DeckType> = {
      SD: 'Single Deck',
      DD: 'Double Deck',
      BD: 'Bendy',
    };
    const deck = deckMap[bus?.Type || ''] || (idx % 2 === 0 ? 'Double Deck' : 'Single Deck');

    const subtitle =
      idx === 0
        ? etaMin <= 1
          ? 'Turning into slip road now lah!'
          : `Approaching in ~${etaMin} min`
        : `Est. in ${etaMin} mins`;

    const plateNumber =
      bus?.Latitude && bus?.Longitude
        ? `GPS: ${parseFloat(bus.Latitude).toFixed(3)}, ${parseFloat(bus.Longitude).toFixed(3)}`
        : undefined;

    return {
      etaMinutes: etaMin,
      etaSeconds: etaSec,
      crowd: crowdInfo.level,
      crowdText: crowdInfo.text,
      subtitle,
      deck,
      wab: bus?.Feature === 'WAB',
      plateNumber,
    };
  });

  // Ensure 3 arrivals array
  while (parsedList.length < 3) {
    const defaultMins = [2, 10, 22];
    parsedList.push({
      etaMinutes: defaultMins[parsedList.length],
      etaSeconds: 45,
      crowd: 'seats',
      crowdText: 'Seats Avail',
      subtitle: `Est. ${defaultMins[parsedList.length]} mins`,
      deck: 'Double Deck',
      wab: true,
      plateNumber: undefined,
    });
  }

  const operatorFormatted =
    service.Operator === 'SMRT'
      ? 'SMRT'
      : service.Operator === 'TTS' || service.Operator === 'Tower Transit'
      ? 'Tower Transit'
      : service.Operator === 'GAS' || service.Operator === 'Go-Ahead'
      ? 'Go-Ahead'
      : 'SBS Transit';

  return {
    busNumber: service.ServiceNo,
    destination: fallback.destination,
    origin: fallback.origin,
    operator: operatorFormatted,
    viaRoute: fallback.viaRoute,
    speedKmh: fallback.speedKmh,
    direction: fallback.direction,
    arrivals: [parsedList[0], parsedList[1], parsedList[2]],
  };
}

/**
 * Fetch bus arrival data from the /api/bus-arrival endpoint
 */
export async function fetchBusArrivals(
  busStopCode: string,
  serviceNo?: string
): Promise<LtaArrivalResponse> {
  const url = new URL('/api/bus-arrival', window.location.origin);
  url.searchParams.set('BusStopCode', busStopCode);
  if (serviceNo) {
    url.searchParams.set('ServiceNo', serviceNo);
  }

  const headers: Record<string, string> = {
    accept: 'application/json',
  };

  const storedKey = getStoredLtaKey();
  if (storedKey) {
    headers['x-lta-account-key'] = storedKey;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    let errMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.message) {
        errMessage = errJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return await response.json();
}
