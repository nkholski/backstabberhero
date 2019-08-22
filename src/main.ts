import {
  init,
  Sprite,
  SpriteSheet,
  GameLoop,
  initKeys,
  keyPressed
} from "./dependencies/kontra";

//import Title from "./scenes/title";

let { canvas, context } = init();
let wellDone;
let gameOver;
let image;
let jumpReleased;

const font = new Image();
font.src = "assets/font.png";

context.font = "12px Courier New";
let player, knife, enemies;

const defaultBlocked = { top: false, right: false, bottom: false, left: false };

const facing = {
  left: -1,
  none: 0,
  right: 1
};

const level = [
  [0, 5, 7, 5],
  [0, 10, 1, 10],
  [1, 10, 6, 8],
  [0, 2, 2, 6],
  [0, 5, 9, 8],
  [1, 2, 9, 7],
  [0, 5, 9, 14]

  //[0, 5, 3, 5] // Horizontell, 5 bitar, start (x,y) = (3,5) // Horizontell, 5 bitar, start (x,y) = (3,5)

  //[1, 5, 3, 2] // Vertikal, 2 bitar
];
let spriteSheets = [];

(() => {
  image = new Image();
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

const writeText = (text, x, y, s) => {
  for (let i = 0; i < text.length; i++) {
    let code = (text.charCodeAt(i) - 65) * 8;
    if (code === -256) {
      code = 46 * 8;
    }
    context.drawImage(font, code, 0, 8, 8, x + i * 8 * s, y, s * 8, s * 8);
  }
};

const vision = enemy => {
  // 1. Linje i se-riktning tills stöter i ett objekt, hoppa 8px åt gången
  let seen = false;
  [1, 16].forEach(y => {
    let sight = 0;

    while ((sight += 8)) {
      const checkX = enemy.x + 8 + sight * enemy.facing;
      if (
        getBlocked({
          x: checkX,
          y: enemy.y + y,
          height: 14
        }).any ||
        checkX < 0 ||
        checkX > 232
      ) {
        break;
      }
    }
    const body = checkCollidingBody(player, {
      x: enemy.x + 8 + (enemy.facing === -1 ? -sight : 0),
      y: enemy.y + y,
      height: 24, // Discover ducked player, but be fair if jumping and head sticks up a bit
      width: sight
    });
    seen =
      seen ||
      !!checkCollidingBody(player, {
        x: enemy.x + 8 + (enemy.facing === -1 ? -sight : 0),
        y: enemy.y,
        height: 14, // Discover ducked player, but be fair if jumping and head sticks up a bit
        width: sight
      });
  });
  // 2. Boxkollision mellan player och synbody med höjd 12 eller något
  return seen;
};

const enemyLogic = enemy => {
  // console.log(enemy.blocked.right, enemy.blocked.left);
  const cliff = !checkCliff(enemy).bottom;
  let anim = "idle";
  enemy.dy += 0.2;
  if (enemy.dead) {
    return;
  }

  enemy.dx = 0;

  if (vision(enemy)) {
    if (!gameOver) {
      if (player.standing) {
        player.y += 16;
        player.height = 16;
      }
      enemy.gotPlayer = true;
      gameOver = true;
      player.stabTimer = -1;
    }
    player.facing = -enemy.facing;

    enemy.gotPlayer = true;
  } else if (!enemy.gotPlayer) {
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

    anim = enemy.walks ? "walk" : "idle";
  }

  enemy.playAnimation(anim + (enemy.facing == -1 ? "Left" : "Right"));
};

const checkCollidingBody = (body, other?) => {
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
    const overlap: any = {};
    // Break out share with body collision
    overlap.left =
      16 + item[2] * 16 + 16 * (horizontal ? item[1] - 1 : 0) - body.x; // Överlapp på vänster sida
    overlap.right = 16 + body.x - item[2] * 16; // Överlapp på höger sida
    overlap.top =
      16 + item[3] * 16 + 16 * (horizontal ? 0 : item[1] - 1) - body.y;
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
    x: body.x + (body.facing === 1 ? 8 : -8),
    y: body.y + 8
  };
  getBlocked(tmpBody);
  return tmpBody.blocked;
};

function boot() {
  wellDone = false;
  gameOver = false;
  initKeys();
  player = Sprite({
    x: 16 * 7, // starting x,y position of the sprite
    y: 16 * 7,
    color: "red", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...defaultBlocked },
    standing: true,
    facing: facing.right,
    stabTimer: -1,
    gameOver: -1,
    animations: spriteSheets[0].animations
  });

  knife = Sprite({
    width: 16, // width and height of the sprite rectangle
    height: 32,
    animations: spriteSheets[0].animations
  });

  const enemy1 = Sprite({
    x: 16 * 2, // starting x,y position of the sprite
    y: 16 * 7,
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
    x: 16 * 11, // starting x,y position of the sprite
    y: 16 * 6,
    color: "blue", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...defaultBlocked },
    facing: -1, // -1 0 1 == left, none, right
    dy: 0,
    walks: true,
    turnTimer: 99,
    animations: spriteSheets[1].animations
  });

  const enemy3 = Sprite({
    x: 16 * 12, // starting x,y position of the sprite
    y: 16 * 10,
    color: "blue", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...defaultBlocked },
    facing: -1, // -1 0 1 == left, none, right
    dy: 0,
    walks: true,
    turnTimer: 99,
    animations: spriteSheets[1].animations
  });

  loop.start(); // start the game

  enemies = [enemy1, enemy2, enemy3];
}

let loop = GameLoop({
  // create the main game loop
  update: function() {
    // update the game state

    player.stabTimer--;
    player.dy += 0.2;

    player.dx = 0;
    let anim = wellDone ? "idle" : "duck";

    if (player.y > 400) {
      gameOver = true;
    }

    if (gameOver) {
      if (keyPressed("z") && player.stabTimer < -7) {
        loop.stop();
        boot();
        return;
      }
    } else {
      if (!player.standing) {
        player.standing = true;
        player.y -= 16;
        player.height = 32;
      }
      anim = "idle";
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

      jumpReleased = jumpReleased || !keyPressed("up");

      if (player.blocked.bottom) {
        if (player.dy > 0) {
          player.dy = 0;
        }

        if (keyPressed("down")) {
          anim = "duck";
          player.standing = false;
          player.y += 16;
          player.height = 16;
          player.dx = 0;
        } else if (keyPressed("up") && jumpReleased) {
          player.dy = -4.5;
          jumpReleased = false;
        }
      }

      if (keyPressed("z") && player.stabTimer < -7 && player.standing) {
        // 7 tick > 100ms
        player.stabTimer = 9; // 1 = 16ms, => 9 * 16ms
      }

      // Funkar utan denna verkar det som, varför?
      if (player.dy < 0 && player.blocked.top) {
        player.dy = 0;
      }

      if (!player.blocked.bottom) {
        anim = player.dy > 0 ? "jumpDown" : "jumpUp";
      }

      knife.visible = false;
      if (player.stabTimer > 0) {
        anim = "stab";
        knife.visible = true;
        knife.playAnimation(
          "knife" + (player.facing === -1 ? "Left" : "Right")
        );
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
    }
    player.playAnimation(anim + (player.facing === -1 ? "Left" : "Right"));

    player.update();

    getBlocked(player);
    knife.x = player.x + player.facing * 16;
    knife.y = player.y;
    const collidingBody = checkCollidingBody(player);
    if (collidingBody) {
      collidingBody.facing = collidingBody.x < player.x ? 1 : -1;

      //loop.stop();
      //boot();
      //const title = new Title();
      //title.boot();
    }

    const wasWellDone = wellDone;
    wellDone = true;

    enemies.forEach(enemy => {
      enemyLogic(enemy);
      enemy.update();
      if (!enemy.dead) {
        wellDone = false;
        getBlocked(enemy);
      }
    });
    if (wellDone && !wasWellDone) {
      gameOver = true;
      player.stabTimer = 10;
    }
  },
  render: function() {
    // draw level
    const flash = (5 * Math.abs(Math.ceil(player.stabTimer / 5))) % 2 == 0;

    level.forEach(item => {
      //context.beginPath();

      // context.fillStyle = "#662F00";
      // context.rect(
      //   item[2] * 16,
      //   item[3] * 16,
      //   item[0] === 0 ? item[1] * 16 : 16,
      //   item[0] === 1 ? item[1] * 16 : 16
      // );
      // context.fill();

      // context.beginPath();

      // context.fillStyle = "#00B500";
      // context.rect(
      //   item[2] * 16,
      //   item[3] * 16 - 2,
      //   item[0] === 0 ? item[1] * 16 : 16,
      //   4
      // );
      // context.fill();
      for (let i = 0; i < item[1]; i++) {
        // @ts-ignore
        const top = -16 * (item[0] === 0 || i == 0);
        context.drawImage(
          image,
          9 * 16,
          16 + top,
          16,
          16,
          item[2] * 16 + (item[0] === 0 ? i * 16 : 0),
          item[3] * 16 + (item[0] === 1 ? i * 16 : 0),
          16,
          16
        );
      }
    });

    if (gameOver) {
      if (wellDone) {
        writeText("WELL DONE", 56, 50, 2);
      } else {
        writeText("GAME OVER", 56, 50, 2);
      }
      if (flash && player.stabTimer < -7) {
        writeText(" PRESS Z", 56 + 36, 70, 1);
      }
    } else if (knife.visible) {
      knife.render();
    }

    // render the game state
    player.render();

    enemies.forEach(enemy => {
      if (!enemy.dead || flash) {
        if (enemy.gotPlayer) {
          writeText("HEY!", enemy.x - ((4 * 8) / 2 - 8), enemy.y - 8, 1);
          // context.fillStyle = "#FFF";

          // context.fillText("!!!", enemy.x, enemy.y - 3);
        }
        enemy.render();
      }
    });
  }
});
