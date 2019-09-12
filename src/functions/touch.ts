/* ABANDONED NICER LOOKING TOUCH GUI :-( */

import { GetState } from "./state";
import writeText from "./writeText";

export const Touch = {
  draw: context => {
    const { font } = GetState();
    const { height } = context.canvas;
    const adj = height - 160;

    const controls = [
      { t: "L", key: "left", x: 5, y: 20 },
      { t: "R", key: "right", x: 58, y: 78 },
      { t: "J", key: "right", x: 203, y: 0 },
      { t: "S", key: "right", x: 203, y: 53 },
      { t: "D", key: "right", x: 203, y: 106 }
    ];

    context.fillStyle = "#000";
    context.rect(0, 240, 256, height);
    context.fill();

    controls.forEach(control => {
      context.beginPath();
      context.strokeStyle = "#FFF";
      control.y += adj;
      context.rect(control.x, control.y, 48, 48);
      writeText(
        font,
        control.t,
        control.x + 8,
        control.y + 8,
        4,
        null,
        null,
        context
      );
      context.stroke();
    });

    //@ts-ignore
    // context.canvas.ontouchstart = (a, b) => {
    // };

    // @ts-ignore
  }
  //   context.rect(5, 256 + 10, 50, 48); // left
  //   context.rect(5 + 40, 256 + 80, 48, 48); // right

  //   context.rect(256 - 55, 256 + 10, 48, 48); // Jump
  //   writeText(font, "J", 256 - 55 + 8, 256 + 18, 3);

  //   context.rect(256 - 55, 256 + 65, 48, 48); // Stab
  //   writeText(font, "S", 256 - 55 + 8, 256 + 65 + 18, 3);

  //   context.rect(256 - 55, 256 + 120, 48, 48); // Duck
  //   writeText(font, "S", 256 - 55 + 8, 256 + 65 + 18, 3);
};
