import { CheckCollidingBody } from "./checkCollidingBody";
import { GetBlocked } from "./getBlocked";
export const EnemyVision = (enemy, player, platforms) => {
  // 1. Linje i se-riktning tills stöter i ett objekt, hoppa 8px åt gången

  if (player.brl && player.dx === 0 && player.dy === 0) {
    return false;
  }

  let seen = false;
  [1, 16].forEach(y => {
    let sight = 0;
    let cx;

    while ((sight += 8)) {
      const checkX = enemy.x + 8 + sight * enemy.facing;
      cx = checkX;
      if (
        GetBlocked(
          {
            x: checkX,
            y: enemy.y + y,
            height: 14
          },
          platforms
        ).any ||
        checkX < 0 ||
        checkX > 232
      ) {
        break;
      }
    }

    seen =
      seen ||
      !!CheckCollidingBody(player, [
        {
          x: enemy.x + 8 + (enemy.facing === -1 ? -sight : 0),
          y: enemy.y + y,
          height: 14, // Discover ducked player, but be fair if jumping and head sticks up a bit
          width: sight
        }
      ]);
  });
  // 2. Boxkollision mellan player och synbody med höjd 12 eller något
  return seen;
};
