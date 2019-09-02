import { CDefaultBlocked } from "./../../common/constants";
export const GetBlocked = (body, platforms) => {
  body.blocked = { ...CDefaultBlocked };
  const col = body.blocked;

  if (body.color === "red") {
    console.log(platforms);
  }
  platforms.forEach((platform, i) => {
    const overlap: any = {};

    // Break out share with body collision
    // overlap.left =
    //   16 + item[2] * 16 + 16 * (horizontal ? item[1] - 1 : 0) - body.x; // Överlapp på vänster sida
    // overlap.right = 16 + body.x - item[2] * 16; // Överlapp på höger sida
    // overlap.top =
    //   16 + item[3] * 16 + 16 * (horizontal ? 0 : item[1] - 1) - body.y;
    // overlap.bottom = body.height + body.y - item[3] * 16;

    overlap.left = platform.x + platform.w - body.x; // Överlapp på vänster sida
    overlap.right = 16 + body.x - platform.x; // Överlapp på höger sida
    overlap.top = 16 + platform.y + platform.h - body.y;
    overlap.bottom = body.height + body.y - platform.y;

    // All sides overlap == collision
    if (
      overlap.top >= 0 &&
      overlap.right >= 0 &&
      overlap.bottom >= 0 &&
      overlap.left >= 0
    ) {
      // Shortest overlap is collliding side
      let d = 99;
      let cdir = "";
      ["left", "right", "top", "bottom"].forEach(key => {
        if (overlap[key] < d) {
          d = overlap[key];
          cdir = key;
        }
      });
      col[cdir] = true;
      col.any = true;
      // Separate bodies
      body.y = col.top || col.bottom ? 16 * Math.round(body.y / 16) : body.y;
      body.x = col.left || col.right ? 16 * Math.round(body.x / 16) : body.x;

      // Stop velocity if colliding
      body.dx = col.left || col.right ? 0 : body.dx;
      body.dy = col.top || col.bottom ? 0 : body.dy;
    }
  });

  return col;
};
