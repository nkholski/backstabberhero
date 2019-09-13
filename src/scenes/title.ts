import { Ekeys } from "../functions/input";
import { GameLoop } from "../dependencies/kontra.js";
import { GetFlash } from "../functions/getFlash";
import writeText from "../functions/writeText";
import { levelSelectScene } from "./levelSelect";
import { GetState } from "../functions/state";
// import { playMusic } from "../functions/music";
import { keyPressed } from "../functions/input";

export const Title = () => {
  let tick = 0;
  let amplitude = 100;
  let heroOpacity = 0;
  let state = -1;
  let { context, spriteSheets, font, press, blip } = GetState();
  context.imageSmoothingEnabled = false;

  // window["playMusic"]();
  //stopMusic();

  // playMusic();
  //setState({music: true});

  let loop = GameLoop({
    update: () => {
      if (amplitude > 0) {
        amplitude--;
      } else if (heroOpacity < 100) {
        heroOpacity++;
      }
      if (keyPressed(Ekeys.Any) && tick > 99) {
        blip();
        if (state == 1) {
          loop.stop();
          levelSelectScene();
          state = 2;
        }
      } else {
        state = 1;
      }
    },
    render: () => {
      context.drawImage(spriteSheets[0].image, 48, 0, 32, 32, 0, 120, 120, 120);
      writeText(font, "BACKSTABBER", -1, 30, 2, amplitude, tick++);
      context.globalAlpha = heroOpacity / 100;
      writeText(font, "HERO", -1, 70 - heroOpacity / 5, 5.5);
      context.globalAlpha = (0.4 * heroOpacity) / 100;
      writeText(font, "HERO", -130, 70 + 3 - heroOpacity / 5, 5);
      context.globalAlpha = 1;
      if (heroOpacity === 100 && GetFlash(tick / 9)) {
        writeText(font, press, -1, 100, 1);
      }

      writeText(font, "-2019 NIKLAS BERG", 110, 225);
    }
  });
  loop.start();
};
