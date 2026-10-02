import React, { useState } from 'react';

interface SearchBarProps {
  activeBus: string;
  onSelectBus: (bus: string) => void;
  stopName: string;
  stopCode: string;
  walkTime: string;
  onSwapDirection: () => void;
  direction: 1 | 2;
  availableBuses: string[];
  apiSource?: 'lta_datamall_live' | 'simulated_fallback';
  onOpenSettings?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  activeBus,
  onSelectBus,
  stopName,
  stopCode,
  walkTime,
  onSwapDirection,
  direction,
  availableBuses,
  apiSource = 'simulated_fallback',
  onOpenSettings,
}) => {
  const [searchValue, setSearchValue] = useState(activeBus);
  const [showDropdown, setShowDropdown] = useState(false);

  const hotBuses = ['54', '851', '13', '88', '166'];

  const filteredBuses = availableBuses.filter((b) =>
    b.toLowerCase().includes(searchValue.trim().toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSelectBus(searchValue.trim().toUpperCase());
      setShowDropdown(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-orange-100/70 via-amber-50/60 to-rose-100/60 border-b border-orange-200/70 pb-4 pt-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search box & hot bus chips */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d95e1e] text-[22px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search bus (e.g. 54, 851)..."
                  className="w-full pl-11 pr-10 py-2.5 bg-white rounded-xl text-sm md:text-base font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d95e1e] focus:border-[#d95e1e] shadow-sm border border-orange-200"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue('');
                      setShowDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#d95e1e] transition-colors flex items-center justify-center p-1 rounded-full hover:bg-orange-50"
                    aria-label="Clear bus search"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </form>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchValue.trim() && filteredBuses.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-orange-200 z-30 max-h-56 overflow-y-auto py-1">
                  {filteredBuses.map((bus) => (
                    <button
                      key={bus}
                      onClick={() => {
                        setSearchValue(bus);
                        onSelectBus(bus);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center justify-between text-sm font-bold text-stone-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-7 bg-[#d95e1e] text-white rounded-lg flex items-center justify-center text-xs font-black">
                          {bus}
                        </span>
                        <span>Bus Service {bus}</span>
                      </div>
                      <span className="text-xs text-stone-400">Live Telemetry</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hot buses pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Hot Buses:
              </span>
              {hotBuses.map((bus) => {
                const isActive = activeBus === bus;
                return (
                  <button
                    key={bus}
                    onClick={() => {
                      setSearchValue(bus);
                      onSelectBus(bus);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg transition font-extrabold ${
                      isActive
                        ? 'bg-[#d95e1e] text-white shadow-sm ring-2 ring-[#d95e1e]/30'
                        : 'bg-white text-stone-800 border border-orange-200 hover:border-[#d95e1e] hover:bg-orange-50/80 shadow-xs'
                    }`}
                  >
                    {bus}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Bus Stop indicator & Stream Status */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {apiSource === 'lta_datamall_live' ? (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-emerald-200 transition cursor-pointer"
                title="Direct LTA DataMall v3 Live Stream Active"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>LTA Live</span>
              </button>
            ) : (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-amber-200 transition cursor-pointer"
                title="Click to enter or test LTA DataMall AccountKey"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Key Setup</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-orange-200/90 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[#d95e1e] text-[20px]">
                location_on
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs md:text-sm text-stone-900 font-bold">
                  {stopName}
                </span>
                <span className="text-[11px] text-[#d95e1e] font-bold bg-orange-100/70 px-1.5 py-0.5 rounded">
                  ({stopCode})
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                  {walkTime}
                </span>
              </div>
              <button
                onClick={onSwapDirection}
                className="ml-1 text-[#d95e1e] hover:text-[#b34810] hover:bg-orange-100/60 p-1 rounded-lg transition flex items-center cursor-pointer"
                title={`Swap Direction (Currently Dir ${direction})`}
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
