import React from 'react';
import { StopStep } from '../types/transit';

interface RouteStepperProps {
  steps: StopStep[];
  currentBusNumber: string;
  onSelectStop?: (stopCode: string) => void;
}

export const RouteStepper: React.FC<RouteStepperProps> = ({
  steps,
  currentBusNumber,
  onSelectStop,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(217,94,30,0.06)] border border-orange-200/80 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">near_me</span>
          </div>
          <div>
            <h2 className="text-base md:text-lg text-stone-900 font-extrabold">
              Route Stepper &amp; Next Stops
            </h2>
            <p className="text-xs text-stone-500">Live GPS tracking every 5 seconds</p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Synchronized
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-6 before:w-0.5 before:bg-orange-200 before:z-0">
        {steps.map((step, idx) => {
          if (step.status === 'passed') {
            return (
              <div
                key={step.stopCode}
                onClick={() => onSelectStop?.(step.stopCode)}
                className="cursor-pointer flex items-center gap-3.5 p-2.5 rounded-xl bg-stone-50/80 text-stone-500 border border-stone-200/60 relative z-10 hover:bg-stone-100 transition"
              >
                <span className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[13px] shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
                <div className="flex-1 flex items-center justify-between text-xs">
                  <span className="font-bold">
                    {step.stopName} ({step.stopCode})
                  </span>
                  <span className="font-medium text-stone-400">{step.timeNote}</span>
                </div>
              </div>
            );
          }

          if (step.status === 'current') {
            return (
              <div
                key={step.stopCode}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border-2 border-[#d95e1e] text-stone-900 shadow-md shadow-orange-500/10 relative z-10"
              >
                <span className="w-8 h-8 rounded-xl bg-[#d95e1e] text-white flex items-center justify-center text-[16px] shrink-0 font-black shadow-sm animate-bounce">
                  <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                </span>
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-extrabold text-stone-900">
                      {step.stopName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#d95e1e] text-white text-[10px] font-black uppercase tracking-wide">
                      You Are Here
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600">1 min</span>
                    <span className="block text-[10px] font-bold text-stone-400">
                      Stop {step.stopCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Upcoming stops
          return (
            <div
              key={step.stopCode}
              onClick={() => onSelectStop?.(step.stopCode)}
              className="cursor-pointer flex items-center gap-3.5 p-2.5 rounded-xl bg-white hover:bg-orange-50/60 transition border border-stone-200/70 text-stone-800 relative z-10"
            >
              <span className="w-7 h-7 rounded-full bg-orange-100 text-[#d95e1e] flex items-center justify-center text-[12px] shrink-0 font-bold">
                {idx + 1}
              </span>
              <div className="flex-1 flex items-center justify-between text-xs">
                <span className="font-bold">
                  {step.stopName} ({step.stopCode})
                </span>
                <span className="font-bold text-stone-500">{step.timeNote}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
