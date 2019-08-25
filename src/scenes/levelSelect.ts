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
import { start } from "repl";
import { GetState } from "../functions/state";

const resetLocalStorage = () => {
  const progress = new Array(25).fill(-1);
  updateLocalStorage(progress);
  return progress;
};

const updateLocalStorage = progress => {
  console.log("PR", progress);
  localStorage.setItem("nkholski", JSON.stringify(progress));
};

export const levelSelectScene = (lvl?) => {
  const { font, assets, spriteSheets } = GetState();

  let lastTick = 0;
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
  console.log(lvl, lvl);

  const next = progress.indexOf(-1);
  let currentChoice = next;
  const selectLevel = () => {
    const hej = new Array(25).fill(1);
    hej.forEach((level, i) => {
      const x = i % 5;
      const y = (i - x) / 5;
      if (i > next) {
        context.stroke();

        context.globalAlpha = 0.5;
      }
      context.rect(x * 45 + 16, y * 45 + 12, 40, 40);
      if (currentChoice !== i || GetFlash(++tick / 6)) {
        writeText(font, i + 1, -(x * 45 + 16 + 19), y * 45 + 12 + 3, 2);
      }
      // console.log(-(x * 45 + 16 + 20));
    });
    context.stroke();
    context.globalAlpha = 1;
  };

  const gameLoop = GameLoop({
    update: () => {
      if (killme) {
        return;
      }
      okToStart = okToStart || !keyPressed("z");
      if (okToStart && keyPressed("z")) {
        killme = true;
        GameScene(assets, spriteSheets, currentChoice);
        gameLoop.stop();
      }
    },

    render: () => {
      // console.log(lastTick - new Date().getMilliseconds());
      lastTick = new Date().getMilliseconds();
      selectLevel();
    }
  });
  gameLoop.start();
};
