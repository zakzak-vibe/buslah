import React, { useState } from 'react';
import { BusArrivalInfo } from '../types/transit';

interface ActiveBusHeroProps {
  busInfo: BusArrivalInfo;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isAlertActive: boolean;
  onToggleAlert: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenCrowdModal?: () => void;
  onOpenTrafficModal?: () => void;
}

export const ActiveBusHero: React.FC<ActiveBusHeroProps> = ({
  busInfo,
  isBookmarked,
  onToggleBookmark,
  isAlertActive,
  onToggleAlert,
  onRefresh,
  isRefreshing,
  onOpenCrowdModal,
  onOpenTrafficModal,
}) => {
  const [showExactSeconds, setShowExactSeconds] = useState(false);

  const getCrowdBg = (crowd: string) => {
    switch (crowd) {
      case 'seats':
        return 'bg-emerald-600 text-white';
      case 'standing':
        return 'bg-amber-500 text-white';
      case 'full':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const [firstBus, secondBus, thirdBus] = busInfo.arrivals;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(217,94,30,0.06)] border border-orange-200/80 p-4 md:p-6 mb-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-bl from-orange-200/30 via-amber-100/20 to-transparent rounded-full pointer-events-none blur-2xl"></div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-orange-100 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#d95e1e] via-[#e46422] to-amber-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0 ring-4 ring-orange-100/70">
            <span className="text-[10px] tracking-widest uppercase font-extrabold opacity-90">
              Bus
            </span>
            <span className="text-3xl font-black leading-none">{busInfo.busNumber}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl md:text-2xl text-stone-900 font-extrabold tracking-tight">
                {busInfo.destination}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#b34810] text-xs font-bold border border-orange-200">
                {busInfo.operator}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live Signal
              </span>
            </div>
            <p className="text-xs md:text-sm text-stone-600 flex items-center gap-1.5 flex-wrap">
              <span className="material-symbols-outlined text-[16px] text-[#d95e1e]">
                alt_route
              </span>
              <span className="font-medium">{busInfo.viaRoute}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={onToggleBookmark}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border shadow-xs ${
              isBookmarked
                ? 'bg-[#d95e1e] text-white border-[#d95e1e]'
                : 'bg-orange-50 text-stone-800 border-orange-200 hover:bg-orange-100 hover:text-[#d95e1e]'
            }`}
            title="Save to favorites"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
            <span>{isBookmarked ? 'Pinned' : 'Pin Stop'}</span>
          </button>

          <button
            onClick={onToggleAlert}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-md ${
              isAlertActive
                ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-300'
                : 'bg-gradient-to-r from-[#d95e1e] to-amber-500 text-white shadow-orange-500/25 hover:brightness-105'
            }`}
            title="Notify when bus is 2 stops away"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>{isAlertActive ? 'Alert Active (2m)' : 'Set Alert'}</span>
          </button>

          {onOpenTrafficModal && (
            <button
              onClick={onOpenTrafficModal}
              className="p-2 rounded-xl bg-orange-50 text-stone-700 hover:text-[#d95e1e] hover:bg-orange-100 transition-all flex items-center justify-center border border-orange-200 shadow-xs"
              title="View Traffic & Road Conditions"
            >
              <span className="material-symbols-outlined text-[20px]">videocam</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-orange-50 text-stone-700 hover:text-[#d95e1e] hover:bg-orange-100 transition-all flex items-center justify-center border border-orange-200 shadow-xs"
            title="Refresh Live Data"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isRefreshing ? 'animate-spin text-[#d95e1e]' : ''
              }`}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* 3 Bus Arrival Cards Grid */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* 1st Bus Card */}
        <div
          onClick={() => setShowExactSeconds(!showExactSeconds)}
          className="cursor-pointer relative bg-gradient-to-b from-emerald-50/60 via-white to-orange-50/40 rounded-2xl p-4 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 flex flex-col justify-between overflow-hidden group hover:border-emerald-600 transition"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs uppercase tracking-wider text-emerald-800 font-extrabold">
                1st Bus (Next)
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCrowdModal?.();
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${getCrowdBg(
                firstBus.crowd
              )}`}
            >
              <span className="material-symbols-outlined text-[14px]">
                airline_seat_recline_normal
              </span>
              {firstBus.crowdText}
            </button>
          </div>

          <div className="my-4 text-center relative z-10">
            <div className="text-5xl md:text-6xl text-emerald-600 font-black flex items-baseline justify-center gap-1 leading-none tracking-tight">
              {showExactSeconds ? (
                <>
                  <span>
                    {firstBus.etaMinutes}:{firstBus.etaSeconds < 10 ? '0' : ''}
                    {firstBus.etaSeconds}
                  </span>
                  <span className="text-xl md:text-2xl text-stone-700 font-bold">m:s</span>
                </>
              ) : (
                <>
                  <span>{firstBus.etaMinutes}</span>
                  <span className="text-xl md:text-2xl text-stone-700 font-bold">min</span>
                </>
              )}
            </div>
            <span className="inline-block mt-2 text-xs text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
              {firstBus.subtitle}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-stone-600 relative z-10">
            <div className="flex items-center gap-1 text-stone-900 font-bold">
              <span className="material-symbols-outlined text-[18px] text-[#d95e1e]">
                directions_bus
              </span>
              <span>{firstBus.deck}</span>
              {firstBus.plateNumber && (
                <span className="text-[10px] text-stone-400 font-normal ml-1">
                  ({firstBus.plateNumber})
                </span>
              )}
            </div>
            {firstBus.wab && (
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="material-symbols-outlined text-[18px]">accessible</span>
                <span>WAB</span>
              </div>
            )}
          </div>
        </div>

        {/* 2nd Bus Card */}
        <div className="bg-gradient-to-b from-amber-50/60 via-white to-white rounded-2xl p-4 border-2 border-amber-300 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone-600 font-extrabold">
              2nd Bus
            </span>
            <button
              onClick={onOpenCrowdModal}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${getCrowdBg(
                secondBus.crowd
              )}`}
            >
              <span className="material-symbols-outlined text-[14px]">groups</span>
              {secondBus.crowdText}
            </button>
          </div>

          <div className="my-4 text-center">
            <div className="text-5xl md:text-6xl text-stone-900 font-black flex items-baseline justify-center gap-1 leading-none tracking-tight">
              <span>{secondBus.etaMinutes}</span>
              <span className="text-xl md:text-2xl text-stone-500 font-bold">mins</span>
            </div>
            <span className="inline-block mt-2 text-xs text-amber-800 font-bold bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200">
              {secondBus.subtitle}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1 text-stone-800 font-semibold">
              <span className="material-symbols-outlined text-[18px] text-stone-400">
                directions_bus
              </span>
              <span>{secondBus.deck}</span>
            </div>
            {secondBus.wab && (
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="material-symbols-outlined text-[18px]">accessible</span>
                <span>WAB</span>
              </div>
            )}
          </div>
        </div>

        {/* 3rd Bus Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">
              3rd Bus
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {thirdBus.crowdText}
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="text-5xl md:text-6xl text-stone-700 font-black flex items-baseline justify-center gap-1 leading-none tracking-tight">
              <span>{thirdBus.etaMinutes}</span>
              <span className="text-xl md:text-2xl text-stone-400 font-semibold">mins</span>
            </div>
            <span className="inline-block mt-2 text-xs text-stone-500 font-semibold bg-stone-100 px-2.5 py-1 rounded-full">
              {thirdBus.subtitle}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1 text-stone-800 font-semibold">
              <span className="material-symbols-outlined text-[18px] text-[#d95e1e]">
                directions_bus
              </span>
              <span>{thirdBus.deck}</span>
            </div>
            {thirdBus.wab && (
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="material-symbols-outlined text-[18px]">accessible</span>
                <span>WAB</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
