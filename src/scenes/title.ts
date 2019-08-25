import { Levels } from "../common/levels";
import { GetFlash } from "../functions/getFlash";
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
import { GameScene } from "./game";
import { levelSelectScene } from "./levelSelect";

export default class Title {
  loop = null;
  spriteSheets: any;
  assets: any;
  context: any;
  tick = 0;
  amplitude = 100;
  heroOpacity = 0;
  state = -1;

  boot(assets, spriteSheets) {
    this.spriteSheets = spriteSheets;
    this.assets = assets;
    this.context = getContext();
    this.start();
  }
  start() {
    this.loop = GameLoop({
      update: () => {
        if (this.amplitude > 0) {
          this.amplitude--;
        } else if (this.heroOpacity < 100) {
          this.heroOpacity++;
        }
        if (keyPressed("z")) {
          if (this.state == 1) {
            this.loop.stop();
            levelSelectScene();
            // GameScene(this.assets, this.spriteSheets, Levels[0]);
            this.state = 2;
          }
        } else {
          this.state = 1;
        }
      },
      render: () => {
        this.context.drawImage(
          this.assets.gfx8colors,
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
          -1,
          50,
          2,
          this.amplitude,
          this.tick++
        );
        this.context.globalAlpha = this.heroOpacity / 100;
        writeText(this.assets.font, "HERO", -1, 85 - this.heroOpacity / 5, 5);
        this.context.globalAlpha = (0.4 * this.heroOpacity) / 100;

        writeText(
          this.assets.font,
          "HERO",
          -130,
          85 + 3 - this.heroOpacity / 5,
          5
        );

        this.context.globalAlpha = 1;

        if (this.heroOpacity === 100 && GetFlash(this.tick / 9)) {
          writeText(this.assets.font, "PRESS Z TO STAB", 75, 110, 1);
        }
      }
    });
    this.loop.start();
  }
}
