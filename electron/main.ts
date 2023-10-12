import { app, BrowserWindow, ipcMain } from "electron";
import { promises as fs } from 'fs';


function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            plugins: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            backgroundThrottling: false,
            webSecurity: false
        } as Electron.WebPreferences /* fix macos issue */
    });

    // mainWindow.removeMenu();
    // mainWindow.setMenu(null);

    mainWindow.loadURL('http://localhost:3000');
}


app.whenReady().then(() => {
    // ipcMain.on('set-counter', handleSetCounter);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


////////////////////////////////////////////////////////////////////////////////


interface CounterStartingPoint {
    counterStartingPoint: number;
};

class Storage {
    readonly path = "~/Desktop/counter.json";
    // readonly path = "./counter.json";
    readonly initDbValue: CounterStartingPoint = {"counterStartingPoint": 5};

    async read(): Promise<CounterStartingPoint> {
        let buffer: Buffer;
        try {
            buffer = await fs.readFile(this.path);
        }
        catch (error: any) {
            return this.write(this.initDbValue);
        }

        const json: CounterStartingPoint = JSON.parse(buffer.toString());
        if (typeof json.counterStartingPoint === "number") {
            return json;
        }
        throw new Error("Invalid storage");
    }

    async write(value: CounterStartingPoint): Promise<CounterStartingPoint> {
        await fs.writeFile(this.path, JSON.stringify(value));
        return value;
    }
};


const storage = new Storage();


ipcMain.on("init-counter", async (event: Electron.IpcMainEvent) => {
    console.log("init-counter");

    try {
        const value = await storage.read();
        event.reply('set-counter', value.counterStartingPoint);
    }
    catch (error: any) {
        event.reply('set-error');
    }
});

ipcMain.on('set-counter', async (event: Electron.IpcMainEvent, delta: number) => {
    console.log("set-counter", delta);

    try {
        let value = await storage.read();
        value.counterStartingPoint += delta;
        value = await storage.write(value);
        event.reply('set-counter', value.counterStartingPoint);
    }
    catch (error: any) {
        event.reply('set-error');
    }
});

ipcMain.on('reset-counter', async (event: Electron.IpcMainEvent) => {
    console.log("reset-counter");

    try {
        const value = await storage.write({"counterStartingPoint": 0});
        event.reply('set-counter', value.counterStartingPoint);
    }
    catch (error: any) {
        event.reply('set-error');
    }
});
