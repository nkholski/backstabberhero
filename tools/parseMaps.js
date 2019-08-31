// Valid format indata:
// * Ground: y<3 not allowed
// * Star/Player: y==0 || y==14 not allowed
// * Star: Allowed time: 0-9 (Mapped to (n+1 * 5 sec))
// * Enemy: enemy 2 | facing 2 | turns 2 | walks 2| sleepTimer/notenemyType 9
const fs = require("fs");

console.log("---------START--------------");

try {
  fs.readFile("../assets/maps.json", "utf8", (err, data) => {
    if (err) throw "WTF!";
    parseFile(data);
  });
} catch {
  throw "Oh no!";
}

parseFile = data => {
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
      case 9: // STAR
        if (!properties[0]) {
          throw "Missin star time";
        }

        stars.push({
          x,
          y,
          time: properties[0].value - 1
        });
        break;

      case undefined:
        /* Ground: 
        1. Not allowed to start first two rows (REVERSE: y bottom of square)
        2. Max height: 13 tiles
        */

        // No image, En 13*16 + 35 = 243
        y = 15 - y - height; // (3+) 0-13 // * 13 renderas underifrån

        let ord = height + x * 13;

        levelData.ground += charFromNumber(ord);

        //

        ord = y + width * 13;

        levelData.ground += charFromNumber(ord);

        break;

      default:
        tileProperties = tilesetData.find(set => set.id === gid - 1).properties;
        // const sleep = tileData.find(x => x.)
        let thisEnemyString = "";
        const thisProperties = { enemy: true };
        ["facingLeft", "turns", "walks", "sleep"].forEach(propertyName => {
          const defaultValue = {
            facingLeft: false,
            turns: false,
            speed: 0,
            sleep: 0
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

          if (groundObject.properties.find(x => x.name === propertyName)) {
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

        const enemyOrd =
          thisProperties.enemy +
          thisProperties.facingLeft * 2 +
          thisProperties.turns * 2 * 2 +
          thisProperties.walks * 2 * 2 * 2 +
          thisProperties.sleep * 2 * 2 * 2 * 2;
        levelData.enemies +=
          charFromNumber(y - 2 + x * 13) + charFromNumber(enemyOrd);

        break;
    }
  });

  if (stars.length !== 2) {
    throw "Need two stars";
  }
  if (!player) {
    throw "No player";
  }

  levelData.starsAndStart = makeStarString(stars, player);
  const dataString =
    levelData.ground + "!" + levelData.starsAndStart + levelData.enemies;
  console.log("Data: '" + dataString + "'");
  console.log(decodeData(dataString));
};

decodeData = data => {
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
    // const isEnemy = !!(data % 2);
    data = Math.floor(data / 2);
    const facingLeft = !!(data % 2);
    data = Math.floor(data / 2);
    const turns = !!(data % 2);
    data = Math.floor(data / 2);
    const walks = !!(data % 2);
    data = Math.floor(data / 2);
    const sleeper = data > 0 && !walks;
    level.enemies.push({
      x,
      y,
      color: turns + sleeper * 2 + walks * 4,
      facing: facingLeft ? -1 : 1,
      turns,
      walks,
      sleeper,
      data
    });
  }

  return level;
};

decode = (c, base = 13) => {
  c -= 35;
  const d = c % base;

  return [d, (c - d) / base];
};

makeStarString = (stars, player) => {
  let encoded = charFromNumber(player.y - 1 + 13 * player.x);
  encoded += charFromNumber(stars[0].y - 1 + 13 * stars[0].x);
  encoded += charFromNumber(stars[1].y - 1 + 13 * stars[0].y);
  encoded += charFromNumber(stars[0].time + 13 * stars[1].time);
  return encoded;
};

charFromNumber = num => {
  num += 35;
  if (num > 254 || num === 127) {
    throw "Bad character: " + num;
  }
  return String.fromCharCode(num);
};
