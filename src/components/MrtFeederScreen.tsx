import React from 'react';
import { MRT_FEEDER_DATA } from '../data/transitData';

interface MrtFeederScreenProps {
  onSelectBus: (busNum: string) => void;
}

export const MrtFeederScreen: React.FC<MrtFeederScreenProps> = ({ onSelectBus }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200/80 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-[24px]">subway</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
              MRT Feeder &amp; Interchange Hubs
            </h1>
            <p className="text-xs md:text-sm text-stone-600">
              Seamless transfers between MRT Train networks and neighborhood feeder bus lines
            </p>
          </div>
        </div>
      </div>

      {/* Grid of MRT Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MRT_FEEDER_DATA.map((station) => (
          <div
            key={station.code}
            className="bg-white rounded-2xl p-6 border border-orange-200/80 shadow-sm hover:shadow-md transition"
          >
            {/* Station Title & Line badges */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {station.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {station.lines.map((line) => (
                    <span
                      key={line.code}
                      className="px-2.5 py-0.5 rounded-lg text-white font-black text-xs shadow-xs"
                      style={{ backgroundColor: line.color }}
                    >
                      {line.code} {line.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-stone-500 block">From Blk 245</span>
                <span className="text-xs font-extrabold text-[#d95e1e]">
                  {station.walkingDistance.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Walking Connection Status */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 mb-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  directions_walk
                </span>
                {station.walkingDistance}
              </span>
              {station.sheltered ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  100% Sheltered
                </span>
              ) : (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Open Pathway
                </span>
              )}
            </div>

            {/* Feeder Buses Section */}
            <div className="mb-4">
              <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block mb-2">
                Connecting Feeder &amp; Trunk Buses:
              </span>
              <div className="flex flex-wrap gap-2">
                {station.feederBuses.map((bus) => (
                  <button
                    key={bus}
                    onClick={() => onSelectBus(bus)}
                    className="w-10 h-8 rounded-lg bg-orange-50 hover:bg-[#d95e1e] hover:text-white text-stone-800 border border-orange-200 text-xs font-black transition flex items-center justify-center cursor-pointer shadow-xs"
                    title={`View Live Telemetry for Bus ${bus}`}
                  >
                    {bus}
                  </button>
                ))}
              </div>
            </div>

            {/* Train Schedules */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">
                  First Train
                </span>
                <span className="text-stone-800 font-bold">
                  North: {station.firstTrain.north}
                </span>
                <span className="text-stone-800 font-bold block">
                  South: {station.firstTrain.south}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">
                  Last Train
                </span>
                <span className="text-stone-800 font-bold">
                  North: {station.lastTrain.north}
                </span>
                <span className="text-stone-800 font-bold block">
                  South: {station.lastTrain.south}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
