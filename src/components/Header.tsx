import React from 'react';
import { UserLocation } from '../types/transit';

interface HeaderProps {
  currentTab: 'live-arrivals' | 'nearby-stops' | 'bus-routes' | 'mrt-feeder';
  onSelectTab: (tab: 'live-arrivals' | 'nearby-stops' | 'bus-routes' | 'mrt-feeder') => void;
  onOpenSettings?: () => void;
  currentLocationText?: string;
  userLocation?: UserLocation | null;
  isLocating?: boolean;
  isLiveGPS?: boolean;
  onLocateMe?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  currentLocationText = 'Near Bishan St 22 (Near Blk 245)',
  userLocation,
  isLocating,
  isLiveGPS,
  onLocateMe,
}) => {
  const LOGO_SRC =
    'https://lh3.googleusercontent.com/aida/AEtjO1UcsbC1zls6a6jl2ErCUi4expAi9J-KJnHkTvoW6QR5PThJXvT3u51wAZtCLVHmh5xS1NF522FLuW9Qj8p75kLJQoozzr16gbtLcFw83A8Uhco21wdxhPSkamQap1DlaglOjKUSBdUmiuyts7XH2AkpUH5mot9DIikypqI-SwdmZcGQB3yJIv47Wn2pjKhoHfKqE7NODY5iE_Q0nxCzXmCQBM7N7AW5lkyjkRJPEz3rNBDa3EUrqYmMKf8';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-orange-100 shadow-[0_4px_20px_rgba(217,94,30,0.06)]">
      <div className="h-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button
            onClick={() => onSelectTab('live-arrivals')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <img
              alt="BusLah! Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src={LOGO_SRC}
              referrerPolicy="no-referrer"
            />
            <span className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
              Bus<span className="text-[#d95e1e]">Lah!</span>
            </span>
          </button>

          {/* Dynamic Live GPS Location Indicator */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={onLocateMe}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition cursor-pointer text-xs font-bold ${
                isLiveGPS
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs hover:bg-emerald-100'
                  : isLocating
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : 'bg-orange-50 border-orange-200/80 text-stone-700 hover:bg-orange-100'
              }`}
              title={
                isLiveGPS
                  ? `Live GPS Active (±${Math.round(userLocation?.accuracy || 0)}m). Click to refresh position.`
                  : 'Click to acquire your live device GPS location'
              }
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isLiveGPS
                    ? 'bg-emerald-500 animate-ping'
                    : isLocating
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-[#d95e1e]'
                }`}
              ></span>

              <span className="flex items-center gap-1">
                {isLocating ? (
                  'Acquiring Live GPS...'
                ) : isLiveGPS && userLocation ? (
                  <>
                    <span className="font-extrabold text-emerald-800">
                      📍 {userLocation.nearestStopName || 'Live GPS Locked'}
                    </span>
                    {userLocation.distanceToNearestStopMeters !== undefined && (
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-mono">
                        {userLocation.distanceToNearestStopMeters}m away
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span>{currentLocationText}</span>
                    <span className="text-[10px] font-bold text-[#d95e1e] bg-orange-100 px-1.5 py-0.5 rounded ml-0.5">
                      Locate Me
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-stone-200/70">
          <button
            onClick={() => onSelectTab('live-arrivals')}
            className={`transition-all font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs ${
              currentTab === 'live-arrivals'
                ? 'bg-[#d95e1e] text-white shadow-sm font-bold'
                : 'text-stone-600 hover:text-[#d95e1e] hover:bg-orange-50/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_bus</span>
            Live Arrivals
          </button>
          <button
            onClick={() => onSelectTab('nearby-stops')}
            className={`transition-all font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs ${
              currentTab === 'nearby-stops'
                ? 'bg-[#d95e1e] text-white shadow-sm font-bold'
                : 'text-stone-600 hover:text-[#d95e1e] hover:bg-orange-50/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">near_me</span>
            Nearby Stops
          </button>
          <button
            onClick={() => onSelectTab('bus-routes')}
            className={`transition-all font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs ${
              currentTab === 'bus-routes'
                ? 'bg-[#d95e1e] text-white shadow-sm font-bold'
                : 'text-stone-600 hover:text-[#d95e1e] hover:bg-orange-50/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            Bus Routes
          </button>
          <button
            onClick={() => onSelectTab('mrt-feeder')}
            className={`transition-all font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs ${
              currentTab === 'mrt-feeder'
                ? 'bg-[#d95e1e] text-white shadow-sm font-bold'
                : 'text-stone-600 hover:text-[#d95e1e] hover:bg-orange-50/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">subway</span>
            MRT Feeder
          </button>
        </nav>

        {/* Right actions: Crowd Legend & Profile button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 rounded-full border border-orange-200/80 shadow-xs">
            <div className="flex items-center gap-1" title="Seats Steady">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span className="text-[11px] font-bold text-emerald-800">Seats</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1" title="Can Squeeze">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
              <span className="text-[11px] font-bold text-amber-800">Standing</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1" title="Pack Like Sardine">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
              <span className="text-[11px] font-bold text-rose-700">Full</span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d95e1e] to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 text-white cursor-pointer hover:scale-105 transition-transform"
            title="User Profile & Settings"
          >
            <span className="material-symbols-outlined text-white text-[20px]">person</span>
          </button>
        </div>
      </div>

      {/* Mobile Location & Nav Bar for smaller screens */}
      <div className="flex sm:hidden items-center justify-between px-4 py-1.5 bg-orange-50/80 border-t border-orange-100 text-xs">
        <button
          onClick={onLocateMe}
          className="flex items-center gap-1.5 text-stone-800 font-bold"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveGPS ? 'bg-emerald-500 animate-ping' : 'bg-[#d95e1e]'
            }`}
          ></span>
          <span className="truncate max-w-[240px]">
            {isLiveGPS && userLocation
              ? `📍 ${userLocation.nearestStopName} (${userLocation.distanceToNearestStopMeters}m)`
              : currentLocationText}
          </span>
        </button>
        <button
          onClick={onLocateMe}
          className="text-[#d95e1e] text-[11px] font-black underline shrink-0"
        >
          {isLocating ? 'Locating...' : 'Locate Me'}
        </button>
      </div>

      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-orange-100/80 bg-white/90 gap-1.5">
        <button
          onClick={() => onSelectTab('live-arrivals')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'live-arrivals' ? 'bg-[#d95e1e] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
          Live Arrivals
        </button>
        <button
          onClick={() => onSelectTab('nearby-stops')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'nearby-stops' ? 'bg-[#d95e1e] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">near_me</span>
          Nearby Stops
        </button>
        <button
          onClick={() => onSelectTab('bus-routes')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'bus-routes' ? 'bg-[#d95e1e] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">map</span>
          Bus Routes
        </button>
        <button
          onClick={() => onSelectTab('mrt-feeder')}
          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'mrt-feeder' ? 'bg-[#d95e1e] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">subway</span>
          MRT Feeder
        </button>
      </div>
    </header>
  );
};
