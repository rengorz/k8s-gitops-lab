const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);
const state = { ready: true };
const app = createApp(state);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'lab-api listening', port }));
});

// Fail readiness first and keep serving until endpoints are updated, then close.
function shutdown(signal) {
  console.log(JSON.stringify({ level: 'info', msg: 'shutdown requested', signal }));
  state.ready = false;
  setTimeout(() => {
    server.close(() => {
      console.log(JSON.stringify({ level: 'info', msg: 'server closed' }));
      process.exit(0);
    });
  }, Number(process.env.SHUTDOWN_DELAY_MS || 5000));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
