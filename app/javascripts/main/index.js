const path = require('path');
const json = require('../../package.json');

const electron = require('electron');
const Menu = electron.Menu;

// add relevant items in menu
// https://github.com/electron/electron/blob/master/docs/api/menu.md
// https://github.com/electron/electron/blob/master/docs/api/menu-item.md
const menuTemplate = [
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://github.com/LouWii/hosts-file-edit') }
      }
    ]
  }
];

electron.app.on('ready', function() {
  var window;

  window = new electron.BrowserWindow({
    title: json.name,
    width: json.settings.width,
    height: json.settings.height
  });

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html');

  window.webContents.on('did-finish-load', function(){
    window.webContents.send('loaded', {
      appName: json.name,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromiumVersion: process.versions.chrome,
      platform: process.platform
    });
  });

  window.on('closed', function() {
    window = null;
  });

});
