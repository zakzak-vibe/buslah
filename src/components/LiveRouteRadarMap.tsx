import React, { useState, useEffect } from 'react';
import { BusArrivalInfo, UserLocation } from '../types/transit';

interface LiveRouteRadarMapProps {
  busInfo: BusArrivalInfo;
  onSelectStop?: (stopCode: string) => void;
  onBusMarkerClick?: () => void;
  userLocation?: UserLocation | null;
  isLiveGPS?: boolean;
  onLocateMe?: () => void;
}

export const LiveRouteRadarMap: React.FC<LiveRouteRadarMapProps> = ({
  busInfo,
  onSelectStop,
  onBusMarkerClick,
  userLocation,
  isLiveGPS = false,
  onLocateMe,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [busProgress, setBusProgress] = useState(0); // 0 to 1 along Bishan St 22
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [showParksLayer, setShowParksLayer] = useState(true);
  const [showRouteLayer, setShowRouteLayer] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Subtle real-time bus progression along the street (from Blk 210 at x=490 towards Opp Blk 245 at x=340)
  useEffect(() => {
    const interval = setInterval(() => {
      setBusProgress((prev) => (prev >= 1 ? 0.05 : prev + 0.02));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Compute live bus X position: between 470 and 365
  const busCurrentX = 460 - busProgress * 95;
  const distanceRemaining = Math.max(80, Math.round((busCurrentX - 340) * 3));

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (onLocateMe) {
      onLocateMe();
    }
    setActiveTooltip(
      isLiveGPS
        ? `Locked on your live GPS location (±${Math.round(userLocation?.accuracy || 12)}m)`
        : 'Centered on Opp Blk 245 & approaching Bus'
    );
    setTimeout(() => setActiveTooltip(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(217,94,30,0.06)] border border-orange-200/80 p-4 md:p-6 mb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[22px]">explore</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl text-stone-900 font-black tracking-tight flex items-center gap-2">
              Live Route Radar &amp; Transit Map
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                Live GPS Tracking
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Real-time telemetry around Bishan-Ang Mo Kio district
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isLiveGPS && userLocation ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                GPS: {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}° (±{Math.round(userLocation.accuracy)}m)
              </span>
            </div>
          ) : (
            <button
              onClick={onLocateMe}
              className="flex items-center gap-1 bg-sky-50 border border-sky-300 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-800 hover:bg-sky-100 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-sky-600">my_location</span>
              <span>Enable Live GPS</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              directions_walk
            </span>
            <span>
              Walk: ~{userLocation?.distanceToNearestStopMeters || 140}m (
              {Math.max(1, Math.round((userLocation?.distanceToNearestStopMeters || 140) / 75))} min)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-bold text-[#d95e1e]">
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Telemetry: 1.2s ping</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[380px] md:h-[440px] rounded-2xl overflow-hidden border border-orange-200/90 shadow-inner bg-[#EBF2E8]">
        {/* SVG Singapore District Map Illustration */}
        <div
          className="w-full h-full transition-transform duration-300 origin-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <svg
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 900 460"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Subtle map grid pattern */}
              <pattern height="40" id="mapGrid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2EADF" strokeWidth="1" />
              </pattern>

              {/* Gradient for Bus 54 glowing route */}
              <linearGradient id="routeGlow" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d95e1e" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Shadow filter for pins */}
              <filter height="140%" id="markerShadow" width="140%" x="-20%" y="-20%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  floodColor="#000"
                  floodOpacity="0.25"
                  stdDeviation="4"
                />
              </filter>
            </defs>

            {/* Map Background / Base Terrain */}
            <rect fill="#F5EFE6" height="460" width="900" />
            <rect fill="url(#mapGrid)" height="460" width="900" />

            {/* Bishan-Ang Mo Kio Park Greenery Zone */}
            {showParksLayer && (
              <g>
                <path
                  d="M 30,20 C 140,10 320,35 480,25 C 620,15 780,50 880,30 L 880,120 C 760,140 600,110 450,130 C 280,150 150,125 30,140 Z"
                  fill="#D3E8D0"
                  opacity="0.85"
                />
                {/* Kallang River Canal through Park */}
                <path
                  d="M 20,80 Q 220,60 420,85 T 880,70"
                  fill="none"
                  stroke="#A9D4E8"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <path
                  d="M 20,80 Q 220,60 420,85 T 880,70"
                  fill="none"
                  stroke="#60A5FA"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <text
                  fill="#2D6A4F"
                  fontFamily="Montserrat"
                  fontSize="12"
                  fontWeight="700"
                  letterSpacing="1"
                  opacity="0.8"
                  x="250"
                  y="60"
                >
                  BISHAN-ANG MO KIO PARK
                </text>

                {/* Urban Secondary Greenery */}
                <rect fill="#DCEDD9" height="110" opacity="0.9" rx="16" width="160" x="660" y="270" />
                <text
                  fill="#2D6A4F"
                  fontFamily="Montserrat"
                  fontSize="11"
                  fontWeight="700"
                  opacity="0.7"
                  x="680"
                  y="325"
                >
                  Bishan Active Park
                </text>
                <rect fill="#DCEDD9" height="90" opacity="0.9" rx="14" width="140" x="70" y="240" />
                <text
                  fill="#2D6A4F"
                  fontFamily="Montserrat"
                  fontSize="11"
                  fontWeight="700"
                  opacity="0.7"
                  x="85"
                  y="290"
                >
                  Whitley Sec Field
                </text>
              </g>
            )}

            {/* Residential Blocks (Bishan St 22 / St 24 HDBs) */}
            <g fill="#EAE3D6" stroke="#D3C9B8" strokeWidth="1.5">
              <rect height="35" rx="4" width="60" x="180" y="170" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="195" y="192">
                Blk 243
              </text>
              <rect height="35" rx="4" width="65" x="260" y="170" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="275" y="192">
                Blk 244
              </text>
              <rect height="40" rx="4" width="70" x="345" y="165" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="360" y="189">
                Blk 245
              </text>
              <rect height="32" rx="4" width="55" x="490" y="175" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="502" y="195">
                Blk 210
              </text>
              <rect height="32" rx="4" width="55" x="560" y="175" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="572" y="195">
                Blk 211
              </text>
              <rect height="36" rx="4" width="65" x="230" y="320" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="242" y="342">
                Blk 225
              </text>
              <rect height="36" rx="4" width="65" x="315" y="320" />
              <text fill="#8C7E72" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="328" y="342">
                Blk 228
              </text>
            </g>

            {/* Secondary Roads Layer */}
            <path
              d="M 0,225 L 900,225"
              fill="none"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeWidth="26"
            />
            <path
              d="M 0,225 L 900,225"
              fill="none"
              stroke="#E2DAC9"
              strokeLinecap="round"
              strokeWidth="22"
            />
            <path
              d="M 0,225 L 900,225"
              fill="none"
              stroke="#FFFFFF"
              strokeDasharray="14 12"
              strokeWidth="2"
            />
            <text fill="#7C6D5F" fontFamily="Montserrat" fontSize="11" fontWeight="700" x="38" y="221">
              Bishan Street 22
            </text>

            {/* Perpendicular Connectors */}
            <path d="M 450,130 L 450,460" fill="none" stroke="#FFFFFF" strokeWidth="20" />
            <path d="M 450,130 L 450,460" fill="none" stroke="#E2DAC9" strokeWidth="16" />
            <text
              fill="#7C6D5F"
              fontFamily="Montserrat"
              fontSize="10"
              fontWeight="700"
              transform="rotate(90 445,300)"
              x="445"
              y="300"
            >
              Bishan St 23
            </text>

            <path d="M 140,0 L 140,460" fill="none" stroke="#FFFFFF" strokeWidth="28" />
            <path d="M 140,0 L 140,460" fill="none" stroke="#DDD4C2" strokeWidth="24" />
            <text
              fill="#7C6D5F"
              fontFamily="Montserrat"
              fontSize="11"
              fontWeight="700"
              transform="rotate(-90 132,120)"
              x="132"
              y="120"
            >
              Marymount Road
            </text>

            <path d="M 760,0 L 760,460" fill="none" stroke="#FFFFFF" strokeWidth="32" />
            <path d="M 760,0 L 760,460" fill="none" stroke="#DDD4C2" strokeWidth="28" />
            <text
              fill="#7C6D5F"
              fontFamily="Montserrat"
              fontSize="11"
              fontWeight="700"
              transform="rotate(90 765,110)"
              x="765"
              y="110"
            >
              Bishan Road (To MRT)
            </text>

            {/* MRT Red Line (North-South Line NS17) */}
            <path
              d="M 830,0 L 830,460"
              fill="none"
              stroke="#EF4444"
              strokeLinecap="round"
              strokeWidth="7"
            />
            <path
              d="M 830,0 L 830,460"
              fill="none"
              stroke="#FFFFFF"
              strokeDasharray="10 8"
              strokeWidth="2"
            />

            {/* MRT Circle Line (CC15) crossing */}
            <path
              d="M 720,440 L 900,320"
              fill="none"
              stroke="#EAB308"
              strokeLinecap="round"
              strokeWidth="6"
            />

            {/* MRT Station Badge: Bishan NS17 / CC15 */}
            <g
              filter="url(#markerShadow)"
              transform="translate(775, 370)"
              className="cursor-pointer"
              onClick={() => onSelectStop?.('53009')}
            >
              <rect fill="#1E293B" height="42" rx="10" width="105" x="0" y="0" />
              <rect fill="#EF4444" height="14" rx="4" width="30" x="8" y="7" />
              <text
                fill="#FFFFFF"
                fontFamily="Montserrat"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                x="23"
                y="18"
              >
                NS17
              </text>
              <rect fill="#EAB308" height="14" rx="4" width="30" x="42" y="7" />
              <text
                fill="#1E293B"
                fontFamily="Montserrat"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                x="57"
                y="18"
              >
                CC15
              </text>
              <text fill="#F8FAFC" fontFamily="Montserrat" fontSize="11" fontWeight="800" x="8" y="34">
                Bishan MRT
              </text>
            </g>

            {/* BUS ROUTE PATH (Glowing Orange Stroke) */}
            {showRouteLayer && (
              <g>
                <path
                  d="M 760,225 L 450,225 L 140,225 L 140,460"
                  fill="none"
                  stroke="#FFEDD5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="14"
                />
                <path
                  d="M 760,225 L 450,225 L 140,225 L 140,460"
                  fill="none"
                  stroke="url(#routeGlow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="7"
                />
                {/* Route Direction Chevron Indicators */}
                <g fill="#FFFFFF" opacity="0.8">
                  <path d="M 640,222 L 634,225 L 640,228 Z" />
                  <path d="M 520,222 L 514,225 L 520,228 Z" />
                  <path d="M 280,222 L 274,225 L 280,228 Z" />
                  <path d="M 137,320 L 140,326 L 143,320 Z" />
                </g>
              </g>
            )}

            {/* Past Bus Stop: Blk 210 (53389) */}
            <g
              transform="translate(490, 225)"
              className="cursor-pointer"
              onClick={() => onSelectStop?.('53389')}
            >
              <circle fill="#FFFFFF" r="7" stroke="#10B981" strokeWidth="3" />
              <circle fill="#10B981" r="3" />
              <rect fill="#1E293B" height="20" opacity="0.85" rx="5" width="80" x="-40" y="-30" />
              <text
                fill="#FFFFFF"
                fontFamily="Montserrat"
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
                x="0"
                y="-16"
              >
                Blk 210 (Passed)
              </text>
            </g>

            {/* Next Stop down Marymount: Opp Whitley Sec (53359) */}
            <g
              transform="translate(140, 370)"
              className="cursor-pointer"
              onClick={() => onSelectStop?.('53359')}
            >
              <circle fill="#FFFFFF" r="7" stroke="#64748B" strokeWidth="3" />
              <circle fill="#64748B" r="3" />
              <rect
                fill="#FFFFFF"
                height="20"
                rx="5"
                stroke="#CBD5E1"
                strokeWidth="1"
                width="105"
                x="14"
                y="-10"
              />
              <text fill="#334155" fontFamily="Montserrat" fontSize="9" fontWeight="700" x="22" y="4">
                Opp Whitley Sec (~3m)
              </text>
            </g>

            {/* WALKING PATH FROM LIVE USER TO BUS STOP */}
            <path
              d="M 270,270 Q 305,255 340,225"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.85"
            />

            {/* LIVE USER GPS PIN */}
            <g
              transform="translate(270, 270)"
              filter="url(#markerShadow)"
              className="cursor-pointer"
              onClick={onLocateMe}
            >
              {/* Animated Pulsing GPS Waves */}
              <circle
                className="pulse-radar-ring"
                fill="#0284c7"
                fillOpacity={isLiveGPS ? '0.35' : '0.2'}
                r={isLiveGPS ? '24' : '18'}
              />
              <circle fill="#FFFFFF" r="11" stroke="#0284c7" strokeWidth="3" />
              <circle fill="#0284c7" r="5" />

              {/* Callout Tag */}
              <g transform="translate(-60, 16)">
                <rect
                  fill="#0F172A"
                  height="30"
                  rx="7"
                  width="120"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                />
                <polygon fill="#0F172A" points="60,-4 54,0 66,0" />
                <text
                  fill="#38BDF8"
                  fontFamily="Montserrat"
                  fontSize="8.5"
                  fontWeight="800"
                  textAnchor="middle"
                  x="60"
                  y="12"
                >
                  {isLiveGPS ? '📍 YOU ARE HERE (LIVE GPS)' : '📍 YOU ARE HERE'}
                </text>
                <text
                  fill="#FFFFFF"
                  fontFamily="Montserrat"
                  fontSize="8"
                  fontWeight="700"
                  textAnchor="middle"
                  x="60"
                  y="23"
                >
                  {userLocation?.distanceToNearestStopMeters || 140}m walk to Stop
                </text>
              </g>
            </g>

            {/* TARGET STOP PIN: Opp Blk 245 (53379) */}
            <g
              filter="url(#markerShadow)"
              transform="translate(340, 225)"
              className="cursor-pointer"
              onClick={() => onSelectStop?.('53379')}
            >
              {/* Animated Pulsing Waves */}
              <circle className="pulse-radar-ring" fill="#d95e1e" fillOpacity="0.3" r="28" />
              <circle fill="#FFFFFF" r="13" stroke="#d95e1e" strokeWidth="4" />
              <circle fill="#d95e1e" r="6" />

              {/* Pin Callout Box */}
              <g transform="translate(-85, -78)">
                <rect
                  fill="#1E293B"
                  height="52"
                  rx="10"
                  stroke="#d95e1e"
                  strokeWidth="2"
                  width="170"
                />
                <polygon fill="#1E293B" points="85,52 77,60 93,60" />
                <circle cx="16" cy="18" fill="#10B981" r="4" />
                <text fill="#FFFFFF" fontFamily="Montserrat" fontSize="12" fontWeight="800" x="26" y="22">
                  Opp Blk 245
                </text>
                <text fill="#FDBA74" fontFamily="Montserrat" fontSize="10" fontWeight="700" x="12" y="40">
                  Stop 53379 • Bus Boarding Point
                </text>
              </g>
            </g>

            {/* LIVE BUS MARKER PIN (Approaching Stop: Dynamic progression) */}
            <g
              className="bus-live-marker cursor-pointer"
              filter="url(#markerShadow)"
              transform={`translate(${busCurrentX}, 225)`}
              onClick={onBusMarkerClick}
            >
              {/* Radar Pulse Ring */}
              <circle className="pulse-radar-ring" fill="#10B981" fillOpacity="0.35" r="22" />

              {/* Bus Shape Badge */}
              <rect
                fill="#d95e1e"
                height="26"
                rx="7"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                width="38"
                x="-19"
                y="-13"
              />
              <rect fill="#FFFFFF" height="9" opacity="0.9" rx="2" width="28" x="-14" y="-10" />
              <circle cx="-8" cy="6" fill="#FFFFFF" r="2.5" />
              <circle cx="8" cy="6" fill="#FFFFFF" r="2.5" />

              {/* Live Bus Callout Tag */}
              <g transform="translate(-90, 22)">
                <rect fill="#FFFFFF" height="42" rx="8" stroke="#f59e0b" strokeWidth="2" width="180" />
                <polygon fill="#FFFFFF" points="90,-1 84,-7 96,-7" />
                <text
                  fill="#d95e1e"
                  fontFamily="Montserrat"
                  fontSize="11"
                  fontWeight="800"
                  x="10"
                  y="18"
                >
                  Bus {busInfo.busNumber} ({busInfo.arrivals[0].plateNumber || 'SBS 3288S'})
                </text>
                <text
                  fill="#059669"
                  fontFamily="Montserrat"
                  fontSize="10"
                  fontWeight="700"
                  x="10"
                  y="33"
                >
                  ● Arr in 1 min • {distanceRemaining}m away
                </text>
              </g>
            </g>

            {/* Walking Distance Dashed Footpath from Current User to Bus Stop */}
            <path
              d="M 330,175 Q 325,195 340,212"
              fill="none"
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth="3"
            />
            <circle cx="330" cy="175" fill="#059669" r="4" />
          </svg>
        </div>

        {/* Interactive Map Floating Control Overlay (Top Left & Top Right) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-orange-200/90 shadow-sm text-xs font-bold text-stone-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Radar Active: Bishan Sector 4</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-orange-200/90 shadow-sm p-1">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg hover:bg-orange-50 text-stone-700 flex items-center justify-center font-bold text-base transition"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-[1px] h-4 bg-stone-200"></div>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg hover:bg-orange-50 text-stone-700 flex items-center justify-center font-bold text-base transition"
              title="Zoom Out"
            >
              −
            </button>
          </div>

          <button
            onClick={handleRecenter}
            className="bg-white/95 backdrop-blur-md hover:bg-orange-50 text-[#d95e1e] border border-orange-200/90 shadow-sm px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>

        {/* Bottom Interactive Floating Filter Chips */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
            <button
              onClick={() => setShowTrafficLayer(!showTrafficLayer)}
              className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1 shadow-sm transition ${
                showTrafficLayer
                  ? 'bg-stone-900/90 text-white'
                  : 'bg-white/90 text-stone-600 border border-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] text-emerald-400">
                traffic
              </span>
              Traffic: Smooth
            </button>

            <button
              onClick={() => setShowRouteLayer(!showRouteLayer)}
              className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1 shadow-sm transition ${
                showRouteLayer
                  ? 'bg-white/95 text-stone-800 border border-orange-200'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] text-[#d95e1e]">
                alt_route
              </span>
              Route {busInfo.busNumber} Traced
            </button>

            <button
              onClick={() => setShowParksLayer(!showParksLayer)}
              className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1 shadow-sm transition hidden sm:inline-flex ${
                showParksLayer
                  ? 'bg-white/95 text-stone-700 border border-orange-200'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] text-amber-500">park</span>
              Parks &amp; MRT
            </button>
          </div>

          <div className="pointer-events-auto">
            <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">speed</span>
              {busInfo.speedKmh} km/h
            </span>
          </div>
        </div>

        {/* Temporary Tooltip Banner if recentered */}
        {activeTooltip && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-fade-in pointer-events-none">
            {activeTooltip}
          </div>
        )}
      </div>
    </div>
  );
};
