import { EnemyVision } from "./physics/enemyVision";
import { CheckCliff } from "./physics/checkCliff";
import { GetFlash } from "./getFlash";
import { ETurnState } from "../common/enums";
import { zzfx } from "../dependencies/zzfx";

export const EnemyUpdate = (
  enemy,
  { turnState, player, level, gameOver, tick }
) => {
  const cliff = !CheckCliff(enemy, level.platforms).bottom;
  let anim: any = "Idle";
  enemy.dy += 0.2;
  if (enemy.dead || enemy.gotPlayer) {
    return;
  }
  if (enemy.sleepTimer > 0) {
    enemy.playAnimation("sleepRight");
    return;
  }

  turnState = enemy.turns ? turnState : ETurnState.Walk;

  enemy.dx = 0;

  if (EnemyVision(enemy, player, level.platforms)) {
    enemy.gotPlayer = true;
    player.facing = -enemy.facing;

    zzfx(1, 0, 100, 0.7, 0.42, 1.5, 0.6, 0.7, 0.2);
    enemy.gotPlayer = true;
  } else if (!enemy.gotPlayer) {
    if (turnState === ETurnState.Turn) {
      enemy.facing = -enemy.facing;
    }

    if (enemy.walks && turnState === ETurnState.Walk) {
      enemy.dx = enemy.facing * enemy.speed;
      if (
        (enemy.blocked.left && enemy.dx < 0) ||
        (enemy.blocked.right && enemy.dx > 0) ||
        (enemy.blocked.bottom && cliff)
      ) {
        enemy.facing = -enemy.facing;
      }
    }

    // Means it was sleeping
    if (enemy.sleeper && enemy.sleepTimer === 0) {
      enemy.facing = GetFlash(tick / 20) ? 1 : -1;
    }

    anim = enemy.walks && turnState === ETurnState.Walk ? "Walk" : "Idle";
  }
  enemy.playAnimation("enemy" + anim + (enemy.facing == -1 ? "Left" : "Right"));

  return gameOver;
};
