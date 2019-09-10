import { GameScene } from "./scenes/game";
import { init } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
import { Title } from "./scenes/title";
import { helpScene } from "./scenes/help";
import { initKeys } from "./functions/input";

const canvas = document.getElementsByTagName("canvas")[0];

const rotateDevice = () => {
  let bodyClasses = GetState().body.classList;
  bodyClasses.add("mobile");
  bodyClasses.remove("por");
  if (screen.width < screen.height) {
    bodyClasses.add("por");
  }
  // setTimeout(rotateDevice, 500);
};

init();
const assets = {};
(() => {
  initKeys();

  //@ts-ignore

  if (document.monetization && document.monetization.state === "started") {
    alert("hej");
  }
  let l = 1;
  window["zzfx_x"] = new AudioContext();
  ["gfx8colors"].forEach(file => {
    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);
        const state: any = { assets, spriteSheets, touches: {}, keys: {} };
        SetState(state);
        if (GetState().mobile) {
          window.onorientationchange = rotateDevice;
          rotateDevice();
        }
        Title();
      }
    };
  });
})();
