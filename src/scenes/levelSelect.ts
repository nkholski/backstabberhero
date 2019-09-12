// import { playMusic } from "./../functions/music";
import { SetState } from "./../functions/state";
import { helpScene } from "./help";
import { Title } from "./title";
import { MakeTempCanvas } from "./../functions/makeTempCanvas";
import { Levels } from "../common/levels";
import { GetFlash } from "../functions/getFlash";
import { GameLoop, getContext } from "../dependencies/kontra.js";
import writeText from "../functions/writeText";
import { GameScene } from "./game";
import { start } from "repl";
import { GetState } from "../functions/state";
import { zzfx } from "../dependencies/zzfx";
import { keyPressed, Ekeys, getTouches } from "../functions/input";
import GetSpriteSheets from "../functions/getSpriteSheets";
import { Coil } from "./coil";

const resetLocalStorage = () => {
  const progress = new Array(99).fill(-1);
  updateLocalStorage(progress);
  return progress;
};

const updateLocalStorage = progress => {
  localStorage.setItem("nkholski", JSON.stringify(progress));
};

export const levelSelectScene = (lvl?, stars?) => {
  const { font, gfx, context, customColors } = GetState();
  let transition;
  let killme = false;
  let tick = 0;
  let okToStart = false;
  // playMusic();

  context.save();
  const progress = localStorage.getItem("nkholski")
    ? JSON.parse(localStorage.getItem("nkholski"))
    : resetLocalStorage();
  if (lvl > -1 && progress[lvl] < stars) {
    progress[lvl] = stars;
    updateLocalStorage(progress);
  }

  let spriteSheets = GetSpriteSheets(gfx, customColors);
  SetState({ spriteSheets }); // Renew skin colors

  const next = progress.indexOf(-1);
  let currentChoice = next < 20 ? next : 0;

  const backgroundImage = MakeTempCanvas(context => {
    for (let i = 0; i < 20; i++) {
      context.beginPath();
      const x = i % 5;
      const y = (i - x) / 5;

      if (i > next && context.globalAlpha == 1) {
        context.globalAlpha = 0.5;
      }

      for (let knife = 0; knife < progress[i]; knife++) {
        const x = i % 5;
        const y = (i - x) / 5;
        context.drawImage(
          gfx,
          6 * 16,
          16,
          8,
          8,
          x * 45 + 16 + 19 - 8 - 6 + knife * 10,
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
      context.stroke();
    }
    context.globalAlpha = 1;

    context.fillStyle = "rgba(99,99,99,0.5)";

    for (let i = 0; i < 3; i++) {
      context.beginPath();
      context.rect(i * 75 + 16, 4 * 45 + 12, 70, 40);
      context.fill();

      writeText(
        font,
        ["TITLE", "HELP", "CUSTOM"][i],
        -(i * 75 + 16 + 37 - 4),
        4 * 45 + 12 + 3 + 10,
        1,
        null,
        null,
        context
      );

      context.stroke();
    }
  });

  const selectLevel = () => {
    context.drawImage(backgroundImage, 0, 0);

    context.beginPath();

    context.strokeStyle = "#fff";
    context.fillStyle = "rgba(255,255,255,0.3)";

    if (GetFlash(++tick / 9)) {
      if (currentChoice < 20) {
        context.rect(
          (currentChoice % 5) * 45 + 16,
          Math.floor(currentChoice / 5) * 45 + 12,
          40,
          40
        );
      } else {
        context.rect((currentChoice % 5) * 75 + 16, 4 * 45 + 12, 70, 40);
      }
    }
    context.fill();

    context.stroke();
  };

  const gameLoop = GameLoop({
    update: () => {
      if (!transition) {
        if (killme) {
          return;
        }
        const touches = getTouches();

        okToStart = okToStart || !keyPressed(Ekeys.Any);

        if (!okToStart || !keyPressed(Ekeys.Any)) {
          return;
        }
        okToStart = false;

        let wasCurrentChoice = currentChoice;

        if (keyPressed(Ekeys.Up)) {
          currentChoice -= 5;
        }
        if (keyPressed(Ekeys.Duck)) {
          currentChoice += 5;
        }
        if (keyPressed(Ekeys.Left)) {
          currentChoice--;
        }
        if (keyPressed(Ekeys.Right)) {
          currentChoice++;
        }

        if (wasCurrentChoice !== currentChoice) {
          zzfx(1, 0.3, 100, 0.4, 0.27, 0.1, 2, 2.9, 0.68);
        }

        if (touches[0]) {
          const { x, y } = touches[0];
          currentChoice =
            Math.floor((x - 16) / 45) + 5 * Math.floor((y - 12) / 45);

          if (currentChoice > 19) {
            console.log(x);
            currentChoice = x < 88 ? 20 : x > 160 ? 22 : 21;
          }
        }

        currentChoice =
          currentChoice > 22 ? 22 : currentChoice < 0 ? 0 : currentChoice;

        if (keyPressed(Ekeys.Action)) {
          killme = true;
          transition = true;
          if (currentChoice > 19) {
            gameLoop.stop();
            currentChoice === 20
              ? Title()
              : currentChoice === 21
              ? helpScene()
              : Coil();
            return;
          }
          setTimeout(() => {
            context.stroke();
            context.restore();
            GameScene(currentChoice);
            gameLoop.stop();
          }, 1e3);
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
