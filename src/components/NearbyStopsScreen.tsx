import React, { useState } from 'react';
import { NEARBY_STOPS, BUS_DATABASE } from '../data/transitData';
import { UserLocation } from '../types/transit';
import { calculateDistanceMeters, formatDistance } from '../utils/geo';

interface NearbyStopsScreenProps {
  onSelectBusStop: (stopCode: string, stopName: string) => void;
  onSelectBus: (busNum: string) => void;
  currentStopCode: string;
  userLocation?: UserLocation | null;
  isLiveGPS?: boolean;
  onLocateMe?: () => void;
}

export const NearbyStopsScreen: React.FC<NearbyStopsScreenProps> = ({
  onSelectBusStop,
  onSelectBus,
  currentStopCode,
  userLocation,
  isLiveGPS,
  onLocateMe,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  // Compute live distance if user location is available
  const stopsWithDistances = NEARBY_STOPS.map((stop) => {
    let distance = stop.distanceMeters;
    let walkMins = stop.walkMinutes;

    if (userLocation && stop.lat !== undefined && stop.lng !== undefined) {
      distance = calculateDistanceMeters(
        userLocation.latitude,
        userLocation.longitude,
        stop.lat,
        stop.lng
      );
      walkMins = Math.max(1, Math.round(distance / 75));
    }

    return {
      ...stop,
      liveDistance: distance,
      liveWalkMinutes: walkMins,
    };
  });

  // Sort by live proximity
  stopsWithDistances.sort((a, b) => a.liveDistance - b.liveDistance);

  const filteredStops = stopsWithDistances.filter(
    (stop) =>
      stop.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      stop.code.includes(searchFilter) ||
      stop.road.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200/80 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">near_me</span>
              </span>
              <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                Nearby Bus Stops
              </h1>
              {isLiveGPS ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Live GPS Sorted
                </span>
              ) : (
                <button
                  onClick={onLocateMe}
                  className="text-[10px] font-bold bg-sky-100 text-sky-800 hover:bg-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition"
                >
                  <span className="material-symbols-outlined text-[12px]">my_location</span>
                  Use My GPS
                </button>
              )}
            </div>
            <p className="text-xs md:text-sm text-stone-600">
              {isLiveGPS && userLocation
                ? `Live device coordinates: ${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°E (±${Math.round(userLocation.accuracy)}m)`
                : 'Real-time bus arrivals sorted by walking proximity'}
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter stops or codes..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-xl text-xs md:text-sm font-semibold border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#d95e1e]"
            />
          </div>
        </div>
      </div>

      {/* Stop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStops.map((stop) => {
          const isCurrent = stop.code === currentStopCode;

          return (
            <div
              key={stop.code}
              className={`rounded-2xl p-5 border transition shadow-sm ${
                isCurrent
                  ? 'bg-gradient-to-br from-orange-50/80 via-white to-amber-50/40 border-2 border-[#d95e1e] shadow-md shadow-orange-500/10'
                  : 'bg-white border-orange-200/80 hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-extrabold text-stone-900">
                      {stop.name}
                    </h3>
                    <span className="text-xs font-black text-[#d95e1e] bg-orange-100 px-2 py-0.5 rounded-md">
                      {stop.code}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold bg-[#d95e1e] text-white px-2 py-0.5 rounded-full uppercase">
                        Current Selected Stop
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">{stop.road}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs md:text-sm font-black text-stone-800 flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">
                      directions_walk
                    </span>
                    {formatDistance(stop.liveDistance)} (~{stop.liveWalkMinutes} min)
                  </span>
                  {stop.sheltered && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full block mt-1">
                      100% Sheltered Linkway
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-600 mb-4 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#d95e1e]">info</span>
                <span>{stop.landmark}</span>
              </p>

              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Serving Bus Services
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {stop.services.map((bus) => (
                    <button
                      key={bus}
                      onClick={() => {
                        onSelectBus(bus);
                        onSelectBusStop(stop.code, stop.name);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg text-xs font-extrabold text-[#d95e1e] transition shadow-2xs hover:scale-105 cursor-pointer"
                    >
                      Bus {bus}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-orange-100 flex justify-end">
                <button
                  onClick={() => onSelectBusStop(stop.code, stop.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'bg-[#d95e1e] text-white hover:bg-[#b34810]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  {isCurrent ? 'Viewing Live Telemetry' : 'Switch To This Stop'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
