import { EEnemyType } from "./../common/enums";
import { CDefaultBlocked } from "../common/constants";
import { Sprite } from "../dependencies/kontra";

export const MakeEnemies = (enemiesData, spriteSheets) => {
  const enemies = [];

  enemiesData.forEach(enemyData => {
    enemies.push(
      Sprite({
        x: enemyData[0], // starting x,y position of the sprite
        y: enemyData[1],
        width: 16, // width and height of the sprite rectangle
        height: 32,
        blocked: { ...CDefaultBlocked },
        facing: enemyData[3] - 1, // -1 0 1 == left, none, right
        walks: enemyData[2] < 4, // Behövs, dx!==0 är ju walks?
        speed: enemyData[2] < 2 ? 0.5 : 0.2,
        animations: spriteSheets[enemyData[2] + 1].animations,
        turns: enemyData[2] % 2 > 0,
        sleeper: enemyData[2] > 5,
        sleepTimer: enemyData[2] > 5 ? (enemyData[2] - 5) * 1e4 : -1,
        type:
          enemyData[2] < 4
            ? EEnemyType.Walker
            : enemyData[2] > 5
            ? EEnemyType.Sleeper
            : EEnemyType.Stands
      })
    );
  });

  return enemies;
};
