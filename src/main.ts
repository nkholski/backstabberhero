import { SetState } from "./functions/state";
import { GameScene } from "./scenes/game";
import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  initKeys,
  keyPressed
} from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import Title from "./scenes/title";

const { canvas, context } = init();
const assets = {};
// 1. Preload all assets
(() => {
  let l = 1;
  ["gfx8colors", "font"].forEach(file => {
    initKeys();

    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);

        const state: any = { font: assets["font"], assets, spriteSheets };

        SetState(state);

        new Title().boot(assets, spriteSheets);

        // GameScene(assets, spriteSheets, level);
      }
    };
  });
})();
