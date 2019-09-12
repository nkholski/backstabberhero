// import { stopMusic } from "./../functions/music";
import { Ekeys } from "../functions/input";
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
import { Sprite, GameLoop } from "../dependencies/kontra.js";
import { zzfx } from "../dependencies/zzfx";

import writeText from "../functions/writeText";
import { EnemyUpdate } from "../functions/enemyUpdate";
import { levelSelectScene } from "./levelSelect";
import { keyPressed } from "../functions/input";

export const GameScene = (lvl: number) => {
  // stopMusic();
  //const { l: level, e: enemyData, h: heroCoordinates } = getLevel(lvl);
  const level = getLevel(lvl);
  console.log(level);
  const { spriteSheets, assets, context, font } = GetState();
  let turnTimer = 100;
  let starCount = 0;

  let player,
    knife,
    enemies,
    items = [],
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
  player = Sprite({
    x: level.player.x, // starting x,y position of the sprite
    y: level.player.y,
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...CDefaultBlocked },
    standing: true,
    facing: level.player.x > 120 ? EFacing.Left : EFacing.Right,
    stabTimer: -1,
    gameOver: -1,
    animations: spriteSheets[0].animations,
    barrel: null
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

  level.items.forEach(item => {
    const s = Sprite({
      x: item.x * 16,
      y: item.y * 16,
      height: 32,
      animations: spriteSheets[0].animations
    });
    items.push(s);
    s.playAnimation("barrelLeft");
  });

  const counter = subject => {
    const sleepLeft = Math.ceil(subject.sleepTimer / 1e3 - elapsedTime);
    if (sleepLeft < 1) {
      subject.sleepTimer = 0;
    }
    if (subject.sleepTimer > 0 && !subject.dead) {
      writeText(font, "" + sleepLeft, -(subject.x + 8), subject.y - 9, 1);
    }
  };

  const removeBarrel = dir => {
    let b = player.barrel;
    items.push(b);
    b.x = player.x;
    b.y = player.y;
    b.dx = player.facing * dir;
    b.dy = -2;
    player.barrel = null;
  };

  const background = MakeBackground(lvl, level);
  let turnState;

  // Define gameLoop
  const gameLoop = GameLoop({
    update: function() {
      turnState =
        turnTimer < 290
          ? ETurnState.Walk
          : turnTimer < 310
          ? ETurnState.AboutToTurn
          : turnTimer === 310 || turnTimer === 330
          ? ETurnState.Turn
          : ETurnState.Watch;
      const state = {
        level,
        player,
        enemies,
        gameOver,
        tick,
        turnState
      };
      const wasGameOver = gameOver;

      turnTimer += turnTimer === 330 ? -turnTimer : 1;

      tick++;
      elapsedTime = tick / 60; // Elapsed time in ms
      flash = GetFlash(tick / 20);

      player.stabTimer--;
      player.dy += 0.2;

      player.dx = 0;
      let anim: any = wellDone ? "idle" : "duck";

      if (player.y > 400) {
        gameOver = true;
      }

      // const keys = {};
      // ["left", "right", "up", "down", "z"].forEach(key => {
      //   keys[key] = keyPressed(key) || GetState().keys[key];
      // });

      if (gameOver) {
        if (keyPressed(Ekeys.Action) && okToQuit && sceneState === 1) {
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
        if (keyPressed(Ekeys.Left)) {
          player.dx = -1;
          player.facing = EFacing.Left;
          anim = "walk";
        }
        if (keyPressed(Ekeys.Right)) {
          player.dx = 1;
          player.facing = EFacing.Right;
          anim = "walk";
        }

        jumpReleased = jumpReleased || !keyPressed(Ekeys.Jump);

        if (player.blocked.bottom) {
          if (player.dy > 0) {
            player.dy = 0;
          }

          if (keyPressed(Ekeys.Duck) && !player.barrel) {
            anim = "duck";
            player.standing = false;
            player.y += 16;
            player.height = 16;
            player.dx = 0;
          } else if (keyPressed(Ekeys.Jump) && jumpReleased) {
            zzfx(1, 0, 200, 0.4, 0, 2, 0, 0, 5); // ZzFX 6010
            player.dy = -4.5;
            jumpReleased = false;
          }
        }

        if (
          keyPressed(Ekeys.Stab) &&
          player.stabTimer < -7 &&
          player.standing
        ) {
          // 7 tick > 100ms
          zzfx(1, 0.1, 800, 0.1, 0.66, 1.1, 3.1, 0.1, 0.85);
          player.stabTimer = 9; // 1 = 16ms, => 9 * 16ms
          if (player.barrel) {
            removeBarrel(1);
          }
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
          stabbedEnemy.dx = player.facing * 1.5;
          stabbedEnemy.dy = -2;
          stabbedEnemy.playAnimation(
            "dead" + (player.facing === 1 ? "Left" : "Right")
          );
        }
      }
      if (player.barrel) {
        anim = "barrel" + (anim === "walk" ? "Player" : "");
      }

      player.playAnimation(
        anim + (player.facing === EFacing.Left ? "Left" : "Right")
      );

      player.update();

      GetBlocked(player, level.platforms, 24);
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

      items.forEach((item, i) => {
        if (!item.dx && CheckCollidingBody(player, [item])) {
          player.barrel = item;
          items.splice(i, 1);
        }
        if (item.dx) {
          item.dy += 0.1;
          item.update();
        }
      });

      // Run into enemy
      const collidingBody = CheckCollidingBody(player, enemies);
      if (collidingBody && !player.barrel) {
        collidingBody.facing =
          collidingBody.x < player.x ? EFacing.Right : EFacing.Left;

        //loop.stop();
        //boot();
      }

      wellDone = true;

      items;

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
        if (player.barrel) {
          removeBarrel(-1);
        }

        setTimeout(() => {
          okToQuit = true;
        }, 1000);
      }
    },
    render: function() {
      context.drawImage(background, 0, 0);

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
          writeText(font, "HEY/", -(enemy.x + 8), enemy.y - 9, 1, 2, tick * 2);
        }

        counter(enemy);

        if (
          !(
            enemy.turns &&
            turnState === ETurnState.AboutToTurn &&
            GetFlash(tick)
          )
        ) {
          enemy.render();
        }
        // }
      });

      items.forEach(item => {
        item.render();
      });

      if (gameOver) {
        stars = [];
        if (wellDone) {
          writeText(
            font,
            ["OK", "GOOD", "GREAT"][starCount] + " STABBING",
            -1,
            50,
            2
          ); // OK, GOOD eller GREATz
        } else {
          writeText(font, "STAB OVER", 56, 50, 2);
        }
        if (flash && okToQuit) {
          writeText(font, " PRESS Z", 56 + 36, 70, 1);
        }
      }
    }
  });

  gameLoop.start();
};
