/**
 * BusLah! API Health Check & Monitoring Endpoint
 * Compatible with Vercel Serverless Functions and Node.js
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

  // 3. Query parameter
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
      // ignore url parsing error
    }
  }

  if (!key) return null;

  return String(key)
    .trim()
    .replace(/^["'<]+|["'>]+$/g, '')
    .trim();
}

export default async function handler(req, res) {
  // Set CORS headers
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

  const startTime = Date.now();
  const apiKey = getApiKey(req);
  const apiKeyConfigured = Boolean(apiKey);

  let ltaProbe = {
    reachable: false,
    statusCode: null,
    latencyMs: null,
    message: apiKeyConfigured
      ? 'Key configured'
      : 'LTA_ACCOUNT_KEY not set in environment variables. Add to Vercel Settings -> Environment Variables or pass via x-lta-account-key header.',
  };

  let overallStatus = apiKeyConfigured ? 'healthy' : 'unconfigured';

  // If key is present, probe LTA DataMall v3 BusArrival endpoint
  if (apiKeyConfigured) {
    try {
      const probeStart = Date.now();
      const response = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15',
        {
          headers: {
            AccountKey: apiKey,
            accept: 'application/json',
            'User-Agent': 'BusLah/3.0 (Singapore Real-time Bus Telemetry)',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      const latencyMs = Date.now() - probeStart;
      ltaProbe.statusCode = response.status;
      ltaProbe.latencyMs = latencyMs;

      if (response.ok) {
        ltaProbe.reachable = true;
        ltaProbe.message = 'Successfully connected to LTA DataMall v3 BusArrival (200 OK)';
        overallStatus = 'healthy';
      } else {
        ltaProbe.reachable = false;
        overallStatus = response.status === 401 ? 'unauthorized' : 'error';
        ltaProbe.message =
          response.status === 401
            ? 'LTA DataMall rejected the AccountKey with HTTP 401 Unauthorized. Verify your LTA key.'
            : `LTA DataMall responded with HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (err) {
      ltaProbe.reachable = false;
      overallStatus = 'unreachable';
      ltaProbe.message = `LTA DataMall connection failed: ${err.message}`;
    }
  }

  const healthData = {
    status: overallStatus,
    service: 'BusLah! Singapore Transit Telemetry API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    responseTimeMs: Date.now() - startTime,
    environment: {
      nodeVersion: process.version,
      ltaApiKeyConfigured: apiKeyConfigured,
      keyMasked: apiKeyConfigured ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null,
      platform: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js / Local',
    },
    ltaDataMall: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
      probe: ltaProbe,
    },
    availableEndpoints: [
      {
        path: '/api/bus-arrival',
        description: 'Fetch real-time bus arrivals by BusStopCode & optional ServiceNo',
        example: '/api/bus-arrival?BusStopCode=83139&ServiceNo=15',
      },
      {
        path: '/api/health',
        description: 'Health status and diagnostics for BusLah! API services',
      },
    ],
  };

  const httpStatus = overallStatus === 'healthy' || overallStatus === 'unconfigured' ? 200 : 502;
  return res.status(httpStatus).json(healthData);
}
