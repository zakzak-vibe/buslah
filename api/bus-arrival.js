/**
 * BusLah! LTA DataMall v3 Bus Arrival Serverless Handler
 *
 * Endpoint:
 *   GET /api/bus-arrival?BusStopCode=83139&ServiceNo=15
 *
 * Supported Query Parameters:
 *   - BusStopCode (string, required): e.g. "83139", "53379", "20251"
 *   - ServiceNo (string, optional): e.g. "15", "54", "851", "176"
 *   - AccountKey (string, optional): LTA API key override for runtime testing
 *
 * Authentication:
 *   Reads process.env.LTA_ACCOUNT_KEY, process.env['<LTA_ACCOUNT_KEY>'],
 *   or incoming header 'x-lta-account-key'.
 */

function getApiKey(req) {
  // 1. Process environment variables
  let key =
    process.env.LTA_ACCOUNT_KEY ||
    process.env['<LTA_ACCOUNT_KEY>'] ||
    process.env.VITE_LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.lta_account_key;

  // 2. Request headers
  if (!key && req?.headers) {
    key =
      req.headers['x-lta-account-key'] ||
      req.headers['accountkey'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  }

  // 3. Query parameter override
  if (!key) {
    try {
      const url = new URL(req.url || '', 'http://localhost:3000');
      key =
        url.searchParams.get('AccountKey') ||
        url.searchParams.get('accountKey') ||
        url.searchParams.get('apiKey') ||
        req.query?.AccountKey ||
        req.query?.apiKey;
    } catch {
      // ignore
    }
  }

  if (!key) return null;

  return String(key)
    .trim()
    .replace(/^["'<]+|["'>]+$/g, '')
    .trim();
}

// Calculate remaining minutes and seconds until arrival based on ISO 8601 timestamp
function calculateEta(estimatedArrivalIso) {
  if (!estimatedArrivalIso) {
    return { minutes: -1, seconds: -1, isArriving: false, text: 'No Info' };
  }

  const arrivalTime = new Date(estimatedArrivalIso).getTime();
  const now = Date.now();
  const diffMs = arrivalTime - now;

  if (isNaN(arrivalTime)) {
    return { minutes: -1, seconds: -1, isArriving: false, text: 'Invalid Date' };
  }

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds <= 60) {
    return { minutes: 0, seconds: totalSeconds, isArriving: true, text: 'Arr' };
  }

  return {
    minutes,
    seconds,
    isArriving: false,
    text: `${minutes} min`,
  };
}

// Map LTA Load code to human-readable Singlish & standard format
function parseLoad(loadCode) {
  switch (loadCode) {
    case 'SEA':
      return { code: 'SEA', level: 'seats', label: 'Seats Steady', color: '#10b981' };
    case 'SDA':
      return { code: 'SDA', level: 'standing', label: 'Can Squeeze', color: '#f59e0b' };
    case 'LSD':
      return { code: 'LSD', level: 'full', label: 'Packed Sardine', color: '#ef4444' };
    default:
      return { code: 'SEA', level: 'seats', label: 'Seats Available', color: '#10b981' };
  }
}

// Map LTA Type code to deck description
function parseType(typeCode) {
  switch (typeCode) {
    case 'SD':
      return 'Single Deck';
    case 'DD':
      return 'Double Deck';
    case 'BD':
      return 'Bendy';
    default:
      return 'Double Deck';
  }
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-lta-account-key, AccountKey'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse query params safely from req.query or req.url
  let busStopCode = '53379';
  let serviceNo = '';

  try {
    const url = new URL(req.url || '', 'http://localhost:3000');
    busStopCode =
      req.query?.BusStopCode ||
      req.query?.busStopCode ||
      url.searchParams.get('BusStopCode') ||
      url.searchParams.get('busStopCode') ||
      '53379';
    serviceNo =
      req.query?.ServiceNo ||
      req.query?.serviceNo ||
      url.searchParams.get('ServiceNo') ||
      url.searchParams.get('serviceNo') ||
      '';
  } catch {
    busStopCode = req.query?.BusStopCode || '53379';
    serviceNo = req.query?.ServiceNo || '';
  }

  const apiKey = getApiKey(req);

  // Case 1: LTA_ACCOUNT_KEY is configured -> Query real LTA DataMall v3 endpoint
  if (apiKey) {
    try {
      const ltaUrl = new URL('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
      ltaUrl.searchParams.set('BusStopCode', String(busStopCode));
      if (serviceNo) {
        ltaUrl.searchParams.set('ServiceNo', String(serviceNo));
      }

      const response = await fetch(ltaUrl.toString(), {
        headers: {
          AccountKey: apiKey,
          accept: 'application/json',
          'User-Agent': 'BusLah/3.0 (Singapore Real-time Bus Telemetry)',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: true,
          liveData: false,
          status: response.status,
          message:
            response.status === 401
              ? 'LTA DataMall rejected the AccountKey (401 Unauthorized). Verify your LTA Account Key in Vercel settings.'
              : `LTA DataMall API error (${response.status}): ${response.statusText}`,
          details: errorText,
          source: 'lta_datamall',
        });
      }

      const data = await response.json();

      // Enrich services with precomputed ETA minutes, seconds, crowd, and deck labels
      const enrichedServices = (data.Services || []).map((service) => {
        const nextBuses = ['NextBus', 'NextBus2', 'NextBus3'].map((key) => {
          const bus = service[key];
          if (!bus || !bus.EstimatedArrival) return null;

          const eta = calculateEta(bus.EstimatedArrival);
          const load = parseLoad(bus.Load);
          const deck = parseType(bus.Type);

          return {
            ...bus,
            etaMinutes: eta.minutes,
            etaSeconds: eta.seconds,
            etaText: eta.text,
            isArriving: eta.isArriving,
            crowd: load.level,
            crowdLabel: load.label,
            deckType: deck,
            isWAB: bus.Feature === 'WAB',
          };
        });

        return {
          ...service,
          parsedArrivals: nextBuses.filter(Boolean),
        };
      });

      return res.status(200).json({
        success: true,
        liveData: true,
        source: 'lta_datamall_live',
        BusStopCode: data.BusStopCode || busStopCode,
        Services: data.Services || [],
        enrichedServices,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(502).json({
        error: true,
        liveData: false,
        message: `Failed to connect to LTA DataMall: ${err.message}`,
        source: 'lta_datamall',
      });
    }
  }

  // Case 2: LTA_ACCOUNT_KEY not configured
  // Provide realistic simulated telemetry so the app remains interactive,
  // with a clear note explaining how to add the key.
  const now = Date.now();
  const targetServices = serviceNo
    ? [serviceNo]
    : busStopCode === '53379'
    ? ['54', '13', '88', '74', '166', '410G']
    : busStopCode === '83139'
    ? ['15', '150']
    : busStopCode === '20251'
    ? ['176']
    : ['54', '851', '13', '88'];

  const mockServices = targetServices.map((srv, idx) => {
    const delay1 = (idx + 1) * 90 * 1000 + 15000;
    const delay2 = (idx + 7) * 90 * 1000 + 40000;
    const delay3 = (idx + 16) * 90 * 1000 + 20000;

    const arrival1 = new Date(now + delay1).toISOString();
    const arrival2 = new Date(now + delay2).toISOString();
    const arrival3 = new Date(now + delay3).toISOString();

    const nextBus = {
      OriginCode: '53009',
      DestinationCode: '05439',
      EstimatedArrival: arrival1,
      Monitored: 1,
      Latitude: '1.35482',
      Longitude: '103.85012',
      VisitNumber: '1',
      Load: idx % 3 === 0 ? 'SEA' : idx % 3 === 1 ? 'SDA' : 'SEA',
      Feature: 'WAB',
      Type: 'DD',
    };

    const nextBus2 = {
      OriginCode: '53009',
      DestinationCode: '05439',
      EstimatedArrival: arrival2,
      Monitored: 1,
      Latitude: '1.35920',
      Longitude: '103.84880',
      VisitNumber: '1',
      Load: idx % 2 === 0 ? 'SDA' : 'SEA',
      Feature: 'WAB',
      Type: 'SD',
    };

    const nextBus3 = {
      OriginCode: '53009',
      DestinationCode: '05439',
      EstimatedArrival: arrival3,
      Monitored: 1,
      Latitude: '1.36540',
      Longitude: '103.84310',
      VisitNumber: '1',
      Load: 'SEA',
      Feature: 'WAB',
      Type: 'DD',
    };

    const parsedArrivals = [nextBus, nextBus2, nextBus3].map((bus) => {
      const eta = calculateEta(bus.EstimatedArrival);
      const load = parseLoad(bus.Load);
      const deck = parseType(bus.Type);
      return {
        ...bus,
        etaMinutes: eta.minutes,
        etaSeconds: eta.seconds,
        etaText: eta.text,
        isArriving: eta.isArriving,
        crowd: load.level,
        crowdLabel: load.label,
        deckType: deck,
        isWAB: bus.Feature === 'WAB',
      };
    });

    return {
      ServiceNo: srv,
      Operator: srv === '851' || srv === '176' ? 'SMRT' : srv === '15' ? 'Go-Ahead' : 'SBS Transit',
      NextBus: nextBus,
      NextBus2: nextBus2,
      NextBus3: nextBus3,
      parsedArrivals,
    };
  });

  return res.status(200).json({
    success: true,
    liveData: false,
    source: 'simulated_fallback',
    note: 'LTA_ACCOUNT_KEY is not set in environment variables. Set LTA_ACCOUNT_KEY in Vercel to stream live LTA DataMall signals.',
    BusStopCode: busStopCode,
    Services: mockServices.map(({ ServiceNo, Operator, NextBus, NextBus2, NextBus3 }) => ({
      ServiceNo,
      Operator,
      NextBus,
      NextBus2,
      NextBus3,
    })),
    enrichedServices: mockServices,
    timestamp: new Date().toISOString(),
  });
}
