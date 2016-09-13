'use strict';
const electron = require('electron');
const ipc = electron.ipcMain
const shell = electron.shell;
const dialog = electron.dialog;
const os = require('os');
const child_process = require("child_process");
const portscanner = require('portscanner');
const Config = require('electron-config');
const config = new Config();
const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow = null;
let cloud9Window = null;
let child = null;

// available port
let port_number = null;
// Find avaiable port
portscanner.findAPortNotInUse(8181, 8199, '127.0.0.1', function(error, port) {
	// console.log(port + " is available port.")
  port_number = port;
});

// close handler
function onClosed() {
	mainWindow = null;
}

function createMainWindow(nodeIntegration) {
	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
	const win = new electron.BrowserWindow({
		width: width,
		height: height,
		webPreferences: {
  		nodeIntegration: nodeIntegration
		}
	});
	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	return win;
}

function showDialog(title, callback) {
	dialog.showOpenDialog({ 
		title: title,
		defaultPath: os.homedir(),
		properties: ['openDirectory']
	}, callback);
}

function askC9SDKDirectory(callback) {
	showDialog("Please choose the cloud9 directory ...", (result) => {
		if (result) {
  		const directory = result[0]
  		callback(directory);
		} else {
			setTimeout(() => {
  			// again
				askC9SDKDirectory(callback);
			}, 500);
		}
	});
}

function askProjectDirectory(callback) {
	showDialog("Please choose the project directory", (result) => {
  	if (result) {
  		const directory = result[0]
  		callback(directory);
  	} else {
			setTimeout(() => {
  			// again
				askProjectDirectory(callback);
			}, 500);
  	}
	});
}

function bootCloud9(dir) {
	child = child_process.fork(config.get('c9sdk') + "/server.js", ["-w", dir, "-p", port_number], {cwd: dir});
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', function () {
  onClosed();
  if (child) {
  	child.kill();
  }
});

app.on('activate', () => {
	if (!mainWindow) {
		if (child) {
			mainWindow = createMainWindow(false);
			mainWindow.loadURL(`http://127.0.0.1:${port_number}`);
		} else {
			mainWindow = createMainWindow(true);
		}
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow(true);
});

ipc.on('initialize', function(event, arg) {
	event.sender.send('initialize-done', {config_path: config.path, port_number: port_number});
});

ipc.on('choose-cloud9-directory', function(event, arg) {
	if (config.get('c9sdk')) {
		return event.sender.send('choose-cloud9-directory-done', {directory: config.get('c9sdk')});
	}
	askC9SDKDirectory((directory) => {
		config.set('c9sdk', directory);
		event.sender.send('choose-cloud9-directory-done', {directory: directory});
	});
});

ipc.on('choose-project-directory', function(event, arg) {
	askProjectDirectory((directory) => {
		bootCloud9(directory);
		event.sender.send('choose-project-directory-done', {url: `http://127.0.0.1:${port_number}`, directory: directory});
	});
});

ipc.on('typed-done', function(event, arg) {
	setTimeout(() => {
		mainWindow.destroy();
		mainWindow = createMainWindow(false);
		mainWindow.loadURL("http://127.0.0.1:" + port_number);
	}, 1000)
});
