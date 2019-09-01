interface IEnemy {
  walks: boolean;
  turns: boolean;
  facing: -1 | 1;
}
interface ILevel {
  platforms: any[];
  enemies: any[];
  stars?: { x: number; y: number; t: number }[];
  player?: { x: number; y: number };
}

import { Levels } from "./../common/levels";

export const getLevel = (levelIndex: number) => {
  const data = Levels.split(" ")[levelIndex];
  console.log("level", levelIndex);

  const [ground, lvl] = data.split("!");
  const level: ILevel = { platforms: [], enemies: [] };
  for (let i = ground.length - 1; i > 0; i -= 2) {
    let [y, w] = decode(ground.charCodeAt(i));
    let [h, x] = decode(ground.charCodeAt(i - 1));
    y = 15 - h - y;
    level.platforms.push({ x: x * 16, y: y * 16, w: w * 16, h: h * 16 });
  }
  for (let i = 3; i > 0; i -= 4) {
    let [x, y] = decode(lvl.charCodeAt(i - 3));
    let [x0, y0] = decode(lvl.charCodeAt(i - 2));
    let [x1, y1] = decode(lvl.charCodeAt(i - 1));
    let [t0, t1] = decode(lvl.charCodeAt(i));
    level.stars = [{ x: x0, y: y0, t: t0 }, { x: x1, y: y1, t: t1 }];
    level.player = { x: x * 16, y: y * 16 - 32 };
  }
  for (let i = lvl.length - 1; i > 3; i -= 2) {
    let [y, x] = decode(lvl.charCodeAt(i - 1));
    y++;
    let data = lvl.charCodeAt(i) - 35;
    data = Math.floor(data / 2);
    const enemy: any = {};
    ["facing", "turns", "walks"].forEach(key => {
      enemy[key] = !!(data % 2);
      data = Math.floor(data / 2);
    });
    const sleeper = data > 0 && !enemy.walks;
    level.enemies.push({
      x,
      y,
      ...enemy,
      //@ts-ignore Boolean is used as a number (0 = false, 1 = true) and Typescript rightly protests
      color: enemy.turns + sleeper * 2 + enemy.walks * 4,
      facing: enemy.facing ? -1 : 1,
      sleeper,
      data
    });
  }

  return level;
};

const decode = (c, base = 13) => {
  c -= 35;
  const d = c % base;
  return [d, (c - d) / base];
};
