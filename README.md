# Backstabber Hero 13kb

This is my contribution the Js13kGames JavaScript coding competition. The rules are simple, you got one month to fill your 13kb with code and assets. It will challenge you, 13kb is about 0.5 seconds of low quality mp3 song or 0.4 percent of a normal photo you take with your camera. The theme for 2019 was "back" which gave me the idea for backstabber hero.

![Screenshot](https://raw.githubusercontent.com/nkholski/backstabberhero/master/gitscreenshot.png)

[Click here to play the game at js13kgames.com](https://js13kgames.com/entries/backstabber-hero)
[Click here for post competition build >13kb with IOS and Gamepad support](https://niklasberg.se/backstabber-hero/)

## This repository

Everything is a mess right now after struggeling to fit as much as possible and meet the deadline. It might be fun to poke around but a lot is far from best practise. I use Typescript for some features, but have disabled most warnings when I thought that the correct way would cause a larger code base. Don't try to learn from it :-) I hope however I'll find the strength to go back and tidy it up a bit or at least remove dead files. The master branch of this repository no longer matches the version that is live at js13kgames.com. The exact submitted zip-file is in the releases tab.

## Third party stuff

I borrowed the webpacker and typescript conf from [Spacecraft js13k contribution 2018](https://github.com/tricsi/spacecraft). Sound effects was made with [ZZFX](https://zzfx.3d2k.com/). Finally I base the whole project on [Kontra.js](https://straker.github.io/kontra/) which was of great help, even the parts that I stripped away later or customised made it possible for progress while I used it. Great library for prototyping or small games. It's still says Kontra in the dependencies folder but it's a massacred version of it.

## How to run

Run `npm install` and then `npm run start`. The levels are built with [Tiled](https://www.mapeditor.org), then parsed with the node-script found in tools to build the "levels.ts" file. I run `nodemon --watch ..\rawAssets\maps\ .\parseMaps.js` in the tools folder to watch changes made with Tiled and instantly push updated a levels.ts-file to the src folder. One thing that might be confusing is that the assets in the assets folder is no longer used. Instead all assets are inlined as base64 strings.

## Post-mortem

I love reading game dev post-mortems and hope to write something on this project soon. Perhaps even two, one for inspirations behind the game and one for tech stuff.
