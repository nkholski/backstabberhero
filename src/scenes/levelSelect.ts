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

const resetLocalStorage = () => {
  const progress = new Array(25).fill(-1);
  updateLocalStorage(progress);
  return progress;
};

const updateLocalStorage = progress => {
  progress[0] = 2;
  progress[2] = 3;
  localStorage.setItem("nkholski", JSON.stringify(progress));
};

export const levelSelectScene = (lvl?) => {
  const { font, assets, spriteSheets } = GetState();
  let transition;
  let killme = false;
  let tick = 0;
  let okToStart = false;
  const context = getContext();
  const progress = localStorage.getItem("nkholski")
    ? JSON.parse(localStorage.getItem("nkholski"))
    : resetLocalStorage();
  if (lvl > -1) {
    progress[lvl] = 1;
    updateLocalStorage(progress);
  }

  const next = progress.indexOf(-1);
  let currentChoice = next;
  const selectLevel = () => {
    const hej = new Array(25).fill(1);
    hej.forEach((level, i) => {
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
      if (currentChoice !== i || GetFlash(++tick / 6)) {
        writeText(font, i + 1, -(x * 45 + 16 + 19), y * 45 + 12 + 3, 2);
      }
    });
    context.stroke();
    context.globalAlpha = 1;
    // hej.forEach((level, i) => {
    //   for (let knife = 0; knife < 3; knife++) {
    //     const x = i % 5;
    //     const y = (i - x) / 5;
    //     context.drawImage(
    //       assets.gfx8colors,
    //       11 * 16 + 8,
    //       0,
    //       8,
    //       8,
    //       x * 45 + 16 + 19 - 8 - 10 + knife * 10,
    //       y * 45 + 12 + 3 + 18,
    //       16,
    //       16
    //     );
    //   }
    //   debugger;
    // });
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

        currentChoice =
          currentChoice > 24 ? 24 : currentChoice < 0 ? 0 : currentChoice;

        if (keyPressed("z")) {
          killme = true;
          transition = true;
          setTimeout(() => {
            GameScene(assets, spriteSheets, currentChoice);
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
        writeText(font, Levels[currentChoice].t, -1, 90, 2);
      }
    }
  });
  gameLoop.start();
};
