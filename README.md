# HostsFileEdit

![hosts-file-edit-icon-small](https://cloud.githubusercontent.com/assets/2750789/23343095/d04cfeee-fc1a-11e6-9d82-fc79f530689b.png)

HostsFileEdit is a small app that helps you edit your OS hosts file through a nice, minimalist UI.

* Add and remove as much hosts as you want
* Enable/disable host
* Import/Export a list of hosts
* Hosts in the app are separate from all other hosts set in the *hosts* file

Tested on Linux Ubuntu and OSX.

![hostsfileedit-screenshot](https://cloud.githubusercontent.com/assets/2750789/23343075/66ead872-fc1a-11e6-87cc-be2649be8032.png)

## Todo

* Make it compatible with Windows

## Dev

### Get your machine ready

Be sure to have an installed node version quite recent (=>5). Get the latest version of npm `sudo npm install npm -g`.

Install [bozon](https://github.com/railsware/bozon) `sudo npm install -g bozon`.

### Install app dependencies

```
$ npm install
$ cd app
$ npm install
```

### Run

```
$ bozon start
```

### Package

```
$ bozon package [linux, mac]
```

Builds the app for OS X, Linux, using [electron-builder](https://github.com/electron-userland/electron-builder).

I had to install `graphicsmagick` and `icnsutils` on my Linux distrib in order to generate the Linux packages.

## License

The MIT License (MIT) © LouWii 2017
