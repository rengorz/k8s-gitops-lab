const express = require('express');
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

function createApp(state = { ready: true }) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    if (req.path === '/metrics') return next();
    const end = httpDuration.startTimer();
    res.on('finish', () => {
      // Raw paths of unmatched requests would create unbounded label cardinality.
      const route = req.route ? req.route.path : 'unmatched';
      const labels = { method: req.method, route, status: String(res.statusCode) };
      httpRequests.inc(labels);
      end(labels);
    });
    next();
  });

  app.get('/api/health/live', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/health/ready', (_req, res) =>
    state.ready ? res.json({ status: 'ready' }) : res.status(503).json({ status: 'shutting-down' })
  );

  app.get('/api/info', (_req, res) =>
    res.json({
      app: 'lab-api',
      version: process.env.APP_VERSION || 'dev',
      environment: process.env.APP_ENV || 'local',
      pod: process.env.POD_NAME || 'local',
      node: process.env.NODE_NAME || 'local',
      time: new Date().toISOString(),
    })
  );

  const items = [{ id: 1, name: 'First item' }];
  app.get('/api/items', (_req, res) => res.json(items));
  app.post('/api/items', (req, res) => {
    const name = (req.body && req.body.name || '').toString().trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    const item = { id: items.length ? items[items.length - 1].id + 1 : 1, name };
    items.push(item);
    res.status(201).json(item);
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return app;
}

module.exports = { createApp, register };
