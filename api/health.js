/**
 * BusLah! API Health Check & Monitoring Endpoint
 * Compatible with Vercel Serverless Functions and Node.js
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  const apiKeyConfigured = Boolean(process.env.LTA_ACCOUNT_KEY);

  let ltaProbe = {
    reachable: false,
    latencyMs: null,
    message: apiKeyConfigured
      ? 'Key configured'
      : 'LTA_ACCOUNT_KEY not set in environment variables (e.g. Vercel dashboard)',
  };

  // If LTA_ACCOUNT_KEY is configured, perform a lightweight probe to verify connectivity
  if (apiKeyConfigured) {
    try {
      const probeStart = Date.now();
      const response = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139&ServiceNo=15',
        {
          headers: {
            AccountKey: process.env.LTA_ACCOUNT_KEY,
            accept: 'application/json',
          },
          signal: AbortSignal.timeout(4000),
        }
      );

      ltaProbe = {
        reachable: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs: Date.now() - probeStart,
        message: response.ok
          ? 'Successfully connected to LTA DataMall v3 BusArrival'
          : `LTA responded with HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (err) {
      ltaProbe = {
        reachable: false,
        latencyMs: null,
        message: `LTA DataMall probe failed: ${err.message}`,
      };
    }
  }

  const healthData = {
    status: 'healthy',
    service: 'BusLah! Singapore Transit Telemetry API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    responseTimeMs: Date.now() - startTime,
    environment: {
      nodeVersion: process.version,
      ltaApiKeyConfigured: apiKeyConfigured,
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
        example: '/api/bus-arrival?BusStopCode=53379&ServiceNo=54',
      },
      {
        path: '/api/health',
        description: 'Health status and diagnostics for BusLah! API services',
      },
    ],
  };

  return res.status(200).json(healthData);
}
