import { MakeTempCanvas } from "./../functions/makeTempCanvas";
import { Levels } from "../common/levels";
import { GetFlash } from "../functions/getFlash";
import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  getContext,
  initKeys,
  keyPressed,
  keyJustPressed
} from "../dependencies/kontra.js";
import writeText from "../functions/writeText";
import { GameScene } from "./game";
import { start } from "repl";
import { GetState } from "../functions/state";
import { zzfx } from "../dependencies/zzfx";

const resetLocalStorage = () => {
  const progress = new Array(25).fill(-1);
  updateLocalStorage(progress);
  return progress;
};

const updateLocalStorage = progress => {
  localStorage.setItem("nkholski", JSON.stringify(progress));
};

export const levelSelectScene = (lvl?, stars?) => {
  const { font, assets, spriteSheets } = GetState();
  let transition;
  let killme = false;
  let tick = 0;
  let okToStart = false;
  const context = getContext();
  context.save();
  const progress = localStorage.getItem("nkholski")
    ? JSON.parse(localStorage.getItem("nkholski"))
    : resetLocalStorage();
  if (lvl > -1 && progress[lvl] < stars) {
    progress[lvl] = stars;
    updateLocalStorage(progress);
  }

  const next = progress.indexOf(-1);
  let currentChoice = next;

  const backgroundImage = MakeTempCanvas(context => {
    for (let i = 0; i < 25; i++) {
      const x = i % 5;
      const y = (i - x) / 5;

      if (i > next && context.globalAlpha == 1) {
        context.stroke();
        context.globalAlpha = 0.5;
      }

      for (let knife = 0; knife < progress[i]; knife++) {
        const x = i % 5;
        const y = (i - x) / 5;
        context.drawImage(
          assets.gfx8colors,
          11 * 16 + 8,
          0,
          8,
          8,
          x * 45 + 16 + 19 - 8 - 10 + knife * 10,
          y * 45 + 12 + 3 + 18,
          16,
          16
        );
      }

      context.rect(x * 45 + 16, y * 45 + 12, 40, 40);
      writeText(
        font,
        i + 1,
        -(x * 45 + 16 + 19),
        y * 45 + 12 + 3,
        2,
        null,
        null,
        context
      );
    }
    context.stroke();
  });

  const selectLevel = () => {
    context.beginPath();

    context.drawImage(backgroundImage, 0, 0);

    context.strokeStyle = "#fff";

    if (GetFlash(++tick / 9)) {
      context.rect(
        (currentChoice % 5) * 45 + 16,
        Math.floor(currentChoice / 5) * 45 + 12,
        40,
        40
      );
    }

    context.stroke();
  };

  const gameLoop = GameLoop({
    update: () => {
      if (!transition) {
        if (killme) {
          return;
        }

        if (keyPressed("any")) {
          if (!okToStart) {
            return;
          }
          okToStart = false;
        } else {
          okToStart = true;
        }

        let wasCurrentChoice = currentChoice;

        if (keyJustPressed("up")) {
          currentChoice -= 5;
        }
        if (keyPressed("down")) {
          currentChoice += 5;
        }
        if (keyJustPressed("left")) {
          currentChoice--;
        }
        if (keyPressed("right")) {
          currentChoice++;
        }

        if (wasCurrentChoice !== currentChoice) {
          zzfx(1, 0.3, 100, 0.4, 0.27, 0.1, 2, 2.9, 0.68);
        }

        currentChoice =
          currentChoice > 24 ? 24 : currentChoice < 0 ? 0 : currentChoice;

        if (keyPressed("z")) {
          killme = true;
          transition = true;
          setTimeout(() => {
            context.stroke();
            context.restore();
            GameScene(currentChoice);
            gameLoop.stop();
          }, 2e3);
        }
      }
    },

    render: () => {
      if (!transition) {
        selectLevel();
      } else {
        writeText(font, "LEVEL " + (currentChoice + 1), -1, 50, 3);
        // writeText(font, Levels[currentChoice].t, -1, 90, 2);
      }
    }
  });
  gameLoop.start();
};
