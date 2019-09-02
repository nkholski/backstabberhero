import { CDefaultBlocked } from "../common/constants";
import { Sprite } from "../dependencies/kontra";

export const MakeEnemies = (enemiesData, spriteSheets) => {
  const enemies = [];

  enemiesData.forEach(enemy => {
    enemies.push(
      Sprite({
        ...enemy,
        width: 16, // width and height of the sprite rectangle
        height: 32,
        blocked: { ...CDefaultBlocked },
        speed: enemy.data,
        animations: spriteSheets[enemy.color].animations,
        sleepTimer: enemy.data * 1e4
      })
    );
  });

  return enemies;
};
