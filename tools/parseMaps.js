// Valid format indata:
// * Ground: y<3 not allowed
// * Star/Player: y==0 || y==14 not allowed
// * Star: Allowed time: 0-9 (Mapped to (n+1 * 5 sec))
// * Enemy: enemy 2 | facing 2 | turns 2 | walks 2| sleepTimer/notenemyType 9
const fs = require("fs");

console.log("---------START--------------");

let tryNextFile = true;
let levelNumber = 1;
let parsedString = "";

while (tryNextFile) {
  try {
    data = fs.readFileSync("../rawAssets/maps/map" + levelNumber + ".json");
    console.log("Parsing level " + levelNumber);
    parsedString += parseFile(data) + " ";
    levelNumber++;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        "Finished " +
          (levelNumber - 1) +
          " levels" +
          " (map" +
          levelNumber +
          ".json not found)."
      );
      tryNextFile = false;
    } else {
      throw error;
    }
  }
}

parsedString = parsedString.replace(/\s$/, "");

fs.writeFileSync(
  "../src/common/levels.ts",
  `export const Levels = "${parsedString}";`
);

function parseFile(data) {
  const json = JSON.parse(data);
  const tilesetData = json.tilesets[0].tiles;

  const groundObjects = json.layers[0].objects;
  const levelData = {
    ground: "",
    enemies: "",
    starsAndStart: "" // ABCD => A=player pos, B = Star1 pos, C=star2 pos, D = star1&star2 timeout E=Enemy1...?
  };

  const stars = [];
  let player;

  groundObjects.forEach(groundObject => {
    let { height, width, x, y, gid, properties } = groundObject;

    height /= 16; // 1-13
    width /= 16; // 1-16 3bit // * 16
    x /= 16; // 0-15 4 bit // * 15
    y /= 16;

    switch (gid) {
      case 1: // Player
        player = {
          x,
          y
        };

        break;
      case 5: // STAR
        const time = !properties || !properties[0] ? 2 : properties[0].value;
        stars.push({
          x,
          y,
          time: time - 1
        });
        break;

      case 6: // Barrel
        const barrelOrd = 0 + 2; // 1 == not enemy, 2 = Barrel
        levelData.enemies +=
          charFromNumber(y - 2 + x * 13) + charFromNumber(barrelOrd);
        break;

      case undefined:
        /* Ground: 
        1. Not allowed to start first two rows (REVERSE: y bottom of square)
        2. Max height: 13 tiles
        */

        if (y < 0 || y + height > 15 || x < 0 || x + width > 16) {
          throw "Ground outside screen: xy=" +
            x +
            "," +
            y +
            " wh = " +
            width +
            "," +
            height;
        }

        // No image, En 13*16 + 35 = 243
        y = 15 - y - height; // (3+) 0-13 // * 13 renderas underifrån

        let ord = height + x * 13;
        levelData.ground += charFromNumber(ord);

        ord = y + width * 13;

        levelData.ground += charFromNumber(ord);

        break;

      default:
        tileProperties = tilesetData.find(set => set.id === gid - 1).properties;
        // const sleep = tileData.find(x => x.)
        const thisProperties = { enemy: true };
        ["facingLeft", "turns", "walks", "sleeps"].forEach(propertyName => {
          const defaultValue = {
            facingLeft: false,
            turns: false,
            speed: 0,
            sleeps: 0
          }[propertyName];

          let fromTileProperty = null;

          if (tileProperties.find(x => x.name === propertyName)) {
            let tmpVal = tileProperties.find(x => x.name === propertyName)
              .value;
            if (typeof tmpVal === "boolean") {
              tmpVal = tmpVal ? 1 : 0;
            }
            fromTileProperty = tmpVal;
          }

          let fromObjectProperty = null;

          if (
            groundObject.hasOwnProperty("properties") &&
            groundObject.properties.find(x => x.name === propertyName)
          ) {
            let tmpVal = groundObject.properties.find(
              x => x.name === propertyName
            ).value;

            if (typeof tmpVal === "boolean") {
              tmpVal = tmpVal ? 1 : 0;
            }
            fromObjectProperty = tmpVal;
          }

          thisProperties[propertyName] =
            fromObjectProperty != null
              ? fromObjectProperty
              : fromTileProperty != null
              ? fromTileProperty
              : defaultValue;
        });

        thisProperties.data = 0;

        if (thisProperties.walks > 0) {
          thisProperties.data = thisProperties.walks;
          thisProperties.walks = 1;
        }
        if (thisProperties.sleeps > 0) {
          thisProperties.data = thisProperties.sleeps;
          thisProperties.sleeps = 1;
        }

        const enemyOrd =
          thisProperties.enemy +
          thisProperties.facingLeft * 2 +
          thisProperties.turns * Math.pow(2, 2) +
          thisProperties.walks * Math.pow(2, 3) +
          thisProperties.sleeps * Math.pow(2, 4) +
          thisProperties.data * Math.pow(2, 5);

        levelData.enemies +=
          charFromNumber(y - 2 + x * 13) + charFromNumber(enemyOrd);
        break;
    }
  });

  if (stars.length !== 2) {
    throw "Need two stars (got " + stars.length + ")";
  }
  if (!player) {
    throw "No player";
  }

  levelData.starsAndStart = makeStarString(stars, player);
  const dataString =
    levelData.ground + "!" + levelData.starsAndStart + levelData.enemies;

  return dataString;
}

function decodeData(data) {
  const [ground, lvl] = data.split("!");
  const level = { platforms: [], enemies: [] };
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
    level.player = { x, y };
  }
  for (let i = lvl.length - 1; i > 3; i -= 2) {
    let [y, x] = decode(lvl.charCodeAt(i - 1));
    y++;
    let data = lvl.charCodeAt(i) - 35;
    data = Math.floor(data / 2);
    const enemy = {};
    ["facing", "turns", "walks"].forEach(key => {
      enemy[key] = !!(data % 2);
      data = Math.floor(data / 2);
    });
    const sleeper = data > 0 && !enemy.walks;
    level.enemies.push({
      x,
      y,
      ...enemy,
      color: enemy.turns + sleeper * 2 + enemy.walks * 4,
      facing: enemy.facing ? -1 : 1,
      sleeper,
      data
    });
  }

  return level;
}
function decode(c, base = 13) {
  c -= 35;
  const d = c % base;
  return [d, (c - d) / base];
}

function makeStarString(stars, player) {
  let encoded = charFromNumber(player.y - 1 + 13 * player.x);
  encoded += charFromNumber(stars[0].y - 1 + 13 * stars[0].x);
  encoded += charFromNumber(stars[1].y - 1 + 13 * stars[1].x);
  encoded += charFromNumber(stars[0].time + 13 * stars[1].time);
  return encoded;
}

function charFromNumber(num) {
  num += 35;
  if (num > 254 || num === 127) {
    throw "Bad generated character: " + num;
  }
  return String.fromCharCode(num);
}
