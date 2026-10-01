export type CrowdLevel = 'seats' | 'standing' | 'full';

export type DeckType = 'Single Deck' | 'Double Deck' | 'Bendy';

export interface BusArrivalInfo {
  busNumber: string;
  destination: string;
  operator: 'SBS Transit' | 'SMRT' | 'Tower Transit' | 'Go-Ahead';
  viaRoute: string;
  arrivals: [
    {
      etaMinutes: number;
      etaSeconds: number;
      crowd: CrowdLevel;
      crowdText: string;
      subtitle: string;
      deck: DeckType;
      wab: boolean;
      plateNumber?: string;
    },
    {
      etaMinutes: number;
      etaSeconds: number;
      crowd: CrowdLevel;
      crowdText: string;
      subtitle: string;
      deck: DeckType;
      wab: boolean;
      plateNumber?: string;
    },
    {
      etaMinutes: number;
      etaSeconds: number;
      crowd: CrowdLevel;
      crowdText: string;
      subtitle: string;
      deck: DeckType;
      wab: boolean;
      plateNumber?: string;
    }
  ];
  speedKmh: number;
  direction: 1 | 2;
  origin: string;
}

export interface StopStep {
  stopCode: string;
  stopName: string;
  roadName: string;
  status: 'passed' | 'current' | 'upcoming';
  timeNote: string;
  distanceMeters?: number;
}

export interface BusStop {
  code: string;
  name: string;
  road: string;
  landmark: string;
  distanceMeters: number;
  walkMinutes: number;
  sheltered: boolean;
  services: string[];
}

export interface MRTStation {
  code: string;
  name: string;
  lines: { code: string; color: string; name: string }[];
  feederBuses: string[];
  firstTrain: { north: string; south: string; circle?: string };
  lastTrain: { north: string; south: string; circle?: string };
  walkingDistance: string;
  sheltered: boolean;
}
