require('electron').ipcRenderer.on('loaded' , function(event, data) {

  const sudo = require('sudo-prompt');
  const options = {
    name: 'HostsManager',
    //icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
  };
  const uiAnimSavedDuration = 2000;
  const settingsHostsIdx = 'hostsSettings';
  const hostsFilePath = '/etc/hosts';
  const hostsDelimiterStart = '# ----- HostsManager config - Do not delete -----';
  const hostsDelimiterEnd   = '# -----      HostsManager config - End      -----';
  const regex = /(?:# ----- HostsManager config - Do not delete -----\n)([\s\S]*)(?:# -----      HostsManager config - End      -----\n?)/g;
  const sedDelete = "sed -i '/"+hostsDelimiterStart+"/,/"+hostsDelimiterEnd+"\\n/d' "+hostsFilePath;

  // document.querySelector('#load-hosts').addEventListener('click', function(e){
  //   sudo.exec('cat '+hostsFilePath, options, function(error, stdout, stderr) {
  //     //$('#hosts > p').html(stdout);
  //     if ((m = regex.exec(stdout)) !== null) {
  //       if (m.length == 2) {
  //         const configLines = m[1].split('\n');
  //         configLines.forEach((line, lineIndex) => {
  //           console.log(line);
  //         });
  //         // showHostsList(configLines);
  //       }
  //     }
  //   });
  // });

  document.getElementById('title').innerHTML = data.appName + ' App';

  function computeHostsFileString(hosts) {
    let hostsFileString = hostsDelimiterStart+'\\n';
    hosts.forEach((host, hostIndex) => {
      if (host.active) {
        hostsFileString += host.str+'\\n';
      }
    });
    hostsFileString += hostsDelimiterEnd+'\\n';
    console.log(hostsFileString);
    return hostsFileString;
  }

  var app = new Vue({
    el: '#app',
    data: {
      hosts: [
        { str: '127.0.0.1 ', active: true },
        { str: ' ', active: false }
      ],
      savingIntoFile: false,
      savingIntoFileState: 0
    },
    beforeMount: function() {
      const jsonHosts = localStorage.getItem(settingsHostsIdx);
      if (jsonHosts) {
        this.hosts = JSON.parse(jsonHosts);
      } else {

      }
    },
    methods: {
      addHost: function(event) {
        this.hosts.push({ str: '', active: false });
      },
      removeLastHost: function(event) {
        this.hosts.pop();
      },
      removeHostAt: function(index) {
        this.hosts.splice(index, 1);
      },
      activateHost: function(host) {
        host.active = !host.active;
        this.saveHostsSettings();
      },
      saveHostsSettings: function() {
        localStorage.setItem(settingsHostsIdx, JSON.stringify(this.hosts));
      },
      saveHostsFile: function() {
        if (this.savingIntoFile){ return; }
        this.savingIntoFile = true;
        const timeStart = performance.now();
        const cmd = "bash -c \""+sedDelete+";"+"sed -i '$ a\\"+computeHostsFileString(this.hosts)+"' " + hostsFilePath+"\"";
        const parent = this;
        sudo.exec(cmd, options, function(error, stdout, stderr) {
          if (!error){
            const timeEnd = performance.now();
            parent.savingIntoFile = false;
            parent.savingIntoFileState = 1;
            setTimeout(function(){
              parent.savingIntoFileState = 0;
            }, 1500);
          } else {
            console.error(error);
            console.log(stderr);
            parent.savingIntoFile = false;
            parent.savingIntoFileState = -1;
            setTimeout(function(){
              parent.savingIntoFileState = 0;
            }, 1500);
          }
        });
      }
    },
    computed: {
      saveIntoFileButtonClass: function() {
        return {
          saving: this.savingIntoFile,
          saved: this.savingIntoFileState == 1,
          error: this.savingIntoFileState == -1
        }
      },
      saveIntoFileButtonDisabled: function() {
        return this.savingIntoFile || this.savingIntoFileState != 0
      }
    },
    watch: {
      hosts: function(newHosts) {
        this.saveHostsSettings();
      }
    }
  });
});