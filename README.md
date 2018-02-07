# HostsFileEdit

HostsFileEdit is a small app that helps you edit your OS hosts file through a nice, minimalist UI.

Tested on Linux Ubuntu

## Todo

* Create Linux and OSX packages for 1st release
* Make it compatible with Windows

## Get your machine ready

Be sure to have an installed node version quite recent (~=>6). Get the latest version of npm `sudo npm install npm -g`.

Install [bozon](https://github.com/railsware/bozon) `sudo npm install -g bozon`.

## Dev

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

I had to install `graphicsmagick`, `rpm` and `icnsutils` on my Linux distrib in order to generate the Linux packages.

## License

The MIT License (MIT) © LouWii 2018
