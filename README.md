# Pterodacyl Attack

![logo](readme/logo.png)

[Pterodactyl Attack](http://pteroattack.com) is an iOS game made at [Hygoon
Studio](http://hygoon.com).  It was created in Javascript from the ground up
and can be played from the web browser as well as mobile devices via CocoonJS.

This repository contains the source code for our development workflow (game,
tools, workspace, server, build scripts).  It also contains the entire history
of revisions from its early prototype on January 2013 to its current completed
stage on January 2014.

## The Book

[![book](readme/book.png)](http://pteroattack.com/#quick-look)

To understand the context of our game, code, and tools, I highly recommend
reading our comprehensive illustrated guide that covers the high- and low-level
details of our workflow: <http://pteroattack.com/#quick-look>

## Buying the Game

If you wish to play the game on iPhone or iPad, you can buy it here:

[![appstore](readme/appstore.png)](https://itunes.apple.com/us/app/pterodactyl-attack/id786862892?mt=8&ign-mpt=uo%3D4)

## License

This program is free software: you can redistribute it and/or modify it under
the terms of the __GNU General Public License Version 3__ as published by the Free
Software Foundation

[![gplv3](readme/gplv3.png)](http://www.gnu.org/licenses/gpl-3.0.html)

## Setting up

If you want you to start playing the game and messing with the tools and game
source code, there are some __one-time setup__ steps and some __every-time
setup__ steps required to complete your workflow, detailed in this section.

### One-Time Setup

This section covers all the one-time setup steps for the development workspace.
You can safely forget them after completing them.

#### Installing Dependencies 

Download and install the following required programs:

- Get [Git](http://git-scm.com/downloads). This is used to "clone" this repository.  This downloads our current workspace and its entire history of revisions.
- Get [NodeJS](http://nodejs.org/download/) so you can run the server for the workspace.  This "serves" the local webpage for the game and tools and facilitates
the tool operations.
- Get the latest [Python 2.7.x](http://www.python.org/download/) so you can run the build scripts.

You can get these as well, but they are optional:

- Optionally, get a [Git GUI](http://git-scm.com/downloads/guis) if you prefer GUI interfaces over command lines.
- Optionally, get [Sublime Text](http://www.sublimetext.com/) if you want a nice text editor for navigating and editing the code.

#### Retrieving the workspace

You can place the workspace anywhere you want on your computer.  Using Git from
the command prompt, you can type the following:

```
> git clone https://github.com/shaunlebron/PterodactylAttack.git
```

OR if you are using a GUI, use the URL above as the source for your clone operation.

#### Setting up NodeJS (for the server)

Using a command prompt, navigate to the repository that you cloned and type the following:

```
> npm install
```

(This automatically creates a "node_modules" folder in the workspace and installs the NodeJS
modules there required by this project, listed in "package.json".)

#### CocoonJS (for playing on mobile devices)

The game will run fine on a web browser, but if you want to test it on a mobile
device, you must register for a free account on
[CocoonJS](https://www.ludei.com/cocoonjs/).  Then you can install either of these
launcher applications (free) on your mobile devices:

- [CocoonJS Launcher for Android](https://play.google.com/store/apps/details?id=com.ideateca.cocoonjslauncher)
- [CocoonJS Launcher for iOS](https://itunes.apple.com/us/app/cocoonjs-by-ludei/id519623307?mt=8)

### Every-time setup

Now, here are some things that you have to remember to do everytime you want to
mess around in this workspace.

#### Starting the server

The server must be running whenever you want to test the game or run the tools.
To start the server, navigate to the repository on the command line, and type
the following:

```
> node server
```

This will run the server.  So you must keep it open when using the game/tools.
To Stop the server, hit CTRL+C or simply close the window.

#### Building the game (don't forget this!)

Whenever you make changes to the script, you must remember to "build" the game
with the following command.  Again, you must execute this from the command line
at the repository:

```
> python build.py
```

This will update some dependent files from your current changes and build the
"cocoon.zip" file for testing on mobile devices.

## Playing the game and running the tools

You can run the game on desktop through a web browser and on mobile devices
through the CocoonJS launcher (mentioned in a previous section).  But you
can only run the tools on the Desktop browser.

### Desktop

Remember to start the server (mentioned in previous section)!  To play the game
or run the tools, open a web browser (preferably Chrome, but Safari and
Firefox wil do), and navigate to:

```
http://localhost:3001
```

This points your browser to the webpage served by the NodeJS server for the
Pterodactyl Attack workspace.  You will see a "hub" of links to the game and
tools.

![hub](readme/hub.png)

### Mobile

Before testing the game on your mobile device, remember to run the build script 
and make sure the server is running.

Your mobile device has to somehow read the "cocoon.zip" file in the root directory of the repository.
You can either 1) copy the file to your device, or 2) network your phone to your computer
and point CocoonJS launcher to the URL http://yourIPaddress:3001/cocoon.zip.

![cocoon](readme/cocoon.png)

