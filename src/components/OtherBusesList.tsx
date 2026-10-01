import React from 'react';
import { BUS_DATABASE } from '../data/transitData';

interface OtherBusesListProps {
  currentBus: string;
  onSelectBus: (bus: string) => void;
  stopCode: string;
}

export const OtherBusesList: React.FC<OtherBusesListProps> = ({
  currentBus,
  onSelectBus,
  stopCode,
}) => {
  // List of other buses commonly at this stop
  const otherBusKeys = ['13', '88', '74', '166', '410G'].filter((b) => b !== currentBus);

  const getBadgeColor = (busNum: string) => {
    switch (busNum) {
      case '13':
        return 'from-[#d95e1e] to-amber-600';
      case '88':
        return 'from-amber-500 to-amber-600';
      case '74':
        return 'from-sky-500 to-cyan-600';
      case '166':
        return 'from-purple-500 to-indigo-600';
      case '410G':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-[#d95e1e] to-amber-600';
    }
  };

  const getCrowdColor = (crowd: string) => {
    switch (crowd) {
      case 'seats':
        return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Seats Steady' };
      case 'standing':
        return { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Standing' };
      case 'full':
        return { dot: 'bg-rose-500', text: 'text-rose-700', label: 'Full' };
      default:
        return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Seats' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(217,94,30,0.06)] border border-orange-200/80 p-4 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#d95e1e] text-[20px]">
            directions_bus
          </span>
          <h3 className="text-base md:text-lg text-stone-900 font-extrabold">
            Other Buses At This Stop
          </h3>
        </div>
        <span className="text-xs text-[#d95e1e] font-bold bg-orange-100 px-2.5 py-0.5 rounded-full">
          Stop {stopCode}
        </span>
      </div>

      <p className="text-xs text-stone-500 mb-3">
        Tap any bus card to inspect live telemetry &amp; route
      </p>

      <div className="space-y-2.5">
        {otherBusKeys.map((busNum) => {
          const info = BUS_DATABASE[busNum];
          if (!info) return null;
          const firstArrival = info.arrivals[0];
          const crowdInfo = getCrowdColor(firstArrival.crowd);

          return (
            <button
              key={busNum}
              onClick={() => onSelectBus(busNum)}
              className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-orange-50/70 to-white hover:from-orange-100/80 hover:to-orange-50 transition border border-orange-200/90 flex items-center justify-between group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-11 h-9 rounded-xl bg-gradient-to-br ${getBadgeColor(
                    busNum
                  )} text-white flex items-center justify-center text-base font-black shadow-xs group-hover:scale-105 transition-transform`}
                >
                  {busNum}
                </span>
                <div>
                  <p className="text-xs md:text-sm text-stone-900 font-bold">
                    {info.destination}
                  </p>
                  <p className="text-[11px] text-stone-500">{firstArrival.subtitle}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm md:text-base text-emerald-600 font-extrabold">
                  {firstArrival.etaMinutes} min
                </span>
                <div className="flex items-center justify-end gap-1">
                  <span className={`w-2 h-2 rounded-full ${crowdInfo.dot}`}></span>
                  <span className={`text-[10px] font-bold ${crowdInfo.text}`}>
                    {crowdInfo.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
