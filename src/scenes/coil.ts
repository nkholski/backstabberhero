import { GetFlash } from "./../functions/getFlash";
import { SetState } from "./../functions/state";
import { Title } from "./title";
import { Ekeys, getTouches, keyPressed } from "../functions/input";
import { GameLoop } from "../dependencies/kontra.js";
import writeText from "../functions/writeText";
import { GetState } from "../functions/state";
import GetSpriteSheets from "../functions/getSpriteSheets";

export const Coil = () => {
  let { font, spriteSheets, context, customColors, gfx } = GetState();
  const clickys = [];
  let allowed =
    //@ts-ignore
    document.monetization && document.monetization.state === "started";
  let tick = 0;
  let okToLeave = false;
  context.fillStyle = "#F00";
  const y = 60;

  let gameLoop = GameLoop({
    update: () => {
      tick++;
      context.closePath;

      let touches = [...getTouches()];

      okToLeave = okToLeave || !keyPressed(Ekeys.Any);

      if (okToLeave && touches.length === 0 && keyPressed(Ekeys.Any)) {
        touches[0] = { x: 0, y: 121 };
        console.log("ALIVE");
      }

      if (touches[0]) {
        let { x, y } = touches[0];
        if (y > 120 && tick > 99) {
          gameLoop.stop();
          Title();
        }
        if (allowed) {
          for (let i = 0; i < 3; i++) {
            for (let operator = 0; operator < 2; operator++) {
              let leftSide = clickys[i] + (operator > 0 ? 50 : -12);
              if (x > leftSide && x < leftSide + 12 && y > 60 && y < 60 + 50) {
                customColors[i] += operator > 0 ? 1 : -1;
                customColors[i] =
                  customColors[i] > 255
                    ? 255
                    : customColors[i] < 0
                    ? 0
                    : customColors[i];
              }
            }
          }
        }
        spriteSheets = GetSpriteSheets(gfx, customColors);
        SetState({ spriteSheets }); // Update spritesheets

        //if(x>clicky[i][0]-)
        //   const { x, y } = touches[0];
        //   if(x>clickys[i][0] && x<clickys[i])
      }
      //      customColors[0] = Math.round(255 * Math.random());
    },
    render: () => {
      writeText(font, "BACKSTABBER", -1, 16, 2);
      writeText(font, "CUSTOMIZATION", -1, 32, 2);

      if (GetFlash(tick / 9) && tick > 99) {
        writeText(font, "PRESS T FOR TITLE", 100, 150, 1);
      }
      context.beginPath();

      ["RED", "GREEN", "BLUE"].forEach((color, i) => {
        clickys[i] = 13 + i * 90;
        context.rect(13 + i * 90, 0 + y, 50, 50);
        context.rect(1 + i * 90, 24 + y, 8, 2);
        context.rect(66 + i * 90, 24 + y, 8, 2);
        context.rect(66 + i * 90 + 3, 21 + y, 2, 8);
        writeText(font, color, -(36 + i * 90), 9 + y, 1);
        writeText(
          font,
          Math.round(100 * (customColors[i] / 255)),
          -(36 + i * 90),
          22 + y,
          2
        );
      });

      context.stroke();

      if (!allowed) {
        context.beginPath();
        context.rect(-9, 70, 265, 11);
        context.fill();
        writeText(font, "ONLY FOR COIL SUBSCRIBERS", -1, 72, 1);
        context.stroke();
      }

      context.drawImage(spriteSheets[0].image, 48, 0, 32, 32, 0, 120, 120, 120);
    }
  });
  gameLoop.start();
};
