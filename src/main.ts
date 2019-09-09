import { GameScene } from "./scenes/game";
import { init, initKeys } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
import { Title } from "./scenes/title";
import { helpScene } from "./scenes/help";

const canvas = document.getElementsByTagName("canvas")[0];

const setKey = (id, val) => {
  const keys = GetState().keys;
  keys[id] = val;
  SetState({ keys });
};

const rotateDevice = () => {
  let bodyClasses = document.getElementsByTagName("body")[0].classList;
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
  //@ts-ignore
  if (document.monetization && document.monetization.state === "started") {
    alert("hej");
  }
  let l = 1;
  window["zzfx_x"] = new AudioContext();
  ["gfx8colors"].forEach(file => {
    initKeys();

    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);
        const state: any = { assets, spriteSheets, touches: {}, keys: {} };
        SetState(state);
        if (GetState().mobile) {
          window.onorientationchange = rotateDevice;
          ["left", "right", "up", "z", "down"].forEach(id => {
            const btn = document.getElementById(id);
            btn.ontouchstart = () => setKey(id, true);
            btn.ontouchend = () => setKey(id, false);
          });

          rotateDevice();
        }
        Title();
      }
    };
  });
})();
