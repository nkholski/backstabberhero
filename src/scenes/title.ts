import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  initKeys,
  keyPressed
} from "../dependencies/kontra.js";

export default class Title {
  loop = null;

  boot() {
    this.start();
  }
  start() {
    this.loop = GameLoop({
      update: () => {
        console.log("TITLE!");
      },
      render: () => {
        console.log("render");
      }
    });
    this.loop.start();
  }
}
