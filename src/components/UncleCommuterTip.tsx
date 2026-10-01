import React, { useState } from 'react';
import { UNCLE_PRO_TIPS } from '../data/transitData';

export const UncleCommuterTip: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);

  const currentTip = UNCLE_PRO_TIPS[tipIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % UNCLE_PRO_TIPS.length);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 rounded-2xl p-4 border border-amber-300/80 shadow-sm flex items-start gap-3.5 group">
      <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-black shadow-xs">
        <span className="material-symbols-outlined text-[24px]">lightbulb</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-xs md:text-sm text-amber-900 font-extrabold uppercase tracking-wide">
              Uncle Commuter Pro-Tip
            </p>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
              {currentTip.tag}
            </span>
          </div>

          <button
            onClick={handleNextTip}
            className="text-amber-800 hover:text-[#d95e1e] text-[11px] font-bold flex items-center gap-0.5 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-md transition"
            title="Next Singlish Tip"
          >
            <span>Lagi Tip</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <p className="text-xs md:text-sm text-stone-800 font-semibold mt-1">
          &ldquo;{currentTip.quote}&rdquo;
        </p>
      </div>
    </div>
  );
};
