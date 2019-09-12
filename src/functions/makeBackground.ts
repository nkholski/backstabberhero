// import { Touch } from "./touch";
import { MakeTempCanvas } from "./makeTempCanvas";
import { makeRandom } from "./makeRandom";
import { GetState } from "./state";

export const MakeBackground = (lvl: number, level) => {
  return MakeTempCanvas((context: CanvasRenderingContext2D) => {
    const { mobile, gfx } = GetState();

    const rnd = makeRandom(lvl);
    const night = lvl % 2;
    context.beginPath();

    context.fillStyle = night ? "#036" : "#39F";
    context.fillRect(0, 0, 256, 240);

    // STARS
    if (night) {
      context.fillStyle = "#FFF";
      for (let i = 0; i < 10 + rnd(5); i++) {
        const w = rnd(2, 1);
        context.fillRect(rnd(256), rnd(120), w, w);
      }
    } else {
      context.fillStyle = "#FF0";
    }

    const [s, x, y] = [rnd(16, 6), 9 + rnd(245), 4 + rnd(20)];

    for (let i = 3; --i; ) {
      context.globalAlpha = 2 / (i * 3);
      context.arc(x, y + i, s * i, 0, 2 * Math.PI, false);
      context.lineWidth = 0;
      context.fill();
      context.beginPath();
    }

    context.globalAlpha = 1;
    for (let i = 1; i > 0; i--) {
      let x = 0;
      while (x < 256) {
        context.fillStyle = night ? "#345" : "#777";

        let w = 36 + Math.round(16 * rnd(2));
        let y = rnd(100, 48);
        context.fillRect(x, y, w, 500);

        context.stroke();
        context.globalAlpha = 0.2;
        for (let wx = 0; wx < w - 8; wx += 8) {
          for (let hy = 6; hy < 500; hy += 16) {
            context.fillStyle = rnd(2) ? "#000" : rnd(3) ? "#fff" : "#ff0";

            context.fillRect(x + wx + 2, y + hy, 6, 8);
          }
        }
        context.stroke();
        context.globalAlpha = 1;
        x = Math.floor(x + w + rnd(3));
      }
    }

    level.platforms.forEach(item => {
      for (let y = 0; y < item.h; y += 16) {
        for (let x = 0; x < item.w; x += 16) {
          const top = -16 * (y === 0 ? 1 : 0);
          // @ts-ignore
          context.drawImage(
            gfx,
            8 * 16,
            16 + top,
            16,
            16,
            item.x + x,
            item.y + y,
            16,
            16
          );
        }
      }
    });
    // mobile ? Touch.draw(context) : null;
  });
};
