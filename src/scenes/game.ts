import { getLevel } from "./../functions/getLevel";
import { GetState } from "./../functions/state";
import { MakeBackground } from "./../functions/makeBackground";
import { Levels } from "./../common/levels";
import { MakeEnemies } from "./../functions/makeEnemies";
import { Title } from "./title";
import { CheckCollidingBody } from "./../functions/physics/checkCollidingBody";
import { GetBlocked } from "./../functions/physics/getBlocked";
import { CDefaultBlocked } from "./../common/constants";
import { EFacing, ETurnState, ETurnTimes } from "./../common/enums";
import { GetFlash } from "../functions/getFlash";
import {
  Sprite,
  GameLoop,
  initKeys,
  keyPressed
} from "../dependencies/kontra.js";
import { zzfx } from "../dependencies/zzfx";

import writeText from "../functions/writeText";
import { EnemyUpdate } from "../functions/enemyUpdate";
import { levelSelectScene } from "./levelSelect";

export const GameScene = (lvl: number) => {
  //const { l: level, e: enemyData, h: heroCoordinates } = getLevel(lvl);
  const level = getLevel(lvl);
  console.log(level);
  const { spriteSheets, assets, context } = GetState();
  let turnTimer = 100;
  let starCount = 0;

  let player,
    knife,
    enemies,
    wellDone,
    gameOver,
    jumpReleased,
    flash,
    stars,
    elapsedTime;
  let tick = 0;
  let sceneState = 1;
  let okToQuit = false;
  // Parse Level
  wellDone = false;
  gameOver = false;
  initKeys();
  player = Sprite({
    x: level.player.x, // starting x,y position of the sprite
    y: level.player.y,
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

  stars = [];
  level.stars.forEach(star => {
    const s = Sprite({
      x: star.x * 16, // starting x,y position of the sprite
      y: star.y * 16,
      height: 16,
      sleepTimer: star.t * 5000,
      animations: spriteSheets[0].animations
    });
    stars.push(s);
    s.playAnimation("starLeft");
  });

  enemies = MakeEnemies(level.enemies, spriteSheets);

  const counter = subject => {
    const sleepLeft = Math.ceil(subject.sleepTimer / 1e3 - elapsedTime);
    if (sleepLeft < 1) {
      subject.sleepTimer = 0;
    }
    if (subject.sleepTimer > 0 && !subject.dead) {
      writeText(
        assets.font,
        "" + sleepLeft,
        -(subject.x + 8),
        subject.y - 9,
        1
      );
    }
  };

  const background = MakeBackground(lvl, level, assets);

  // Define gameLoop
  const gameLoop = GameLoop({
    update: function() {
      const state = {
        level,
        player,
        enemies,
        gameOver,
        tick,
        turnState:
          turnTimer < 300
            ? ETurnState.Walk
            : turnTimer === 310 || turnTimer === 330
            ? ETurnState.Turn
            : ETurnState.Watch
      };
      const wasGameOver = gameOver;

      turnTimer += turnTimer === 330 ? -turnTimer : 1;

      tick++;
      elapsedTime = tick / 60; // Elapsed time in ms
      flash = GetFlash(tick / 20);

      player.stabTimer--;
      player.dy += 0.2;

      player.dx = 0;
      let anim = wellDone ? "idle" : "duck";

      if (player.y > 400) {
        gameOver = true;
      }

      if (gameOver) {
        if (keyPressed("z") && okToQuit && sceneState === 1) {
          sceneState = 2;
          gameLoop.stop();
          levelSelectScene(wellDone ? lvl : -1, starCount + 1);
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
            zzfx(1, 0, 200, 0.4, 0, 2, 0, 0, 5); // ZzFX 6010
            player.dy = -4.5;
            jumpReleased = false;
          }
        }

        if (keyPressed("z") && player.stabTimer < -7 && player.standing) {
          // 7 tick > 100ms
          zzfx(1, 0.1, 800, 0.1, 0.66, 1.1, 3.1, 0.1, 0.85);
          player.stabTimer = 9; // 1 = 16ms, => 9 * 16ms
        }

        // Funkar utan denna verkar det som, varför?
        if (player.dy < 0 && player.blocked.top) {
          player.dy = 0;
        }

        if (!player.blocked.bottom) {
          anim = player.dy > 0 ? "jumpDown" : "jumpUp";
        }
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
          zzfx(1, 0, 100, 0.4, 0, 0.9, 7, 15, 0);
          stabbedEnemy.dead = true;
          stabbedEnemy.dx = player.facing * 1;
          stabbedEnemy.dy = -2;
          stabbedEnemy.playAnimation(
            "dead" + (player.facing === 1 ? "Left" : "Right")
          );
        }
      }
      player.playAnimation(
        anim + (player.facing === EFacing.Left ? "Left" : "Right")
      );

      player.update();

      GetBlocked(player, level.platforms);
      knife.x = player.x + player.facing * 16;
      knife.y = player.y;

      // Check stars
      stars.forEach((star, i) => {
        if (CheckCollidingBody(player, [star])) {
          zzfx(1, 0, 400, 0.5, 0.5, 0, 0, 5, 0);
          //
          // zzfx(1,0,600,.1,.49,2.5,.5,-2,.75); // ZzFX 67823
          starCount++;
          stars.splice(i, 1);
        }
      });

      // Run into enemy
      const collidingBody = CheckCollidingBody(player, enemies);
      if (collidingBody) {
        collidingBody.facing =
          collidingBody.x < player.x ? EFacing.Right : EFacing.Left;

        //loop.stop();
        //boot();
      }

      wellDone = true;

      enemies.forEach(enemy => {
        EnemyUpdate(enemy, state);
        enemy.update();
        if (!enemy.dead) {
          wellDone = false;
          GetBlocked(enemy, level.platforms);
          if (enemy.gotPlayer) {
            if (!gameOver) {
              if (player.standing) {
                player.y += 16;
                player.height = 16;
              }
              gameOver = true;
            }
          }
        }
      });
      if (wellDone) {
        gameOver = true;
      }
      if (gameOver && !wasGameOver) {
        setTimeout(() => {
          okToQuit = true;
        }, 1000);
      }
    },
    render: function() {
      context.drawImage(background, 0, 0);

      if (gameOver) {
        stars = [];
        if (wellDone) {
          writeText(
            assets.font,
            ["OK", "GOOD", "GREAT"][starCount] + " STABBING",
            -1,
            50,
            2
          ); // OK, GOOD eller GREATz
        } else {
          writeText(assets.font, "STAB OVER", 56, 50, 2);
        }
        if (flash && okToQuit) {
          writeText(assets.font, " PRESS Z", 56 + 36, 70, 1);
        }
      }
      if (knife.visible) {
        knife.render();
      }

      // render the game state
      player.render();

      stars.forEach((star, i) => {
        counter(star);
        star.render();
        if (star.sleepTimer == 0) {
          zzfx(1, 0, -250, 0.7, 0.7, 1.4, 0, 5, 1.49); // ZzFX 342
          stars.splice(i, 1);
        }
      });

      enemies.forEach(enemy => {
        //if (!enemy.dead || flash) {
        if (enemy.gotPlayer) {
          writeText(assets.font, "HEY!", -(enemy.x + 8), enemy.y - 9, 1);
        }

        counter(enemy);

        enemy.render();
        // }
      });
    }
  });

  gameLoop.start();
};
