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
  source?: 'lta_datamall_live' | 'simulated_fallback';
  note?: string;
  BusStopCode?: string;
  Services?: LtaServiceItem[];
  enrichedServices?: LtaServiceItem[];
  timestamp?: string;
}

// Convert LTA API service to frontend BusArrivalInfo model
export function transformLtaServiceToBusInfo(
  service: LtaServiceItem,
  busNumber: string
): BusArrivalInfo {
  const fallback = BUS_DATABASE[busNumber] || BUS_DATABASE['54'];

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
    const deck = deckMap[bus?.Type || ''] || 'Double Deck';

    const subtitle =
      idx === 0
        ? etaMin <= 1
          ? 'Turning into slip road now lah!'
          : `Approaching in ~${etaMin} min`
        : `Est. in ${etaMin} mins`;

    return {
      etaMinutes: etaMin,
      etaSeconds: etaSec,
      crowd: crowdInfo.level,
      crowdText: crowdInfo.text,
      subtitle,
      deck,
      wab: bus?.Feature === 'WAB',
      plateNumber: bus?.Latitude ? `LTA-GPS (${bus.Latitude.slice(0, 5)}, ${bus.Longitude?.slice(0, 7)})` : undefined,
    };
  });

  // Ensure 3 arrivals array
  while (parsedList.length < 3) {
    const defaultMins = [1, 8, 19];
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

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
