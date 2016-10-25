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
const Menu = require('electron').Menu;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow = null;
let child = null;
let projectPath = "";

// available port
let portNumber = null;
// Find avaiable port
portscanner.findAPortNotInUse(8181, 8199, '127.0.0.1', function(error, port) {
  // console.log(port + " is available port.")
  portNumber = port;
});

// close handler
function onClosed() {
  mainWindow = null;
}

const template = [{
    label: "Application",
    submenu: [
        { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: () => (app.quit()) }
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
];


function createMainWindow() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const win = new electron.BrowserWindow({
    width: width,
    height: height,
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadURL(`file://${__dirname}/www/index.html`);
  win.on('closed', onClosed);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));  
  return win;
}

function createCloud9Window() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const win = new electron.BrowserWindow({
    width: width,
    height: height,
  });
  global.portNumber = portNumber;
  win.loadURL(`file://${__dirname}/www/c9.html`);
  win.on('closed', onClosed);
  win.setTitle(`${projectPath}`);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));  
  return win;
}

function showDialog(title, callback) {
  dialog.showOpenDialog({ 
    title: title,
    defaultPath: os.homedir(),
    properties: ['openDirectory']
  }, callback);
}

function showC9SDKDirectory(callback) {
  showDialog("Please choose the cloud9 directory ...", (result) => {
    callback(result);
  });
}

function showProjectDirectory(callback) {
  showDialog("Please choose the project directory", (result) => {
    callback(result);
  });
}

ipc.on('initialize', function(event, arg) {
  event.sender.send('initialize-done', {
    configPath: config.path, 
    portNumber: portNumber,
    nodeVersion: process.version,
    cloud9Path: config.get('c9sdk')
  });
});

ipc.on('select-c9', function(event, arg) {
  showC9SDKDirectory((directory) => {
    let c9sdk = directory ? directory[0] : config.get('c9sdk');
    config.set('c9sdk', c9sdk);
    event.sender.send('select-c9-done', {cloud9Path: c9sdk});
  });
});

ipc.on('select-project', function(event, arg) {
  showProjectDirectory((directory) => {
    projectPath = directory ? directory[0] : projectPath;
    event.sender.send('select-project-done', {projectPath: projectPath});
  });
});

ipc.on('open-project', function(event, arg) {
  if (config.get('c9sdk') == "") {
    return dialog.showErrorBox("Error", `Cloud9 isn't selected.`);
  }
  if (projectPath == "") {
    return dialog.showErrorBox("Error", `Project isn't selected.`);
  }
  const c9sdk = config.get('c9sdk');
  const cloud9 = c9sdk + "/server.js";
  child = child_process.spawn(cloud9, ["-w", projectPath, "-p", portNumber], {cwd: projectPath});
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function(data){
    process.stdout.write(data);
  });
  child.on('exit', function(){
    process.exit(0);
  });
  setTimeout(() => {
    mainWindow.destroy();
    mainWindow = null;
    mainWindow = createWindow();
  }, 1000);
});

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

function createWindow() {
  if (!mainWindow ) {
    if (child) {
      mainWindow = createCloud9Window();
    } else {
      mainWindow = createMainWindow();
    }
  }
}

app.on('activate', () => {
  createWindow();
});

app.on('ready', () => {
  createWindow();
});