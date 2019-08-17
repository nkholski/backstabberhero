import {
  init,
  Sprite,
  GameLoop,
  initKeys,
  keyPressed
} from "./dependencies/kontra.mjs";

/*
  Blocks:
  1. Vertical soil
  2. Horizontal soil
  3. Horizontal water
  4. Vertical ladder?

  Enemies:
  1. Stand
  2. Stand+turn
  3. Walk
  4. Walk+turn
  5. Sleeping

  Other:
  1. Bush (hide)
  2. Bucket (bring+hide) Jump ur upp för att gå in, ner för att gömma

  7*4 + 7 typer, 13x14 rutor = 27 (En bokstav, kan vara fler längder), 182 rutor = AscII(35) till 254
  Level med fyra plattformar och 3 fiender blir 7*2 = 14bytes
*/

const level = [
  [1, 10, 6, 8],
  [0, 10, 1, 10]
  //[0, 5, 3, 5] // Horizontell, 5 bitar, start (x,y) = (3,5) // Horizontell, 5 bitar, start (x,y) = (3,5)

  //[1, 5, 3, 2] // Vertikal, 2 bitar
];

const [up, right, down, left] = [0, 1, 2, 3];
const defaultBlocked = { top: false, right: false, down: false, left: false };

const getBlocked = (body, l = 2) => {
  body.blocked = { ...defaultBlocked };
  const col = body.blocked;

  level.forEach(item => {
    const horizontal = item[0] === 0;
    const overlap = {};
    overlap.left = 16 + item[2] * 16 + 16 * (horizontal ? item[1] : 0) - body.x; // Överlapp på vänster sida
    overlap.right = 16 + body.x - item[2] * 16; // Överlapp på höger sida
    overlap.top = 16 + item[3] * 16 + 16 * (horizontal ? 0 : item[1]) - body.y;
    overlap.bottom = 16 + body.y - item[3] * 16;

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
      // Separate bodies
      body.y =
        col.top || col.bottom ? 16 * Math.round(sprite.y / 16) : sprite.y;
      body.x = col.left || col.right ? 16 * Math.round(body.x / 16) : sprite.x;
    }
  });

  return col;
};

let { canvas, context } = init();
initKeys();

let sprite = Sprite({
  x: 16 * 6, // starting x,y position of the sprite
  y: 16 * 5,
  color: "red", // fill color of the sprite rectangle
  width: 16, // width and height of the sprite rectangle
  height: 16,
  blocked: { ...defaultBlocked }
});

let loop = GameLoop({
  // create the main game loop
  update: function() {
    // update the game state
    console.log(sprite.blocked);

    sprite.dx = 0;
    if (keyPressed("left")) {
      sprite.dx = -2;
    }
    if (keyPressed("right")) {
      sprite.dx = 2;
    }
    if (keyPressed("up") && sprite.blocked.bottom) {
      sprite.dy = -5;
    }
    sprite.dy += 0.2;

    if (sprite.dy > 0 && sprite.blocked.bottom) {
      sprite.dy = 0;
    }
    if (sprite.dy < 0 && sprite.blocked.up) {
      sprite.dy = 0;
    }

    sprite.update();

    getBlocked(sprite);
  },
  render: function() {
    // draw level
    level.forEach(item => {
      context.rect(
        item[2] * 16,
        item[3] * 16,
        item[0] === 0 ? item[1] * 16 : 16,
        item[0] === 1 ? item[1] * 16 : 16
      );
    });
    context.fill();
    // render the game state
    sprite.render();
  }
});

loop.start(); // start the game
