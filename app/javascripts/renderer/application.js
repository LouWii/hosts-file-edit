require('electron').ipcRenderer.on('loaded' , function(event, data) {
  document.getElementById('details').innerHTML = 'built with Electron v' + data.electronVersion;
  document.getElementById('versions').innerHTML = 'running on Node v' + data.nodeVersion + ' and Chromium v' + data.chromiumVersion;

  const sudo = require('sudo-prompt');
  const options = {
    name: 'HostsManager',
    //icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
  };
  const uiAnimSavedDuration = 2000;
  const appHostsSettingIdx = 'hosts';
  const hostsFilePath = '/etc/hosts';
  const hostsDelimiterStart = '# ----- HostsManager config - Do not delete -----';
  const hostsDelimiterEnd   = '# -----      HostsManager config - End      -----';
  const regex = /(?:# ----- HostsManager config - Do not delete -----\n)([\s\S]*)(?:# -----      HostsManager config - End      -----\n?)/g;
  const sedDelete = "sed -i '/"+hostsDelimiterStart+"/,/"+hostsDelimiterEnd+"\\n/d' "+hostsFilePath;
  const appHostsJson = localStorage.getItem(appHostsSettingIdx);
  let appHosts = null;

  function loadSettings()
  {
    if (appHostsJson) {
      appHosts = JSON.parse(appHostsJson);
      showHostsList(appHosts.hosts);
    } else {
      appHosts = { hosts: [] };
      saveSettings();
    }
  }

  function saveSettings()
  {
    localStorage.setItem(appHostsSettingIdx, JSON.stringify(appHosts));
  }

  function computeHostsFileString()
  {
    let hostsFileString = hostsDelimiterStart+'\\n';
    appHosts.hosts.forEach((host, hostIndex) => {
      if (host.active) {
        hostsFileString += host.str+'\\n';
      }
    });
    hostsFileString += hostsDelimiterEnd+'\\n';

    return hostsFileString;
  }

  function createHostInputElement(hostId, hostString)
  {
    let li = document.createElement('li');
    let group = document.createElement('div');
    group.classList.add('input-group');
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('data-id', hostId);
    input.setAttribute('value', hostString);
    input.classList.add('form-control', 'input-host');
    ['change', 'keyup', 'cut', 'paste'].forEach(event => input.addEventListener(event, liveSaveSettingsEvent));
    let groupBtn = document.createElement('span');
    groupBtn.classList.add('input-group-btn');
    let btnRemove = document.createElement('button');
    btnRemove.setAttribute('type', 'button');
    btnRemove.setAttribute('data-id', hostId);
    btnRemove.classList.add('btn', 'btn-default');
    btnRemove.addEventListener('click', deleteRowEvent);
    let btnRemoveIcon = document.createElement('span');
    btnRemoveIcon.classList.add('glyphicon', 'glyphicon-remove');
    btnRemove.appendChild(btnRemoveIcon);
    groupBtn.appendChild(btnRemove);
    group.appendChild(input);
    group.appendChild(groupBtn);
    li.appendChild(group);

    return li;
  }

  function showHostsList(appHosts) {
    appHosts.forEach((host, hostIndex) => {
      const li = createHostInputElement(hostIndex, host.str);
      document.querySelector('#hosts ul').appendChild(li);
    });
  }

  function udpateHostsList(appHosts) {
    const list = document.querySelector('#hosts ul');
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    showHostsList(appHosts);
  }

  function liveSaveSettingsEvent(event) {
    const hostId = parseInt(event.target.getAttribute('data-id'));
    appHosts.hosts[hostId].str = event.target.value;
    saveSettings();
  }

  function deleteRowEvent(event) {
    let btn = event.target;
    if (event.target.classList.contains('glyphicon')) {
      btn = event.target.parentElement;
    }
    const hostId = parseInt(event.target.getAttribute('data-id'));
    appHosts.hosts.splice(hostId, 1);
    saveSettings();
    event.target.parentElement.parentElement.parentElement.remove();
    udpateHostsList(appHosts.hosts);
  }

  document.querySelector('#load-hosts').addEventListener('click', function(e){
    sudo.exec('cat '+hostsFilePath, options, function(error, stdout, stderr) {
      //$('#hosts > p').html(stdout);
      if ((m = regex.exec(stdout)) !== null) {
        if (m.length == 2) {
          const configLines = m[1].split('\n');
          configLines.forEach((line, lineIndex) => {
            console.log(line);
          });
          // showHostsList(configLines);
        }
      }
    });
  });

  document.querySelector('.btn-save-hosts').addEventListener('click', function(event){
    const timeStart = performance.now();
    let button = event.target;
    if (button.classList.contains('text-state') || button.classList.contains('glyphicon')) {
      button = button.parentElement;
    } else if (button.tagName == 'EM') {
      button = button.parentElement.parentElement;
    }
    console.log(button);
    button.classList.add('saving');
    const cmd = "bash -c \""+sedDelete+";"+"sed -i '$ a\\"+computeHostsFileString()+"' " + hostsFilePath+"\"";
    sudo.exec(cmd, options, function(error, stdout, stderr) {
      if (!error){
        // const fileContent = computeHostsFileString();
        // const fileUpdateCmd = 'echo "'+fileContent+'" | tee -a '+hostsFilePath;
        // const fileUpdateCmd = "sed -i '$ a\\"+fileContent+"' " + hostsFilePath;
        // sudo.exec(fileUpdateCmd, options, function(error, stdout, stderr) {
        //   if (!error){

        //   } else {
        //     console.error(error);
        //     console.log(stderr);
        //   }
        // });
        const timeEnd = performance.now();
        if (timeEnd - timeStart < 1000) {
          setTimeout(function(){
            button.classList.remove('saving');
            button.classList.add('saved');
          }, 1000 - (timeEnd - timeStart));
          setTimeout(function(){
            button.classList.remove('saved');
          }, uiAnimSavedDuration + (1000 - (timeEnd - timeStart)));
        } else {
          button.classList.remove('saving');
          button.classList.add('saved');
          setTimeout(function(){
            button.classList.remove('saved');
          }, uiAnimSavedDuration);
        }
      } else {
        button.classList.remove('saving');
        button.classList.add('error');
        console.error(error);
        console.log(stderr);
      }
    });
  });

  document.querySelector(".btn-add").addEventListener('click', function(event) {
    event.preventDefault();
    appHosts.hosts.push({str: '', active: true});
    saveSettings();
    const li = createHostInputElement((appHosts.hosts.length - 1), '');
    document.querySelector('#hosts ul').appendChild(li);
  });

  document.querySelector('.btn-remove').addEventListener('click', function(event) {
    event.preventDefault();
    appHosts.hosts.pop();
    saveSettings();
    document.querySelector('#hosts ul li:last-child').remove();
  });

  document.getElementById('title').innerHTML = data.appName + ' App';
  loadSettings();


  var app = new Vue({
    el: '#app',
    data: {
      hosts: [
        { str: '127.0.0.1 ', active: true },
        { str: ' ', active: false }
      ]
    },
    methods: {
      addHost: function(event) {
        event.preventDefault();
        this.hosts.push({ str: '', active: false });
      },
      removeHost: function(event) {
        event.preventDefault();
        this.hosts.pop();
      }
    }
  });
});