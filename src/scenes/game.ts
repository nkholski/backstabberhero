import { MakeEnemies } from "./../functions/makeEnemies";
import Title from "./title";
import { CheckCollidingBody } from "./../functions/physics/checkCollidingBody";
import { GetBlocked } from "./../functions/physics/getBlocked";
import { CDefaultBlocked } from "./../common/constants";
import { EFacing } from "./../common/enums";
import { GetFlash } from "../functions/getFlash";
import {
  Sprite,
  GameLoop,
  getContext,
  initKeys,
  keyPressed
} from "../dependencies/kontra.js";
import writeText from "../functions/writeText";
import { EnemyUpdate } from "../functions/enemyUpdate";

export const GameScene = (assets, spriteSheets, { l: level, e: enemyData }) => {
  const context = getContext();
  console.log("GAME SCENE", enemyData);

  let player,
    knife,
    enemies,
    wellDone,
    gameOver,
    jumpReleased,
    flash,
    elapsedTime;
  let tick = 0;
  let sceneState = 1;

  // Parse Level
  wellDone = false;
  gameOver = false;
  initKeys();
  player = Sprite({
    x: 16 * 7, // starting x,y position of the sprite
    y: 16 * 7,
    color: "red", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...CDefaultBlocked },
    standing: true,
    facing: EFacing.Right,
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
    blocked: { ...CDefaultBlocked },
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
    blocked: { ...CDefaultBlocked },
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
    blocked: { ...CDefaultBlocked },
    facing: -1, // -1 0 1 == left, none, right
    dy: 0,
    walks: true,
    turnTimer: 99,
    animations: spriteSheets[1].animations
  });

  enemies = [enemy1, enemy2, enemy3];

  enemies = MakeEnemies(enemyData, spriteSheets);

  // Define gameLoop

  const gameLoop = GameLoop({
    update: function() {
      const state = {
        level,
        player,
        enemies,
        gameOver
      };

      tick++;
      elapsedTime = tick / 60; // Elapsed time in ms
      flash = GetFlash(tick);

      player.stabTimer--;
      player.dy += 0.2;

      player.dx = 0;
      let anim = wellDone ? "idle" : "duck";

      if (player.y > 400) {
        gameOver = true;
      }

      if (gameOver) {
        if (keyPressed("z") && player.stabTimer < -7 && sceneState === 1) {
          sceneState = 2;
          gameLoop.stop();
          new Title().boot(assets, spriteSheets);
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
          player.facing = EFacing.Left;
          anim = "walk";
        }
        if (keyPressed("right")) {
          player.dx = 1;
          player.facing = EFacing.Right;
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
          const stabbedEnemy = CheckCollidingBody(
            {
              height: 16,
              x: player.x + player.facing * 16,
              y: player.y
            },
            enemies
          );
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
      player.playAnimation(
        anim + (player.facing === EFacing.Left ? "Left" : "Right")
      );

      player.update();

      GetBlocked(player, level);
      knife.x = player.x + player.facing * 16;
      knife.y = player.y;

      // Run into enemy
      const collidingBody = CheckCollidingBody(player, enemies);
      if (collidingBody) {
        collidingBody.facing =
          collidingBody.x < player.x ? EFacing.Right : EFacing.Left;

        //loop.stop();
        //boot();
      }

      const wasWellDone = wellDone;
      wellDone = true;

      enemies.forEach(enemy => {
        EnemyUpdate(enemy, state);
        enemy.update();
        if (!enemy.dead) {
          wellDone = false;
          GetBlocked(enemy, level);
          if (enemy.gotPlayer) {
            if (!gameOver) {
              if (player.standing) {
                player.y += 16;
                player.height = 16;
              }
              gameOver = true;
              player.stabTimer = -1;
            }
          }
        }
      });
      if (wellDone && !wasWellDone) {
        gameOver = true;
        player.stabTimer = 10;
      }
    },
    render: function() {
      level.forEach(item => {
        for (let i = 0; i < item[1]; i++) {
          // @ts-ignore
          const top = -16 * (item[0] === 0 || i == 0);
          context.drawImage(
            assets.gfx8colors,
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
          writeText(assets.font, "GREAT STABBING", -1, 50, 2); // OK, GOOD eller GREATz
        } else {
          writeText(assets.font, "STAB OVER", 56, 50, 2);
        }
        if (flash && player.stabTimer < -7) {
          writeText(assets.font, " PRESS Z", 56 + 36, 70, 1);
        }
      } else if (knife.visible) {
        knife.render();
      }

      // render the game state
      player.render();

      enemies.forEach(enemy => {
        if (!enemy.dead || flash) {
          if (enemy.gotPlayer) {
            writeText(
              assets.font,
              "HEY!",
              enemy.x - ((4 * 8) / 2 - 8),
              enemy.y - 8,
              1
            );
          }
          if (enemy.sleepTimer > 0) {
            writeText(
              assets.font,
              "" + Math.ceil(enemy.sleepTimer / 1e3 - elapsedTime),
              enemy.x - ((4 * 8) / 2 - 8),
              enemy.y - 8,
              1
            );
          }
          enemy.render();
        }
      });
    }
  });

  gameLoop.start();
};
