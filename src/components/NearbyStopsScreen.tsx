import React, { useState } from 'react';
import { NEARBY_STOPS, BUS_DATABASE } from '../data/transitData';

interface NearbyStopsScreenProps {
  onSelectBusStop: (stopCode: string, stopName: string) => void;
  onSelectBus: (busNum: string) => void;
  currentStopCode: string;
}

export const NearbyStopsScreen: React.FC<NearbyStopsScreenProps> = ({
  onSelectBusStop,
  onSelectBus,
  currentStopCode,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredStops = NEARBY_STOPS.filter(
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
            </div>
            <p className="text-xs md:text-sm text-stone-600">
              Real-time bus arrivals around Bishan-Ang Mo Kio district sorted by walking proximity
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
                    <span className="text-xs font-bold text-[#d95e1e] bg-orange-100 px-2 py-0.5 rounded-full">
                      {stop.code}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wide bg-[#d95e1e] text-white px-2 py-0.5 rounded-full">
                        You Are Here
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">{stop.road}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                    ~{stop.walkMinutes} min ({stop.distanceMeters}m)
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-amber-600">
                  signpost
                </span>
                <span>{stop.landmark}</span>
              </p>

              {/* Serving Buses Chips */}
              <div className="border-t border-orange-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    Services &amp; Next Bus:
                  </span>
                  {stop.sheltered && (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">roofing</span>
                      Sheltered Walkway
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {stop.services.map((busNum) => {
                    const info = BUS_DATABASE[busNum];
                    const nextEta = info?.arrivals[0]?.etaMinutes ?? 4;

                    return (
                      <button
                        key={busNum}
                        onClick={() => {
                          onSelectBus(busNum);
                          onSelectBusStop(stop.code, stop.name);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-[#d95e1e] transition flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <span className="w-7 h-6 rounded-md bg-[#d95e1e] text-white flex items-center justify-center text-xs font-black group-hover:scale-105 transition-transform">
                          {busNum}
                        </span>
                        <div>
                          <span className="text-xs font-extrabold text-stone-900 block leading-tight">
                            {nextEta} min
                          </span>
                          <span className="text-[9px] text-stone-500 block leading-none">
                            Next arr
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                <button
                  onClick={() => onSelectBusStop(stop.code, stop.name)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#d95e1e] bg-orange-50 hover:bg-orange-100 border border-orange-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Inspect Stop Telemetry</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
