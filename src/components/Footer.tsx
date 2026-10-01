import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-orange-200/80 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-extrabold text-stone-900">
            Bus<span className="text-[#d95e1e]">Lah!</span>
          </span>
          <span className="text-xs text-stone-500">
            • Singapore Real-time Transit Telemetry &amp; Live Radar
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-stone-500 font-medium">
            Data powered by LTA DataMall
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#d95e1e] font-bold">
            Chill lah, bus arriving soon!
          </span>
        </div>
      </div>
    </footer>
  );
};
