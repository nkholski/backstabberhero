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

const facing = {
  left: -1,
  none: 0,
  right: 1
};

const level = [
  [0, 10, 1, 10],
  [1, 10, 6, 8],
  [0, 5, 9, 7]
  //[0, 5, 3, 5] // Horizontell, 5 bitar, start (x,y) = (3,5) // Horizontell, 5 bitar, start (x,y) = (3,5)

  //[1, 5, 3, 2] // Vertikal, 2 bitar
];

const defaultBlocked = { top: false, right: false, bottom: false, left: false };

const getCollidingEnemy = body => {
  let col = null;
  enemies.forEach(enemy => {
    if (enemy.dead) {
      return;
    }
    // Could share with getBlocked
    if (
      body.x < enemy.x + 16 &&
      body.x + 16 > enemy.x &&
      body.y < enemy.y + 32 &&
      body.y + body.height > enemy.y
    ) {
      col = enemy;
    }
  });
  return col;
};

const getBlocked = body => {
  body.blocked = { ...defaultBlocked };
  const col = body.blocked;

  level.forEach(item => {
    const horizontal = item[0] === 0;
    const overlap = {};
    // Break out share with body collision
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

let player = Sprite({
  x: 16 * 6, // starting x,y position of the sprite
  y: 16 * 5,
  color: "red", // fill color of the sprite rectangle
  width: 16, // width and height of the sprite rectangle
  height: 32,
  blocked: { ...defaultBlocked },
  standing: true,
  facing: facing.right,
  stabTimer: -1
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
  walks: false
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
};

const enemyLogic = enemy => {
  // console.log(enemy.blocked.right, enemy.blocked.left);
  const cliff = !checkCliff(enemy).bottom;
  enemy.dx = 0;
  enemy.dy += 0.2;

  if (enemy.walks) {
    enemy.dx = enemy.facing * 0.5;
    if (
      (enemy.blocked.left && enemy.dx < 0) ||
      (enemy.blocked.right && enemy.dx > 0) ||
      (enemy.blocked.bottom && cliff)
    ) {
      // debugger;
      enemy.facing = -enemy.facing;
    }
  }
};

let loop = GameLoop({
  // create the main game loop
  update: function() {
    // update the game state

    player.stabTimer--;
    player.dy += 0.2;

    if (player.stabTimer < 0 && player.stabTimer > -8) {
      console.log("Stab cool");
    }

    if (!player.standing) {
      player.standing = true;
      player.y -= 16;
      player.height = 32;
    }

    player.dx = 0;
    if (keyPressed("left")) {
      player.dx = -1;
      player.facing = facing.left;
    }
    if (keyPressed("right")) {
      player.dx = 1;
      player.facing = facing.right;
    }
    if (keyPressed("z") && player.stabTimer < -7) {
      // 7 tick > 100ms
      player.stabTimer = 32; // 1 = 16ms, 32 tick > 500ms (500/16 = 31.25)
    }

    if (player.blocked.bottom) {
      if (player.dy > 0) {
        player.dy = 0;
      }

      if (keyPressed("up")) {
        player.dy = -4.5;
      }
      if (keyPressed("down") && player.standing) {
        console.log("duck");
        player.standing = false;
        player.y += 16;
        player.height = 16;
      }
    }

    if (player.dy < 0 && player.blocked.up) {
      player.dy = 0;
    }
    player.update();
    getBlocked(player);

    if (player.stabTimer > 0) {
      console.log("Stabbing");
      const stabbedEnemy = getCollidingEnemy({
        height: 16,
        x: player.x + player.facing * 16,
        y: player.y
      });
      if (stabbedEnemy) {
        console.log("Died");
        stabbedEnemy.dead = true;
      }
    }

    if (getCollidingEnemy(player)) {
      console.log("Touch death");
    }

    enemies.forEach(enemy => {
      enemyLogic(enemy);
      enemy.update();
      if (!enemy.dead) {
        getBlocked(enemy);
      }
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
    player.render();
    enemies.forEach(enemy => {
      enemy.render();
    });
  }
});

loop.start(); // start the game
