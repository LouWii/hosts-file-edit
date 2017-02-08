require('electron').ipcRenderer.on('loaded' , function(event, data) {

  const sudo = require('sudo-prompt');
  const fs = require('fs');
  const remote = require('electron').remote; 
  const dialog = remote.dialog;
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

  function getHostsUpdateCommand(platform, hosts) {
      if (data.platform == 'linux') {
        const sedDelete = "sed -i '/" + hostsDelimiterStart + "/,/" + hostsDelimiterEnd + "\\n/d' " + hostsFilePath;
        let sedUpdate = "sed -i '$ a\\" + hostsDelimiterStart+'\\n';
        hosts.forEach((host, hostIndex) => {
          if (host.active) {
            sedUpdate += host.str+'\\n';
          }
        });
        sedUpdate += hostsDelimiterEnd+'\\n';
        sedUpdate += "' " + hostsFilePath;
        const cmd = "bash -c \"" + sedDelete + "; " + sedUpdate + "\"";
        return cmd;
      } else if (data.platform == 'darwin') {
        const sedDelete = "sed -i -e '/" + hostsDelimiterStart + "/,/" + hostsDelimiterEnd + "\\n/d' " + hostsFilePath;
        let sedUpdate = "sed -i '' '$ a\\'$'\n''" + hostsDelimiterStart + "' " + hostsFilePath;
        hosts.forEach((host, hostIndex) => {
          if (host.active) {
            sedUpdate += " && sed -i '' '$ a\\'$'\n''" + host.str + "' " + hostsFilePath;
          }
        });
        sedUpdate += " && sed -i '' '$ a\\'$'\n''" + hostsDelimiterEnd + "' " + hostsFilePath;
        const cmd = "" + sedDelete + " && " + sedUpdate;
        return cmd;
      }
  }

  var app = new Vue({
    el: '#app',
    data: {
      hosts: [
        { str: '127.0.0.1 test.dev', active: true },
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
        const cmd = getHostsUpdateCommand(data.platform, this.hosts);
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
      },
      exportHostsList: function(event) {
        const content = JSON.stringify(this.hosts);
        dialog.showSaveDialog(function (fileName) {
          if (fileName === undefined){
            //console.log("You didn't save the file");
            return;
          }
          fs.writeFile(fileName, content, function (err) {
            if(err){
              alert("An error ocurred creating the file "+ err.message)
            }
            alert("The file has been succesfully saved");
          });
        });
      },
      importHostsList: function(event) {
        const parent = this;
        dialog.showOpenDialog(function (fileNames) {
          // fileNames is an array that contains all the selected
          if(fileNames === undefined){
            console.log("No file selected");
          }else{
            fs.readFile(fileNames[0], 'utf-8', function (err, data) {
              if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
              }
              try {
                const hosts = JSON.parse(data);
              }
              catch (e) {
                alert("This file doesn't contain valid JSON.");
              }
              if (Array.isArray(hosts)) {
                parent.hosts = hosts;
              } else {
                alert("This file doesn't contain valid data.");
              }
            });
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