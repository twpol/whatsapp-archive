// Adapted from https://github.com/electron-userland/electron-webpack-quick-start/blob/master/src/main/index.js
import { app, BrowserWindow } from "electron";
import * as path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function createMainWindow() {
    const window = new BrowserWindow({
        webPreferences: {
            // Unfortunately no auto-reload for this :(
            preload: path.resolve(
                __dirname,
                "..",
                "..",
                "dist",
                "main",
                "preload.js",
            ),
        },
    });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    // Prevent WhatsApp from identifying us as special
    window.webContents.setUserAgent(
        window.webContents.getUserAgent().replace(/ Electron\/[0-9.]+/, ""),
    );

    // Prevent WhatsApp from installing a service worker, but only because
    // we can't adjust the user agent for service workers in Electron :(
    window.webContents.session.webRequest.onBeforeRequest(
        { urls: ["https://web.whatsapp.com/serviceworker.js"] },
        (details, callback) => {
            callback({ cancel: true });
        },
    );

    window.loadURL("https://web.whatsapp.com");

    window.on("closed", () => {
        mainWindow = null;
    });

    window.webContents.on("devtools-opened", () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow();
});
