import { EnemyVision } from "./physics/enemyVision";
import { CheckCliff } from "./physics/checkCliff";

export const EnemyUpdate = (enemy, { player, level, gameOver }) => {
  const cliff = !CheckCliff(enemy, level).bottom;
  let anim = "idle";
  enemy.dy += 0.2;
  if (enemy.dead) {
    return;
  }

  enemy.dx = 0;

  if (EnemyVision(enemy, player, level)) {
    enemy.gotPlayer = true;
    player.facing = -enemy.facing;

    enemy.gotPlayer = true;
  } else if (!enemy.gotPlayer) {
    if (enemy.walks) {
      enemy.dx = enemy.facing * enemy.speed;
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
  return gameOver;
};
