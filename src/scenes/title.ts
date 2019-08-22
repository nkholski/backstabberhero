import { flash } from "./../functions/flash";
import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  getContext,
  initKeys,
  keyPressed
} from "../dependencies/kontra.js";
import writeText from "../functions/writeText";

export default class Title {
  loop = null;
  spriteSheet: any;
  assets: any;
  context: any;
  tick = 0;
  applitude = 100;
  heroOpacity = 0;

  boot(assets, spriteSheet) {
    this.spriteSheet = spriteSheet;
    this.assets = assets;
    this.context = getContext();
    this.start();
  }
  start() {
    this.loop = GameLoop({
      update: () => {
        if (this.applitude > 0) {
          this.applitude--;
        } else if (this.heroOpacity < 100) {
          this.heroOpacity++;
        }
      },
      render: () => {
        this.context.drawImage(
          this.assets.gfx,
          64,
          0,
          32,
          32,
          0,
          120,
          120,
          120
        );

        writeText(
          this.assets.font,
          "BACKSTABER",
          56,
          50,
          2,
          this.applitude,
          this.tick++
        );
        this.context.globalAlpha = this.heroOpacity / 100;
        writeText(this.assets.font, "HERO", 57, 85 - this.heroOpacity / 5, 5);
        this.context.globalAlpha = (0.4 * this.heroOpacity) / 100;

        writeText(
          this.assets.font,
          "HERO",
          57 + 3,
          85 + 3 - this.heroOpacity / 5,
          5
        );

        this.context.globalAlpha = 1;

        if (this.heroOpacity === 100 && flash(this.tick / 5)) {
          writeText(this.assets.font, "PRESS Z TO STAB", 75, 110, 1);
        }
      }
    });
    this.loop.start();
  }
}
