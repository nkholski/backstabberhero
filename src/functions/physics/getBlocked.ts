import { CDefaultBlocked } from "./../../common/constants";
export const GetBlocked = (body, platforms, height = null) => {
  body.blocked = { ...CDefaultBlocked, left: body.x < 0, right: body.x > 240 };
  body.x = body.blocked.left ? 0 : body.x;
  let debug = false;
  if (height) {
    debug = true;
  }
  let adjY = height ? body.height - height : 0;
  let y = body.y + adjY;
  height = height ? height : body.height;

  const col = body.blocked;

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
    overlap.top = platform.y + platform.h - y;
    overlap.bottom = height + y - platform.y;

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
      body.y =
        col.top || col.bottom
          ? 16 * Math.round(body.y / 16) + (col.top ? adjY : 0)
          : body.y;
      body.x = col.left || col.right ? 16 * Math.round(body.x / 16) : body.x;

      if (debug && body.dy < 0) {
        console.log(body, y, height);
        debugger;
      }

      // Stop velocity if colliding
      body.dx = col.left || col.right ? 0 : body.dx;
      body.dy = col.top || col.bottom ? 0 : body.dy;
    }
  });

  return col;
};
