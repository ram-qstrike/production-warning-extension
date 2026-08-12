# Production Environment Warning

A lightweight Chrome extension that displays a warning whenever a user accesses a configured production environment.

## Why This Was Created

Developers and QA frequently switch between local, development, QA, staging, and production environments.

It is easy to accidentally perform testing or debugging on a live production system.

This extension was created as a simple safety reminder:

> **You are on production. Make sure you intended to test here.**

The extension displays a warning modal when a configured production hostname is detected. After the warning disappears, a small `PRODUCTION — LIVE ENVIRONMENT` badge remains visible.

## Features

- Detects configured production websites
- Supports multiple production domains
- Supports child subdomains
- Displays a production warning modal
- Shows the current hostname
- Five-second warning countdown
- Displays a persistent production badge
- Stores the warning date in `localStorage`
- Shows production information in the browser console
- Provides developer commands for resetting the warning
- Provides a developer command for checking the current status

## Project Structure

```text
production-warning-extension/
├── manifest.json
├── content.js
├── commands.js
├── background.js
├── warning.css
├── icon16.png
├── icon24.png
├── icon32.png
├── icon48.png
└── icon128.png
```

## Clone

```bash
git clone https://github.com/ram-qstrike/production-warning-extension.git
cd production-warning-extension
```

## Production Website List

Production websites are configured directly in `content.js`:

```javascript
const PRODUCTION_HOSTS = [
  "qx7.prolook.com",

  // Add more production websites here
  // "www.google.com",
];
```

Only use the hostname:

```text
"qx7.prolook.com"
```

Do not include:

```text
"https://qx7.prolook.com/"
```

or:

```text
"qx7.prolook.com/login"
```

Child subdomains are automatically supported.

For example:

```text
"example.com"
```

will match:

```text
example.com
www.example.com
app.example.com
admin.example.com
```

## Install on Google Chrome

1. Open:

```text
chrome://extensions
```

2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project folder containing `manifest.json`.
5. The extension will be installed.

After changing the extension code, return to:

```text
chrome://extensions
```

and click **Reload**.

## Developer Commands

The extension displays the following three commands in the browser console:

```text
DEVELOPER COMMANDS

Reset the warning for the current domain:
localStorage.removeItem("productionWarningLastShown");

Reset production warnings:
resetProductionWarnings();

Check current status:
productionWarningStatus();
```

## Reset the Warning for the Current Domain

```javascript
localStorage.removeItem("productionWarningLastShown");
```

This removes the production warning record for the current domain.

Refresh the page to show the warning modal again.

## Reset Production Warnings

```javascript
resetProductionWarnings();
```

This resets the production warning records for the configured production domains.

Use this when you want the production warning to appear again across the configured production environments.

## Check Current Status

```javascript
productionWarningStatus();
```

This displays the current production warning status in the browser console, including information about the saved warning record.

## How It Works

When a configured production hostname is detected, the extension checks:

```text
productionWarningLastShown
```

If no warning has been recorded for the current day, the warning modal is displayed.

The extension stores information such as:

```javascript
{
  date: "2026-08-13",
  localTime: "8/13/2026, 1:25:29 AM",
  timestamp: "2026-08-12T17:25:29.502Z",
  hostname: "qx7.prolook.com",
  url: "https://qx7.prolook.com/login"
}
```

If the warning has already been displayed that day, the modal is skipped and the production badge remains visible.

## Important

This extension is a **visual safety reminder**.

It does not:

- Block access to production
- Prevent HTTP requests
- Modify application behavior
- Protect production data
- Replace proper environment controls

Its purpose is to make it immediately obvious when you are working on a live environment.

> **PRODUCTION — LIVE ENVIRONMENT.**

## License

This project is open source.
