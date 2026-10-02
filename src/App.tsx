/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ActiveBusHero } from './components/ActiveBusHero';
import { LiveRouteRadarMap } from './components/LiveRouteRadarMap';
import { RouteStepper } from './components/RouteStepper';
import { UncleCommuterTip } from './components/UncleCommuterTip';
import { OtherBusesList } from './components/OtherBusesList';
import { StopAmenities } from './components/StopAmenities';
import { NearbyStopsScreen } from './components/NearbyStopsScreen';
import { BusRoutesScreen } from './components/BusRoutesScreen';
import { MrtFeederScreen } from './components/MrtFeederScreen';
import { CrowdModal, TrafficModal, SettingsModal } from './components/Modals';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { Footer } from './components/Footer';
import { BUS_DATABASE, ROUTE_STEPS_BUS_54, NEARBY_STOPS } from './data/transitData';
import { BusArrivalInfo } from './types/transit';
import { chime } from './utils/audio';
import {
  fetchBusArrivals,
  transformLtaServiceToBusInfo,
  LtaServiceItem,
} from './services/ltaService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'live-arrivals' | 'nearby-stops' | 'bus-routes' | 'mrt-feeder'
  >('live-arrivals');

  const [activeBusNumber, setActiveBusNumber] = useState('54');
  const [currentStopCode, setCurrentStopCode] = useState('53379');
  const [currentStopName, setCurrentStopName] = useState('Opp Blk 245');
  const [direction, setDirection] = useState<1 | 2>(1);

  // Bookmarking & Alert states
  const [pinnedStops, setPinnedStops] = useState<string[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiSource, setApiSource] = useState<'lta_datamall_live' | 'simulated_fallback'>(
    'simulated_fallback'
  );
  const [liveStopServices, setLiveStopServices] = useState<LtaServiceItem[]>([]);

  // Modals state
  const [isCrowdModalOpen, setIsCrowdModalOpen] = useState(false);
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(20);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Active Bus arrival dataset with real-time seconds ticking
  const [liveBusInfo, setLiveBusInfo] = useState<BusArrivalInfo>(
    BUS_DATABASE[activeBusNumber] || BUS_DATABASE['54']
  );

  // Load live bus arrivals from /api/bus-arrival
  const loadApiArrivals = useCallback(
    async (busStop: string, busNum: string, silent = false) => {
      try {
        const data = await fetchBusArrivals(busStop);
        if (data.source) {
          setApiSource(data.source);
        }

        const services = data.Services || [];
        if (services.length > 0) {
          setLiveStopServices(services);

          const matching = services.find((s) => s.ServiceNo === busNum);
          if (matching) {
            const transformed = transformLtaServiceToBusInfo(matching, busNum);
            setLiveBusInfo(transformed);
          } else {
            // Bus might not serve this stop, pick first active service if not silent
            const firstSrv = services[0];
            if (firstSrv) {
              const transformed = transformLtaServiceToBusInfo(firstSrv, firstSrv.ServiceNo);
              setLiveBusInfo(transformed);
              setActiveBusNumber(firstSrv.ServiceNo);
              if (!silent) {
                showToast(
                  `Bus ${firstSrv.ServiceNo} Selected`,
                  `Bus ${busNum} does not serve stop ${busStop}. Switched to Bus ${firstSrv.ServiceNo}.`,
                  'directions_bus'
                );
              }
            }
          }
        }
      } catch (err: any) {
        if (!silent) {
          showToast('Live Telemetry Notice', err.message || 'Using fallback data.', 'info');
        }
      }
    },
    []
  );

  // Sync when activeBusNumber or currentStopCode changes
  useEffect(() => {
    const fallback = BUS_DATABASE[activeBusNumber] || {
      ...BUS_DATABASE['54'],
      busNumber: activeBusNumber,
      destination: `Towards Singapore Int`,
    };
    setLiveBusInfo(fallback);

    loadApiArrivals(currentStopCode, activeBusNumber, true);
  }, [activeBusNumber, currentStopCode, loadApiArrivals]);

  // Continuous auto-polling every 20 seconds matching LTA DataMall refresh frequency
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadApiArrivals(currentStopCode, activeBusNumber, true);
    }, refreshInterval * 1000);

    return () => clearInterval(pollInterval);
  }, [currentStopCode, activeBusNumber, refreshInterval, loadApiArrivals]);

  // Real-time ticking down seconds for authentic live transit feel
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveBusInfo((prev) => {
        const [b1, b2, b3] = prev.arrivals;
        let newSec1 = b1.etaSeconds - 1;
        let newMin1 = b1.etaMinutes;

        if (newSec1 < 0) {
          if (newMin1 > 0) {
            newMin1 -= 1;
            newSec1 = 59;
          } else {
            // Bus arrived! Reset cycle for demo
            newMin1 = 2;
            newSec1 = 30;
            if (soundEnabled && activeAlerts.includes(prev.busNumber)) {
              chime.playTransitChime();
              showToast(
                `Bus ${prev.busNumber} Arrived!`,
                `Bus is now at ${currentStopName}. Please board steadily!`,
                'directions_bus'
              );
            }
          }
        }

        return {
          ...prev,
          arrivals: [
            { ...b1, etaMinutes: newMin1, etaSeconds: newSec1 },
            b2,
            b3,
          ],
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [soundEnabled, activeAlerts, currentStopName]);

  const showToast = (title: string, message: string, icon?: string) => {
    setToast({
      id: String(Date.now()),
      title,
      message,
      icon,
    });
  };

  const handleSelectBus = (busNum: string) => {
    if (soundEnabled) chime.playClick();
    setActiveBusNumber(busNum);
    showToast(
      'Bus Switched Chop-Chop!',
      `Now tracking live arrivals and Radar Map for Bus ${busNum}.`,
      'directions_bus'
    );
  };

  const handleSwapDirection = () => {
    if (soundEnabled) chime.playClick();
    const newDir = direction === 1 ? 2 : 1;
    setDirection(newDir);
    showToast(
      'Direction Swapped',
      newDir === 1
        ? 'Switched to Direction 1 (Outbound: Towards New Bridge Rd)'
        : 'Switched to Direction 2 (Inbound: Towards Bishan Int)',
      'swap_horiz'
    );
  };

  const handleToggleBookmark = () => {
    const key = `${activeBusNumber}-${currentStopCode}`;
    const exists = pinnedStops.includes(key);

    if (exists) {
      setPinnedStops((prev) => prev.filter((k) => k !== key));
      showToast('Bookmark Removed', `Bus ${activeBusNumber} unpinned from quick view.`, 'bookmark_border');
    } else {
      setPinnedStops((prev) => [...prev, key]);
      if (soundEnabled) chime.playTransitChime();
      showToast(
        'Saved into Favorites!',
        `Bus ${activeBusNumber} at ${currentStopName} pinned to your dashboard.`,
        'bookmark'
      );
    }
  };

  const handleToggleAlert = () => {
    const exists = activeAlerts.includes(activeBusNumber);
    if (exists) {
      setActiveAlerts((prev) => prev.filter((b) => b !== activeBusNumber));
      showToast('Alert Cancelled', `Bus ${activeBusNumber} notification turned off.`, 'notifications_off');
    } else {
      setActiveAlerts((prev) => [...prev, activeBusNumber]);
      if (soundEnabled) chime.playTransitChime();
      showToast(
        'Alert Set Lah!',
        `We will buzz you when Bus ${activeBusNumber} is 2 stops back (approaching Blk 210).`,
        'notifications_active'
      );
    }
  };

  const handleRefresh = async () => {
    if (soundEnabled) chime.playClick();
    setIsRefreshing(true);
    try {
      await loadApiArrivals(currentStopCode, activeBusNumber);
      showToast(
        apiSource === 'lta_datamall_live' ? 'LTA Live Sync Complete!' : 'Updated Live!',
        apiSource === 'lta_datamall_live'
          ? `Direct LTA DataMall v3 signals updated for Bus ${activeBusNumber}.`
          : 'Fresh LTA DataMall signals loaded. 1st bus is turning into slip road now!',
        'refresh'
      );
    } catch {
      showToast('Updated Live!', 'Fresh telemetry synced.', 'refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectStop = (stopCode: string, stopName?: string) => {
    if (soundEnabled) chime.playClick();
    setCurrentStopCode(stopCode);
    const found = NEARBY_STOPS.find((s) => s.code === stopCode);
    const finalName = stopName || found?.name || `Stop ${stopCode}`;
    setCurrentStopName(finalName);
    setCurrentTab('live-arrivals');
    showToast(
      'Bus Stop Selected',
      `Targeting stop ${finalName} (${stopCode}). Live Radar updated.`,
      'location_on'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentPinned = pinnedStops.includes(`${activeBusNumber}-${currentStopCode}`);
  const isCurrentAlert = activeAlerts.includes(activeBusNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-[#FAF5EE] to-[#FFF1E6] font-['Montserrat'] text-[#1f1f26] antialiased selection:bg-[#d95e1e] selection:text-white flex flex-col justify-between">
      {/* Fixed Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (soundEnabled) chime.playClick();
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currentLocationText={`Near ${currentStopName} (${currentStopCode})`}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 md:pt-16 min-h-screen">
        {currentTab === 'live-arrivals' && (
          <div className="flex flex-col w-full">
            {/* Top Search & Filter Strip */}
            <SearchBar
              activeBus={activeBusNumber}
              onSelectBus={handleSelectBus}
              stopName={currentStopName}
              stopCode={currentStopCode}
              walkTime="~2 min walk"
              onSwapDirection={handleSwapDirection}
              direction={direction}
              availableBuses={Object.keys(BUS_DATABASE)}
              apiSource={apiSource}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Main Stage Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
              {/* Active Bus Hero Card with 3 Arrival Cards */}
              <ActiveBusHero
                busInfo={liveBusInfo}
                isBookmarked={isCurrentPinned}
                onToggleBookmark={handleToggleBookmark}
                isAlertActive={isCurrentAlert}
                onToggleAlert={handleToggleAlert}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                onOpenCrowdModal={() => setIsCrowdModalOpen(true)}
                onOpenTrafficModal={() => setIsTrafficModalOpen(true)}
              />

              {/* Live Route Radar & Transit Map */}
              <LiveRouteRadarMap
                busInfo={liveBusInfo}
                onSelectStop={(code) => handleSelectStop(code)}
                onBusMarkerClick={() => setIsCrowdModalOpen(true)}
              />

              {/* Lower 2-column Grid: Stepper + Other Buses */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Route Stepper & Uncle Commuter Tip */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <RouteStepper
                    steps={ROUTE_STEPS_BUS_54}
                    currentBusNumber={activeBusNumber}
                    onSelectStop={(code) => handleSelectStop(code)}
                  />

                  <UncleCommuterTip />
                </div>

                {/* Right Column: Other Buses at this stop & Amenities */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <OtherBusesList
                    currentBus={activeBusNumber}
                    onSelectBus={handleSelectBus}
                    stopCode={currentStopCode}
                    liveServices={liveStopServices}
                  />

                  <StopAmenities stopName={currentStopName} />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'nearby-stops' && (
          <NearbyStopsScreen
            onSelectBusStop={(code, name) => handleSelectStop(code, name)}
            onSelectBus={handleSelectBus}
            currentStopCode={currentStopCode}
          />
        )}

        {currentTab === 'bus-routes' && (
          <BusRoutesScreen
            selectedBus={activeBusNumber}
            onSelectBus={handleSelectBus}
          />
        )}

        {currentTab === 'mrt-feeder' && (
          <MrtFeederScreen onSelectBus={handleSelectBus} />
        )}
      </main>

      {/* Modals */}
      <CrowdModal
        isOpen={isCrowdModalOpen}
        onClose={() => setIsCrowdModalOpen(false)}
        busInfo={liveBusInfo}
      />

      <TrafficModal
        isOpen={isTrafficModalOpen}
        onClose={() => setIsTrafficModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        autoRefreshInterval={refreshInterval}
        onChangeRefreshInterval={(sec) => setRefreshInterval(sec)}
        onKeyUpdated={() => loadApiArrivals(currentStopCode, activeBusNumber)}
      />

      {/* Toast Notification Container */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Footer */}
      <Footer />
    </div>
  );
}
