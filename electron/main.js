const path = require("path");
const { app, BrowserWindow } = require("electron");

const { startServer } = require("../server/src");
const { registerPrinterIpc } = require("./ipc/printer");

const isDev = !app.isPackaged;

let mainWindow;
let apiServer;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#FFFBF7", // cream-50
    title: "Jewelry Stock Entry",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.resolve(__dirname, "..", "renderer", "dist", "index.html");
    await mainWindow.loadFile(indexHtml);
  }
}

app.whenReady().then(async () => {
  try {
    apiServer = await startServer();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[electron] failed to start API server:", err);
  }

  registerPrinterIpc({ getMainWindow: () => mainWindow });

  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  try {
    apiServer?.server?.close();
  } catch {
    // ignore
  }
});
