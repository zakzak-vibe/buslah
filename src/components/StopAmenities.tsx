import React from 'react';

interface StopAmenitiesProps {
  stopName?: string;
  onFilterAmenity?: (amenity: string) => void;
}

export const StopAmenities: React.FC<StopAmenitiesProps> = ({
  stopName = 'Blk 245 Bus Stop',
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(217,94,30,0.06)] border border-orange-200/80 p-4">
      <h4 className="text-xs md:text-sm text-stone-900 font-extrabold mb-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[#d95e1e] text-[18px]">
          storefront
        </span>
        <span>Around {stopName}</span>
      </h4>
      <p className="text-xs text-stone-500 mb-2.5">
        Sheltered paths &amp; food options right behind the bus stop
      </p>

      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-orange-100 transition cursor-default">
          <span className="material-symbols-outlined text-[15px] text-[#d95e1e]">coffee</span>
          Kim San Leng Kopi (1m)
        </span>

        <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition cursor-default">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">
            shopping_cart
          </span>
          FairPrice Blk 279
        </span>

        <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition cursor-default">
          <span className="material-symbols-outlined text-[15px] text-amber-600">roofing</span>
          100% Sheltered Walkway
        </span>

        <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition cursor-default">
          <span className="material-symbols-outlined text-[15px] text-blue-600">
            local_mall
          </span>
          Bishan North Mall
        </span>
      </div>
    </div>
  );
};
