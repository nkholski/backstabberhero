import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  initKeys,
  keyPressed
} from "./dependencies/kontra.mjs";

let { canvas, context } = init();

let counter = 0;

context.font = "12px Courier New";
let player, knife, enemies;

const defaultBlocked = { top: false, right: false, bottom: false, left: false };

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
let spriteSheets = [];

(() => {
  let image = new Image();
  image.src = "assets/gfx8colors.png";
  image.onload = function() {
    /** COLOR CHANGE */
    var tmpCanvas = document.createElement("canvas");
    var tmpContext = tmpCanvas.getContext("2d");
    var img = image;
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpContext.drawImage(img, 0, 0);
    var imageData = tmpContext.getImageData(0, 0, img.width, img.height);

    for (var i = 0; i < imageData.data.length; i += 4) {
      // is this pixel the old rgb?
      if (
        imageData.data[i] == 7 &&
        imageData.data[i + 1] == 57 &&
        imageData.data[i + 2] == 239
      ) {
        // change to your new rgb
        imageData.data[i] = 104;
        imageData.data[i + 1] = 38;
        imageData.data[i + 2] = 104;
      }
    }
    tmpContext.putImageData(imageData, 0, 0);

    /** END OF */

    const baseAnims = [
      ["jumpUp", 0, null, false],
      ["jumpDown", 1, null, false],
      ["walk", "0..3", 3, true],
      ["idle", 6, null, false],
      ["duck", 7, null, false],
      ["stab", 4, null, false],
      ["knife", 5, null, false],
      ["dead", 10, null, false]
    ];

    let animations = {};
    baseAnims.forEach(anim => {
      animations[anim[0] + "Right"] = {
        frames: anim[1],
        frameRate: anim[2],
        loop: anim[3]
      };
      animations[anim[0] + "Left"] = {
        ...animations[anim[0] + "Right"],
        flipped: true
      };
    });

    [image, tmpCanvas].forEach((image, i) => {
      spriteSheets[i] = SpriteSheet({
        image,
        frameWidth: 16,
        frameHeight: 32,
        animations
      });
    });

    boot();
  };
})();

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

const vision = enemy => {
  // 1. Linje i se-riktning tills stöter i ett objekt, hoppa 8px åt gången
  let sight = 0;
  while ((sight += 8)) {
    const checkX = enemy.x + 8 + sight * enemy.facing;
    if (
      getBlocked({
        x: checkX,
        y: enemy.y,
        height: 16
      }).any ||
      checkX < 0 ||
      checkX > 232
    ) {
      break;
    }
  }
  // 2. Boxkollision mellan player och synbody med höjd 12 eller något
  return checkCollidingBody(player, {
    x: enemy.x + 8 + (enemy.facing === -1 ? -sight : 0),
    y: enemy.y,
    height: 24, // Discover ducked player, but be fair if jumping and head sticks up a bit
    width: sight
  });
};

const enemyLogic = enemy => {
  // console.log(enemy.blocked.right, enemy.blocked.left);
  const cliff = !checkCliff(enemy).bottom;

  enemy.dy += 0.2;
  if (enemy.dead) {
    return;
  }

  enemy.dx = 0;

  if (vision(enemy)) {
    console.log("Seen");
  }

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

  let anim =
    (enemy.walks ? "walk" : "idle") + (enemy.facing == -1 ? "Left" : "Right");

  enemy.playAnimation(anim);
};

const checkCollidingBody = (body, other) => {
  let col = null;
  const others = other ? [other] : enemies;

  others.forEach(enemy => {
    if (enemy.dead) {
      return;
    }
    // Could share with getBlocked
    if (
      body.x < enemy.x + enemy.width &&
      body.x + 16 > enemy.x &&
      body.y < enemy.y + enemy.height &&
      body.y + body.height > enemy.y
    ) {
      col = enemy;
    }
    if (enemy.vision === true && enemy.y === 128) {
      //  debugger;
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

const checkCliff = body => {
  const tmpBody = {
    ...body,
    x: body.x + (body.facing === 1 ? 24 : -8),
    y: body.y + 8
  };
  getBlocked(tmpBody);
  return tmpBody.blocked;
};

function boot() {
  initKeys();
  player = Sprite({
    x: 16 * 4, // starting x,y position of the sprite
    y: 16 * 7,
    color: "red", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...defaultBlocked },
    standing: true,
    facing: facing.right,
    stabTimer: -1,
    animations: spriteSheets[0].animations
  });

  knife = Sprite({
    width: 16, // width and height of the sprite rectangle
    height: 32,
    animations: spriteSheets[0].animations
  });

  const enemy1 = Sprite({
    x: 16 * 2, // starting x,y position of the sprite
    y: 16 * 5,
    color: "blue", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...defaultBlocked },
    facing: -1, // -1 0 1 == left, none, right
    dy: 0,
    walks: true,
    animations: spriteSheets[1].animations
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
    walks: true,
    animations: spriteSheets[1].animations
  });

  loop.start(); // start the game

  enemies = [enemy1, enemy2];
}

let loop = GameLoop({
  // create the main game loop
  update: function() {
    // update the game state

    player.stabTimer--;
    player.dy += 0.2;

    if (!player.standing) {
      player.standing = true;
      player.y -= 16;
      player.height = 32;
    }

    player.dx = 0;
    let anim = "idle";
    if (keyPressed("left")) {
      player.dx = -1;
      player.facing = facing.left;
      anim = "walk";
    }
    if (keyPressed("right")) {
      player.dx = 1;
      player.facing = facing.right;
      anim = "walk";
    }

    if (keyPressed("z") && player.stabTimer < -7) {
      // 7 tick > 100ms
      player.stabTimer = 9; // 1 = 16ms, => 9 * 16ms
    }

    if (player.blocked.bottom) {
      if (player.dy > 0) {
        player.dy = 0;
      }

      if (keyPressed("down") && player.standing) {
        anim = "duck";
        player.standing = false;
        player.y += 16;
        player.height = 16;
        player.dx = 0;
      } else if (keyPressed("up")) {
        player.dy = -4.5;
      }
    }

    // Funkar utan denna verkar det som, varför?
    if (player.dy < 0 && player.blocked.top) {
      player.dy = 0;
    }

    knife.visible = false;
    if (player.stabTimer > 0) {
      anim = "stab";
      knife.visible = true;
      knife.playAnimation("knife" + (player.facing === -1 ? "Left" : "Right"));
      const stabbedEnemy = checkCollidingBody({
        height: 16,
        x: player.x + player.facing * 16,
        y: player.y
      });
      if (stabbedEnemy) {
        stabbedEnemy.dead = true;
        stabbedEnemy.dx = player.facing * 1;
        stabbedEnemy.dy = -2;
        stabbedEnemy.playAnimation(
          "dead" + (player.facing === 1 ? "Left" : "Right")
        );
      }
    }

    if (!player.blocked.bottom) {
      anim = player.dy > 0 ? "jumpDown" : "jumpUp";
    }

    player.playAnimation(anim + (player.facing === -1 ? "Left" : "Right"));

    player.update();
    knife.x = player.x + player.facing * 16;
    knife.y = player.y;
    getBlocked(player);

    if (checkCollidingBody(player)) {
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

    context.fillStyle = "#FFF";

    context.fillText("!!!", 10, 50);
    context.fillText(counter++, 35, 50);

    // render the game state
    player.render();
    if (knife.visible) {
      knife.render();
    }
    enemies.forEach(enemy => {
      if (!enemy.dead || (5 * Math.abs(Math.ceil(player.stabTimer / 5))) % 2) {
        enemy.render();
      }
    });
  }
});
