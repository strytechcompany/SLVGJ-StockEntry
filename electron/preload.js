const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Print a small HTML label silently to the configured Windows printer.
  // The renderer passes any HTML; the main process loads it in a hidden
  // BrowserWindow and triggers webContents.print({ silent: true, ... }).
  printLabel: (html) => ipcRenderer.invoke("label:print", html),

  // Returns the list of installed printers so the staff/admin can verify
  // the LABEL_PRINTER_NAME in .env matches a real device.
  listPrinters: () => ipcRenderer.invoke("printers:list"),
});
