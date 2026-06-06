# 💎 Jewelry Stock Entry App

A modern, high-performance desktop application for **Jewelry Stock Entry**, designed as part of a integrated suite sharing a local database. The application is built using **Electron**, **React (Vite)**, **Express**, and **SQLite3**.

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Architecture Overview](#-architecture-overview)
3. [Prerequisites](#-prerequisites)
4. [Project Structure](#-project-structure)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Database Setup & Schema](#-database-setup--schema)
8. [Owner-Approval Workflows (2FA)](#-owner-approval-workflows-2fa)
9. [Silent Printing & Barcodes](#-silent-printing--barcodes)
10. [Automated Reporting](#-automated-reporting)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Key Features

*   **Integrated Desktop Client**: Runs inside an Electron shell with full native capabilities.
*   **Dual Mode Dev Server**: Runs React (Vite) and Node/Express backend servers concurrently.
*   **Shared SQLite Database**: Accesses a single shared SQLite file (defaulting to a shared ProgramData path) synchronizing inventory, customers, and transactions seamlessly across Stock Entry, Billing, and Admin modules.
*   **Owner-Approval (2FA) Security**: Triggers a 6-digit code for high-privilege operations (e.g., Staff login, editing products, deleting products) sent to the owner's email. Supports developer console fallbacks for fast testing.
*   **Silent Thermal Label Printing**: Connects to raw Bluetooth/USB thermal label printers and prints HTML-rendered labels silently, or falls back to system-wide printing layouts.
*   **Monthly Automated Reports**: Sends monthly inventory summaries and an attached `.xlsx` spreadsheet of in-stock items directly to the owner via SMTP cron jobs.
*   **Real-Time Sale Polling**: Actively polls the shared DB to catch billing events and mark inventory items as `sold` or `returned` automatically.

---

## 🏗️ Architecture Overview

The system consists of three distinct layers:
```
  ┌────────────────────────────────────────────────────────────┐
  │                       ELECTRON SHELL                       │
  │  (Creates Window, Preloads IPC, Manages Native Printing)   │
  └─────────────┬──────────────────────────────┬───────────────┘
                │ IPC Handles                  │ Localhost (5173)
  ┌─────────────▼──────────────┐  ┌────────────▼───────────────┐
  │      EXPRESS BACKEND       │  │        VITE + REACT        │
  │    (Port 3001, SQLite,     │  │       FRONTEND UI          │
  │   Cron, Email, Pollers)    │  │ (Staff Panels & Barcodes)  │
  └─────────────┬──────────────┘  └────────────────────────────┘
                │ SQLite WAL
  ┌─────────────▼──────────────┐
  │     SHARED DATABASE        │
  │  (gold_system.db in WAL)   │
  └────────────────────────────┘
```

1.  **Electron (Main Process)**: Manages window lifecycle, launches the Express backend on boot, registers IPC handlers for silent barcode printing, and opens developer tools in development mode.
2.  **Express Backend**: Handles database transactions, authentication, session tokens, owner emails, cron reports, and background polling.
3.  **Vite + React (Renderer)**: Standard SPA React frontend talking to the Express backend port.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
*   [Git](https://git-scm.com/)

---

## 📁 Project Structure

```
Stock_Entry/
├── db/
│   └── schema.sql             # Shared SQLite schema definition
├── docs/                      # UI design references and screenshots
├── electron/
│   ├── main.js                # Electron main window lifecycle & Express server launcher
│   ├── preload.js             # Electron bridge API exposing printing & IPC tools to React
│   └── ipc/
│       └── printer.js         # Silent print & printer list IPC commands
├── renderer/                  # React Frontend App
│   ├── src/                   # React components, routing, CSS layout
│   └── vite.config.js         # Vite dev configuration
├── server/                    # Express Backend App
│   ├── src/
│   │   ├── config.js          # Unified environment loader
│   │   ├── controllers/       # Auth, products, events, and reports controller logic
│   │   ├── db/
│   │   │   ├── client.js      # SQLite connection wrapped in promises (WAL/Foreign Keys)
│   │   │   └── init.js        # Schema loader runs schema.sql on boot
│   │   ├── middleware/        # Session token guards
│   │   └── services/          # Mailers, crons, sales-polling, and auth sweepers
│   └── .env                   # Local configuration file (git-ignored)
└── package.json               # Main orchestration script and dependencies
```

---

## 🚀 Getting Started & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Stock_Entry
```

### 2. Install Project Dependencies
Run the standard package manager command:
```bash
npm install
```

> [!NOTE]
> Since the project uses SQLite3 native node bindings, if you experience installation or runtime crashes on load, run:
> ```bash
> npm rebuild
> ```
> This compiles the binary modules for your local architecture.

### 3. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
copy .env.example .env
```
Open `.env` in your editor and fill in your custom configurations. (See [Environment Variables](#-environment-variables-reference) below).

### 4. Running the App in Development Mode
To run Vite and Electron concurrently, use:
```bash
npm run dev
```
*   The Vite dev server will boot on `http://localhost:5173/`.
*   The Express backend will start listening on `http://localhost:3001/` (or the configured `API_PORT`).
*   The SQLite DB will be automatically created and initialized if it does not exist.
*   The Electron application window will launch, automatically loading the Vite app.

### 5. Running the Production Build
To test the production compilation:
```bash
npm run build:renderer
npm run start
```

---

## ⚙️ Environment Variables Reference

A `.env` file must be present at the root of the project. Here are the available variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `API_PORT` | `3001` | Express API listening port. |
| `DB_PATH` | `C:/ProgramData/JewelrySuite/gold_system.db` | Absolute path to the shared SQLite database file. |
| `GMAIL_USER` | `""` | The Gmail address used to send verification codes & monthly reports. |
| `GMAIL_APP_PASSWORD` | `""` | A 16-character Gmail "App Password" (NOT your regular password). |
| `OWNER_EMAIL` | `""` | The recipient address where verification codes and reports are sent. |
| `EMAIL_FROM_NAME` | `Jewelry Stock Entry` | Friendly header name shown in the email "From" field. |
| `CODE_TTL_MINUTES` | `10` | The lifespan of generated approval codes in minutes. |
| `SALE_POLL_MS` | `3000` | Sync frequency (milliseconds) to check DB for sale events. |
| `SESSION_TTL_HOURS` | `8` | Expiry of active staff login session (hours). |
| `LABEL_PRINTER_NAME` | `""` | Windows Printer Name. If empty, silent printing is disabled and the OS dialog shows. |

---

## 🗄️ Database Setup & Schema

### Automatic Migration
You do **not** need to manually import database SQL files. On start, the app runs `initDatabase()` (defined in [init.js](file:///server/src/db/init.js)) which reads [schema.sql](file:///db/schema.sql) and executes it on the database file. All table creations are protected with `IF NOT EXISTS` to preserve existing records.

### Schema Details
The database is structured to share tables between multiple frontend platforms. The main tables include:

1.  **`products`**: Inventory items. Links weights (`gross_weight`, `stone_weight`, `net_weight`), purity, billing costs (`buying_cost`, `bore_rate`), pricing, current stock, and statuses (`in_stock`, `sold`, `deleted`).
2.  **`pending_actions`**: Pending changes queue. Used to record 2FA requests (type: `login`, `edit`, `delete`) with a SHA256 hashed 6-digit approval code.
3.  **`audit_log`**: Detailed ledger of system logs tracking changes by actor (staff, owner, billing, system).
4.  **`stock_events`**: Relational queue populated by Billing when sales/returns occur. The Stock Entry daemon polls and processes these records.
5.  **`bills`**, **`bill_items`**, **`payments`**, **`debts`**, **`debt_transactions`**: System tables storing customer invoices, payments, and credit transactions.

---

## 🛡️ Owner-Approval Workflows (2FA)

To modify stock or log in, staff must obtain permission from the owner:
1.  **Request Stage**: Action (e.g., Staff login) is requested. The app generates a cryptographically random 6-digit code.
2.  **Hashed Queue**: The code is hashed using SHA256 and stored in `pending_actions` along with the action metadata and expires in 10 minutes.
3.  **Owner Email**: Plaintext code is emailed to the configured `OWNER_EMAIL`.
4.  **Developer Fallback**: If SMTP variables (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `OWNER_EMAIL`) are empty, the Express server falls back to Dev Mode. The code will be printed to the backend command terminal and returned as `devCode` inside the HTTP response.
5.  **Validation**: Staff enters the 6-digit code in the UI, Express verifies the hash, consumes the action, and marks it as `approved`.

---

## 🖨️ Silent Printing & Barcodes

The app uses `bwip-js` in the React frontend to generate high-quality barcodes, and sends custom print templates to Electron:
*   **Silent Printing**: If `LABEL_PRINTER_NAME` is configured to match a physical printer on your system, the app prints label templates instantly behind the scenes without user prompts.
*   **Fallback Dialog**: If `LABEL_PRINTER_NAME` is left blank, the standard system Print Dialog is shown to choose a printer.
*   **Verification**: Electron provides an IPC handler (`printers:list`) that queries all active local devices so you can confirm the exact naming.

---

## 📊 Automated Reporting

The server maintains a task cron using `node-cron`:
*   At midnight on the 1st of every month, it compiles a summary of active inventory.
*   Uses `exceljs` to generate a formatted `.xlsx` spreadsheet of all current in-stock jewelry items.
*   Sends a summary email to the owner containing total stock count, gross weights, and monthly activity, with the spreadsheet attached.

---

## 🔧 Troubleshooting & FAQ

### Q: Database path cannot be initialized.
Make sure you have write privileges in the parent directory path configured in `DB_PATH`. For the default `C:/ProgramData/JewelrySuite/` path, the app will automatically attempt to create the folder directory on startup.

### Q: Nodemailer fails to send emails.
Google requires **App Passwords** for third-party scripts.
1. Go to your Google Account Settings -> Security.
2. Under "How you sign in to Google", select **2-Step Verification**.
3. Scroll to the bottom and select **App passwords**.
4. Enter a name (e.g., "Stock Entry") and generate. Copy the 16-character code into your `GMAIL_APP_PASSWORD` in `.env`.

### Q: Native sqlite3 compilation issues.
If you switch Node.js versions or run on a mismatching CPU architecture, SQLite bindings may throw errors. Resolve by running:
```bash
npm install -g node-gyp
npm rebuild
```
