const { app, BrowserWindow } = require('electron');

const fs       = require("fs");
const path     = require('path');
const cfg_file = path.join(__dirname, 'clock.json');
const isDebug  = false;

let win;
var opts = {};

var winOpts = { 
    width: 340, 
    height: 120, 
    alwaysOnTop: true, 
    icon: path.join(__dirname, "sound", 'clock.png')
}

if (!isDebug) {
    winOpts['resizable'] = false;
} else {
    winOpts['height'] = 400; 

}

// Load CFG
if (fs.existsSync(cfg_file)) {
    if (opts) {
        opts = JSON.parse( fs.readFileSync(cfg_file, "utf8") );
        if ("x" in opts) winOpts["x"] = parseInt(opts.x);
        if ("y" in opts) winOpts["y"] = parseInt(opts.y);
    }
}

// Update opts with window pos
function updateWinPos(sender) {
    opts["x"] = sender.getPosition()[0];
    opts["y"] = sender.getPosition()[1]-25;
}

function createWindow () {
    win = new BrowserWindow(winOpts);
    win.setMenu(null);
    win.loadFile('index.html')
    
    if (isDebug) {
        win.webContents.openDevTools()
    }

    win.on('closed', () => {
        fs.writeFileSync(cfg_file, JSON.stringify(opts));
        win = null
    })
    
    setInterval(function() {
        if (win) {
            win.setAlwaysOnTop(true);
            updateWinPos(win);
        }
    }, 1);
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        win = null
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
