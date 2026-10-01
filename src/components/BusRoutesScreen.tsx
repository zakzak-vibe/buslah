import React, { useState } from 'react';
import { BUS_DATABASE, ROUTE_STEPS_BUS_54 } from '../data/transitData';

interface BusRoutesScreenProps {
  onSelectBus: (busNum: string) => void;
  selectedBus: string;
}

export const BusRoutesScreen: React.FC<BusRoutesScreenProps> = ({
  onSelectBus,
  selectedBus,
}) => {
  const [activeBus, setActiveBus] = useState(selectedBus || '54');
  const [direction, setDirection] = useState<1 | 2>(1);

  const busNumbers = Object.keys(BUS_DATABASE);
  const currentBus = BUS_DATABASE[activeBus] || BUS_DATABASE['54'];

  const scheduleInfo = {
    firstBus: '05:45 AM',
    lastBus: '11:45 PM',
    peakFreq: '6 - 9 mins',
    offPeakFreq: '10 - 14 mins',
    distanceKm: '18.4 km',
    totalStops: 38,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      {/* Top Selector Strip */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200/80 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">map</span>
              </span>
              <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                Bus Routes &amp; Stop Directory
              </h1>
            </div>
            <p className="text-xs md:text-sm text-stone-600">
              Complete route maps, operating schedules, and stop-by-stop telemetry across Singapore
            </p>
          </div>

          {/* Quick Bus Selector Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-400 mr-1">Select Bus:</span>
            {busNumbers.map((num) => (
              <button
                key={num}
                onClick={() => {
                  setActiveBus(num);
                  onSelectBus(num);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeBus === num
                    ? 'bg-[#d95e1e] text-white shadow-md shadow-orange-500/20'
                    : 'bg-stone-50 hover:bg-orange-50 text-stone-800 border border-stone-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Route Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Profile & Operating Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-orange-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d95e1e] to-amber-600 text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">
                  Bus
                </span>
                <span className="text-2xl font-black leading-none">{currentBus.busNumber}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#b34810] bg-orange-100 px-2 py-0.5 rounded-full">
                  {currentBus.operator}
                </span>
                <h2 className="text-base font-extrabold text-stone-900 mt-1">
                  {currentBus.destination}
                </h2>
              </div>
            </div>

            {/* Direction Toggle */}
            <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl mb-5">
              <button
                onClick={() => setDirection(1)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  direction === 1 ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                Dir 1: Outbound
              </button>
              <button
                onClick={() => setDirection(2)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  direction === 2 ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                Dir 2: Return
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="text-stone-500 block font-medium">First Bus</span>
                <span className="text-stone-900 font-extrabold text-sm">{scheduleInfo.firstBus}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Last Bus</span>
                <span className="text-stone-900 font-extrabold text-sm">{scheduleInfo.lastBus}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Peak Freq</span>
                <span className="text-emerald-700 font-extrabold text-sm">
                  {scheduleInfo.peakFreq}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="text-stone-500 block font-medium">Off-Peak</span>
                <span className="text-stone-900 font-extrabold text-sm">
                  {scheduleInfo.offPeakFreq}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-600">
              <span>Total Distance: {scheduleInfo.distanceKm}</span>
              <span>{scheduleInfo.totalStops} Bus Stops</span>
            </div>
          </div>
        </div>

        {/* Right Column: Full Stop Sequence Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-orange-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d95e1e] text-[20px]">
                  linear_scale
                </span>
                <span>Route Stops Progression (Direction {direction})</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                Live GPS Sync Active
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-orange-200">
              {ROUTE_STEPS_BUS_54.map((step, idx) => (
                <div
                  key={step.stopCode}
                  className={`flex items-start gap-4 p-3 rounded-xl border relative z-10 transition ${
                    step.status === 'current'
                      ? 'bg-orange-50/80 border-[#d95e1e] shadow-xs'
                      : 'bg-white border-stone-200/70 hover:bg-stone-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                      step.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : step.status === 'current'
                        ? 'bg-[#d95e1e] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-stone-900">
                          {step.stopName}
                        </span>
                        <span className="text-[11px] font-bold text-stone-400">
                          ({step.stopCode})
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">{step.roadName}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          step.status === 'current'
                            ? 'bg-[#d95e1e] text-white'
                            : step.status === 'passed'
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {step.timeNote}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
