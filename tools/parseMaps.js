const fs = require("fs");

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
  const groundObjects = json.layers[1].objects;
  const levelData = {
    ground: "",
    enemies: [],
    starsAndStart: "" // ABCD => A=player pos, B = Star1 pos, C=star2 pos, D = star1&star2 timeout E=Enemy1...?
  };

  const stars = [];
  let player;

  groundObjects.forEach(groundObject => {
    let { height, width, x, y, gid, properties } = groundObject;

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

      default:
        /* Ground: 
        1. Not allowed to start first two rows (REVERSE: y bottom of square)
        2. Max height: 13 tiles
        */

        // No image, En 13*16 + 35 = 243
        height /= 16; // 1-13
        width /= 16; // 1-16 3bit // * 16
        x /= 16; // 0-15 4 bit // * 15
        y = (240 - y) / 16; // (3+) 0-13 // * 13 renderas underifrån

        let ord = height + x * 13;

        levelData.ground += charFromNumber(ord);

        //
        char = charFromNumber(ord);
        decoded = decode13x16(char.charCodeAt(0));
        console.log(ord, height, x, decoded);
        throw "stop";

        ord = y + height * 13;

        levelData.ground += charFromNumber(ord);

        break;
    }
  });

  if (stars.length !== 2) {
    throw "Need two stars";
  }
  if (!player) {
    throw "No player";
  }

  // levelData.starsAndStart = makeStarString(stars, player);

  console.log(levelData.ground.length);
  console.log(levelData.ground);

  decodeData(levelData.ground);
};

decodeData = data => {
  const [ground, lvl] = data.split("!");

  for (i = ground.length - 1; i > 0; i -= 2) {
    const [x, w] = decode13x16(ground.charCodeAt(i));
    let [y, h] = decode13x16(ground.charCodeAt(i - 1));
    y = 240 / 16 - y;
    console.log(i + ".", x, h, y, w);
  }
};

decode13x16 = c => {
  c -= 35;
  console.log("C", c);
  const d = c % 13;
  return [d, (c - d) / 13];
};

makeStarString = (stars, player) => {
  let encoded = charFromNumber(player.x + 16 * player.y);
  encoded += charFromNumber(stars[0].x + 16 * stars[0].y);
  encoded += charFromNumber(stars[1].x + 16 * stars[1].y);
  encoded += charFromNumber(stars[0].time + 16 * stars[1].time);
  return encoded;
};

charFromNumber = num => {
  num += 35;
  if (num > 254 || num === 127) {
    throw "Bad character: " + num;
  }
  console.log("OK");
  return String.fromCharCode(num);
};
