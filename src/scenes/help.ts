import { GetFlash } from "./../functions/getFlash";
import { Title } from "./title";
import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  getContext,
  initKeys,
  keyJustPressed
} from "../dependencies/kontra.js";
import writeText from "../functions/writeText";
import { GetState } from "../functions/state";
import { keyPressed, Ekeys } from "../functions/input";

export const helpScene = () => {
  const { font, press } = GetState();
  let tick = 0;
  let letter = 0;
  let story = `THIS IS THE UNTOLD STORY OF THE
BACKSTABBER HERO. ZE IS TAKING
CARE OF THE WORLDS BACKSTABBING
CHORES NEGLIGATED BY MOST
PEOPLE LIVING CAREFREE LIVES.
ACTING AS A SHADOW NO ONE HAS
SEEN HIRS FACE///`;
  let storyLength = story.length;

  const gameLoop = GameLoop({
    render: () => {
      writeText(font, "BACK     ", -1, 16, 2, 5, tick);
      writeText(font, "    STORY", -1, 16, 2);

      writeText(font, story.substring(0, letter), 4, 40, 1);

      if (letter > storyLength) {
        writeText(font, "INSTRUCTIONS", -1, 120, 2);
        writeText(
          font,
          `USE ARROW KEYS TO MOVE JUMP
AND DUCK. PRESS Z TO STAB.
STUDY YOUR ENEMIES TO TIME
YOUR ATTACKS. AN IMMOBILE
BARREL GOES UNNOTICED/`.substring(0, letter - storyLength),
          4,
          120 + 24,
          1
        );
      }

      if (tick > 999 && GetFlash(tick / 9)) {
        writeText(font, press, -1, 220, 1);
      }
    },
    update: () => {
      ++tick;
      letter = tick / 3;

      if ((keyPressed(Ekeys.Any) || GetState().touches[0]) && tick > 99) {
        tick = -1e9;
        gameLoop.stop();
        Title();
      }
    }
  });

  gameLoop.start();
};
