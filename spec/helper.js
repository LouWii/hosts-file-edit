var path = require('path');

module.exports = {
  appPath: function() {
    switch (process.platform) {
      case 'darwin':
        return path.join(__dirname, '..', '.tmp', 'HostsManager-darwin-x64', 'HostsManager.app', 'Contents', 'MacOS', 'HostsManager');
      case 'linux':
        return path.join(__dirname, '..', '.tmp', 'HostsManager-linux-x64', 'HostsManager');
      default:
        throw 'Unsupported platform';
    }
  }
};
