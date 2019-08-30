import { MakeTempCanvas } from "./makeTempCanvas";
import { makeRandom } from "./makeRandom";
export const MakeBackground = (lvl: number) => {
  return MakeTempCanvas((context: CanvasRenderingContext2D) => {
    const rnd = makeRandom(lvl);
    context.beginPath();

    context.fillStyle = lvl % 2 ? "#036" : "#39F";
    context.fillRect(0, 0, 256, 240);

    if (lvl % 2) {
      context.fillStyle = "#FFF";
      for (let i = 0; i < 10 + rnd(5); i++) {
        const w = rnd(2, 1);
        context.fillRect(rnd(256), rnd(120), w, w);
      }
    }

    for (let i = 2; i > 0; i--) {
      let x = 0;
      context.fillStyle = "hsl(205, 15%, 53%)";
      if (i === 2) {
        context.fillStyle = "hsl(205, 15%, 38%)";
      }
      let w = 0;
      while (x < 256) {
        w = Math.round(rnd(16 + 16 * 2) / (i / 2));
        let y = rnd(99, 80);
        context.fillRect(x, y, w, 500);

        Math.floor((x = x + w + rnd(10)));
        // Windows
        for (let num = rnd(5), i2 = 0; i2 < num; i2++) {
          context.fillStyle = "hsl(205, 15%, 12%)";
          context.fillRect(x + 10, 100, 10, 20);
        }
      }
    }
    // context.fill();
  });
};
