import { CDefaultBlocked } from "../common/constants";
import { Sprite } from "../dependencies/kontra";

export const MakeEnemies = (enemiesData, spriteSheets) => {
  const enemies = [];

  enemiesData.forEach(enemy => {
    enemies.push(
      Sprite({
        ...enemy,
        // width: 16, // width and height of the sprite rectangle
        height: 32,
        blocked: { ...CDefaultBlocked },
        speed: enemy.walks ? (1 + enemy.data) / 4 : 0,
        animations: spriteSheets[enemy.color].animations,
        sleepTimer: enemy.sleeper ? (enemy.walks ? 0 : enemy.data * 1e4) : 0
      })
    );
  });
  return enemies;
};
