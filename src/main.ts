import { GameScene } from "./scenes/game";
import { init, initKeys } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState } from "./functions/state";
import { Title } from "./scenes/title";

init();
const assets = {};
(() => {
  let l = 1;
  window["zzfx_x"] = new AudioContext();
  ["gfx8colors", "font"].forEach(file => {
    initKeys();
    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);
        const state: any = { font: assets["font"], assets, spriteSheets };
        SetState(state);
        GameScene(3);

        // Title();
      }
    };
  });
})();
