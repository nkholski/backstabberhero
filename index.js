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
  [0, 10, 1, 10],
  [1, 10, 6, 8],
  [0, 5, 9, 7]
  //[0, 5, 3, 5] // Horizontell, 5 bitar, start (x,y) = (3,5) // Horizontell, 5 bitar, start (x,y) = (3,5)

  //[1, 5, 3, 2] // Vertikal, 2 bitar
];

const defaultBlocked = { top: false, right: false, bottom: false, left: false };

const getBlocked = body => {
  body.dy += 0.2;
  body.blocked = { ...defaultBlocked };
  const col = body.blocked;

  level.forEach(item => {
    const horizontal = item[0] === 0;
    const overlap = {};
    overlap.left = 16 + item[2] * 16 + 16 * (horizontal ? item[1] : 0) - body.x; // Överlapp på vänster sida
    overlap.right = 16 + body.x - item[2] * 16; // Överlapp på höger sida
    overlap.top = 16 + item[3] * 16 + 16 * (horizontal ? 0 : item[1]) - body.y;
    overlap.bottom = body.height + body.y - item[3] * 16;

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
      body.y = col.top || col.bottom ? 16 * Math.round(body.y / 16) : body.y;
      body.x = col.left || col.right ? 16 * Math.round(body.x / 16) : body.x;

      // Stop velocity if colliding
      body.dx = col.left || col.right ? 0 : body.dx;
      body.dy = col.top || col.bottom ? 0 : body.dy;
    }

    if (body.name === "hello") {
      //  debugger;
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
  height: 32,
  blocked: { ...defaultBlocked },
  standing: true
});

const enemy1 = Sprite({
  x: 16 * 3, // starting x,y position of the sprite
  y: 16 * 5,
  color: "blue", // fill color of the sprite rectangle
  width: 16, // width and height of the sprite rectangle
  height: 32,
  blocked: { ...defaultBlocked },
  facing: 1, // -1 0 1 == left, none, right
  dy: 0,
  walks: true
});

const enemy2 = Sprite({
  x: 16 * 9, // starting x,y position of the sprite
  y: 16 * 5,
  color: "blue", // fill color of the sprite rectangle
  width: 16, // width and height of the sprite rectangle
  height: 32,
  blocked: { ...defaultBlocked },
  facing: -1, // -1 0 1 == left, none, right
  dy: 0,
  walks: true
});

const enemies = [enemy1, enemy2];

const checkCliff = body => {
  const tmpBody = {
    ...body,
    x: body.x + (body.facing === 1 ? 24 : -8),
    y: body.y + 8
  };
  getBlocked(tmpBody);
  return tmpBody.blocked;
  debugger;
};

const enemyLogic = enemy => {
  enemy.dx = enemy.walks ? enemy.facing * 0.5 : 0;
  // console.log(enemy.blocked.right, enemy.blocked.left);
  const cliff = !checkCliff(enemy).bottom;
  if (
    (enemy.blocked.left && enemy.dx < 0) ||
    (enemy.blocked.right && enemy.dx > 0) ||
    (enemy.blocked.bottom && cliff)
  ) {
    // debugger;
    enemy.facing = -enemy.facing;
  }
};

let loop = GameLoop({
  // create the main game loop
  update: function() {
    // update the game state
    if (!sprite.standing) {
      sprite.standing = true;
      sprite.y -= 16;
      sprite.height = 32;
    }

    sprite.dx = 0;
    if (keyPressed("left")) {
      sprite.dx = -1;
    }
    if (keyPressed("right")) {
      sprite.dx = 1;
    }

    if (sprite.blocked.bottom) {
      if (sprite.dy > 0) {
        sprite.dy = 0;
      }

      if (keyPressed("up")) {
        sprite.dy = -4.5;
      }
      if (keyPressed("down") && sprite.standing) {
        console.log("duck");
        sprite.standing = false;
        sprite.y += 16;
        sprite.height = 16;
      }
    }

    if (sprite.dy < 0 && sprite.blocked.up) {
      sprite.dy = 0;
    }
    sprite.update();
    getBlocked(sprite);

    enemies.forEach(enemy => {
      enemyLogic(enemy);
      enemy.update();
      getBlocked(enemy);
    });
  },
  render: function() {
    // draw level
    level.forEach(item => {
      context.beginPath();

      context.fillStyle = "#662F00";
      context.rect(
        item[2] * 16,
        item[3] * 16,
        item[0] === 0 ? item[1] * 16 : 16,
        item[0] === 1 ? item[1] * 16 : 16
      );
      context.fill();

      context.beginPath();

      context.fillStyle = "#00B500";
      context.rect(
        item[2] * 16,
        item[3] * 16 - 2,
        item[0] === 0 ? item[1] * 16 : 16,
        4
      );
      context.fill();
    });
    // render the game state
    sprite.render();
    enemies.forEach(enemy => {
      enemy.render();
    });
  }
});

loop.start(); // start the game
