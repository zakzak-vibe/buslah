import React from 'react';
import { BusArrivalInfo } from '../types/transit';

interface CrowdModalProps {
  isOpen: boolean;
  onClose: () => void;
  busInfo: BusArrivalInfo;
}

export const CrowdModal: React.FC<CrowdModalProps> = ({ isOpen, onClose, busInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-orange-200 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
            </span>
            <h3 className="text-lg font-black text-stone-900">
              LTA Live Crowd Telemetry • Bus {busInfo.busNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-900">Overall Status: Seats Steady</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">
              Confirm Got Seat Lah!
            </span>
          </div>

          {/* Upper Deck vs Lower Deck Visual Deck Meters */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Upper Deck (Aircon Shiok)</span>
                <span className="text-emerald-600 font-extrabold">18 / 53 Seats Free</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-[66%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Lower Deck (Accessible Zone)</span>
                <span className="text-amber-600 font-extrabold">4 Seats Free • 6 Standing</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full w-[88%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Wheelchair Bays (WAB)</span>
                <span className="text-emerald-700 font-extrabold">1 of 2 Bays Available</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[50%]"></div>
              </div>
            </div>
          </div>

          {/* Bus Weight Sensor Diagnostic */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Axle Weight Sensor:</span>
              <span className="font-bold text-stone-800">14.6 tonnes (61% load)</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Bus Fleet ID:</span>
              <span className="font-bold text-stone-800">{busInfo.arrivals[0].plateNumber || 'SBS 3288S'}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Telemetry Source:</span>
              <span className="font-bold text-stone-800">LTA DataMall Realtime API v3</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#d95e1e] hover:bg-[#b34810] text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            Got It Lah!
          </button>
        </div>
      </div>
    </div>
  );
};

interface TrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrafficModal: React.FC<TrafficModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-orange-200">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">videocam</span>
            </span>
            <h3 className="text-lg font-black text-stone-900">
              Bishan St 22 • Live Road Conditions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Visual Road condition banner matching Image 3 */}
        <div className="relative rounded-xl overflow-hidden mb-4 border border-orange-200 bg-stone-900">
          <div className="w-full h-48 bg-gradient-to-tr from-stone-800 via-stone-700 to-emerald-950 flex flex-col justify-end p-4 relative">
            {/* Visual simulation of Singapore bus corridor */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-black tracking-widest uppercase text-emerald-300">
                  ROAD CONDITION: SMOOTH TRAFFIC
                </span>
              </div>
              <p className="text-white text-xs font-bold">
                Bishan St 22 corridor clear • No roadworks detected
              </p>
              <p className="text-stone-300 text-[10px]">
                Opp Blk 245 corridor • Camera ID: LTA-CAM-53379
              </p>
            </div>
          </div>
        </div>

        {/* Traffic Telemetry Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 block text-[10px] font-bold">Corridor Speed</span>
            <span className="text-stone-900 font-black text-sm">38 km/h</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 block text-[10px] font-bold">Congestion</span>
            <span className="text-emerald-600 font-black text-sm">Very Low</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 block text-[10px] font-bold">Weather</span>
            <span className="text-stone-900 font-black text-sm">Fair 31°C</span>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#d95e1e] hover:bg-[#b34810] text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoRefreshInterval: number;
  onChangeRefreshInterval: (seconds: number) => void;
  onKeyUpdated?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  autoRefreshInterval,
  onChangeRefreshInterval,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = React.useState('');
  const [isTesting, setIsTesting] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState<any>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('buslah_lta_account_key') || '';
        setApiKeyInput(stored);
      } catch {
        // ignore
      }
      checkHealth();
    }
  }, [isOpen]);

  const checkHealth = async () => {
    setIsTesting(true);
    try {
      const headers: Record<string, string> = {};
      const stored = localStorage.getItem('buslah_lta_account_key');
      if (stored) headers['x-lta-account-key'] = stored;
      const res = await fetch('/api/health', { headers });
      const data = await res.json();
      setHealthStatus(data);
    } catch (e: any) {
      setHealthStatus({ status: 'unreachable', error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = () => {
    try {
      if (apiKeyInput.trim()) {
        localStorage.setItem('buslah_lta_account_key', apiKeyInput.trim());
      } else {
        localStorage.removeItem('buslah_lta_account_key');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onKeyUpdated?.();
      checkHealth();
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#d95e1e] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <h3 className="text-lg font-black text-stone-900">App Preferences &amp; API Key</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* LTA DataMall Key Section */}
          <div className="p-4 bg-gradient-to-br from-orange-50/70 to-amber-50/40 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs md:text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#d95e1e]">key</span>
                LTA DataMall Account Key
              </span>
              {healthStatus?.environment?.ltaApiKeyConfigured ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Key Detected
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Key Needed
                </span>
              )}
            </div>

            <p className="text-[11px] text-stone-600 mb-2.5">
              Enter your LTA DataMall Account Key below, or set it as{' '}
              <code className="bg-white/80 px-1 py-0.5 rounded text-[#d95e1e] font-mono">
                LTA_ACCOUNT_KEY
              </code>{' '}
              in your Vercel Project Settings.
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste LTA DataMall Key..."
                className="flex-1 px-3 py-2 bg-white rounded-xl text-xs font-mono border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#d95e1e]"
              />
              <button
                onClick={handleSaveKey}
                className="px-3.5 py-2 bg-[#d95e1e] hover:bg-[#b34810] text-white text-xs font-bold rounded-xl transition shadow-xs shrink-0 cursor-pointer"
              >
                {saveSuccess ? 'Saved!' : 'Save Key'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                onClick={checkHealth}
                disabled={isTesting}
                className="text-[#d95e1e] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[14px] ${isTesting ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>Test Live LTA Connection</span>
              </button>

              {apiKeyInput && (
                <button
                  onClick={() => {
                    setApiKeyInput('');
                    localStorage.removeItem('buslah_lta_account_key');
                    onKeyUpdated?.();
                    checkHealth();
                  }}
                  className="text-stone-400 hover:text-rose-600 transition"
                >
                  Clear key
                </button>
              )}
            </div>

            {/* Health status banner */}
            {healthStatus && (
              <div
                className={`mt-3 p-2.5 rounded-xl border text-xs ${
                  healthStatus.ltaDataMall?.probe?.reachable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : healthStatus.status === 'unauthorized'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-0.5">
                  <span>
                    API Status: <span className="uppercase">{healthStatus.status}</span>
                  </span>
                  {healthStatus.ltaDataMall?.probe?.latencyMs && (
                    <span className="font-mono text-[10px]">
                      {healthStatus.ltaDataMall.probe.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-snug">
                  {healthStatus.ltaDataMall?.probe?.message || healthStatus.error || 'Ready to stream.'}
                </p>
              </div>
            )}
          </div>

          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-xs md:text-sm font-bold text-stone-800 block">
                Transit Audio Chimes
              </span>
              <span className="text-[11px] text-stone-500">
                Play Singapore MRT arrival chimes on alerts
              </span>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                soundEnabled ? 'bg-[#d95e1e]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Refresh Interval */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs md:text-sm font-bold text-stone-800 block mb-1">
              Live Telemetry Refresh Interval
            </span>
            <p className="text-[11px] text-stone-500 mb-2">
              LTA DataMall updates feeds every 20 seconds. Recommended: 20s.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[15, 20, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onChangeRefreshInterval(sec)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    autoRefreshInterval === sec
                      ? 'bg-[#d95e1e] text-white border-[#d95e1e]'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-orange-50'
                  }`}
                >
                  {sec}s interval
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
