// IPC handlers for label printing.
//
// printLabel(html):
//   Spawns a hidden BrowserWindow loaded from a data: URL containing the
//   given HTML, then calls webContents.print(). When LABEL_PRINTER_NAME is
//   set in .env, the print runs silently to that exact printer; otherwise
//   the OS print dialog appears so the user can choose.
//
// listPrinters():
//   Forwards getPrintersAsync() so the renderer can verify the configured
//   printer name actually exists on the system.
const { ipcMain, BrowserWindow } = require("electron");

const config = require("../../server/src/config");

function registerPrinterIpc({ getMainWindow }) {
  ipcMain.handle("printers:list", async () => {
    const win = getMainWindow();
    if (!win) return [];
    try {
      // Electron 22+ uses getPrintersAsync; older versions use getPrinters.
      if (typeof win.webContents.getPrintersAsync === "function") {
        return await win.webContents.getPrintersAsync();
      }
      return win.webContents.getPrinters();
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("label:print", async (_event, html) => {
    if (typeof html !== "string" || !html.length) {
      return { ok: false, error: "html_required" };
    }

    const printerName = config.printer.name;

    // Hidden window dedicated to rendering the label.
    const labelWin = new BrowserWindow({
      show: false,
      webPreferences: { offscreen: false, sandbox: true },
    });

    try {
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
      await labelWin.loadURL(dataUrl);

      const printOptions = {
        silent: Boolean(printerName),
        printBackground: true,
        margins: { marginType: "none" },
      };
      if (printerName) printOptions.deviceName = printerName;

      const ok = await new Promise((resolve) => {
        labelWin.webContents.print(printOptions, (success, failureReason) => {
          if (!success) {
            // eslint-disable-next-line no-console
            console.error("[printer] print failed:", failureReason);
          }
          resolve(success);
        });
      });

      return { ok, printer: printerName || "(default)" };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      try { labelWin.destroy(); } catch { /* ignore */ }
    }
  });
}

module.exports = { registerPrinterIpc };
