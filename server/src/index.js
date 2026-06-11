// Express server bootstrap. Called from electron/main.js once Electron is ready.
const express = require("express");
const cors = require("cors");

const config = require("./config");
const { initDatabase } = require("./db/init");
const requireSession = require("./middleware/requireSession");
const approvalService = require("./services/approval.service");
const salePoller = require("./services/salePoller.service");
const reportScheduler = require("./services/reportScheduler.service");

const authRoutes     = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const eventsRoutes   = require("./routes/events.routes");
const reportsRoutes  = require("./routes/reports.routes");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // Public
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRoutes);

  // Protected
  app.use("/products", requireSession, productsRoutes);
  app.use("/events",   requireSession, eventsRoutes);
  app.use("/reports",  requireSession, reportsRoutes);

  return app;
}

async function startServer({ port = config.apiPort } = {}) {
  await initDatabase();

  approvalService.startSweeper();
  salePoller.start();
  reportScheduler.start();

  const app = createApp();

  // Wrap listen in a Promise so EADDRINUSE (port already taken by a previous
  // crashed Electron instance) is caught and retried once after a short delay.
  async function listenWithRetry(retries = 1) {
    return new Promise((resolve, reject) => {
      const srv = app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`[server] listening on http://localhost:${port}`);
        // eslint-disable-next-line no-console
        console.log(`[server] db: ${config.dbPath}`);
        // eslint-disable-next-line no-console
        console.log(`[server] email configured: ${config.isEmailConfigured()}`);
        resolve(srv);
      });
      srv.once("error", (err) => {
        if (err.code === "EADDRINUSE" && retries > 0) {
          // eslint-disable-next-line no-console
          console.warn(`[server] port ${port} in use — retrying in 2s…`);
          srv.close();
          setTimeout(() => {
            listenWithRetry(retries - 1).then(resolve).catch(reject);
          }, 2000);
        } else {
          // eslint-disable-next-line no-console
          console.error(`[server] failed to start on port ${port}:`, err.message);
          reject(err);
        }
      });
    });
  }

  const server = await listenWithRetry(2);
  return { app, server };
}

module.exports = { createApp, startServer };
