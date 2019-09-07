import { GameScene } from "./scenes/game";
import { init, initKeys } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
import { Title } from "./scenes/title";
import { helpScene } from "./scenes/help";

const canvas = document.getElementsByTagName("canvas")[0];

const rotateDevice = () => {
  console.log("LYSS");
  if (screen.width < screen.height) {
    console.log("FIX");
    canvas.height = screen.availHeight * (256 / screen.availWidth);
    canvas.width = 256;
    return;
  }
  alert("Rotate device");
  setTimeout(rotateDevice, 500);
};

init();
const assets = {};
(() => {
  let l = 1;
  window["zzfx_x"] = new AudioContext();
  ["gfx8colors"].forEach(file => {
    initKeys();

    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);
        const state: any = { assets, spriteSheets };
        SetState(state);
        console.log(GetState());
        //@ts-ignore;
        console.log("canvas", canvas);
        if (GetState().mobile) {
          console.log("LYSNNA");
          window.onorientationchange = () => rotateDevice;
          rotateDevice();
          canvas.style.width = "100%";
        } else {
          canvas.style.height = "100%";
        }
        Title();
      }
    };
  });
})();
