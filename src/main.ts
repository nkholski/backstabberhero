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
  ["gfx", "font"].forEach(file => {
    assets[file] = new Image();
    assets[file].src = `assets/${file}.png`;
    assets[file].onload = () => {
      if (!--l) {
        let spriteSheets = GetSpriteSheets(assets);
        new Title().boot(assets, spriteSheets);
      }
    };
  });
})();
