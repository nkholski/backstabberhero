import { SpriteSheet } from "../dependencies/kontra";
type IRGB = number[][];

const hex2rgb = hexColor => {
  const rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = parseInt(hexColor.substr(i * 2, 2), 16);
  }
  return rgb;
};

const skin = [
  "fee3c6",
  "fde7ad",
  "ecc091",
  "f2c280",
  "bb6536",
  "ad8a60",
  "733f17",
  "291709"
];

const baseAnims = [
  ["jumpUp", 2, null, false],
  ["jumpDown", 0, null, false],
  ["walk", [1, 0, 2, 0], 4, true],
  ["idle", 0, null, false],
  ["duck", 5, null, false],
  ["stab", 3, null, false],
  ["knife", 4, null, false],
  ["dead", 11, null, false],
  ["enemyIdle", 12, null, false],

  ["enemyWalk", "12..13", 3, true],

  ["star", 6, null, false],
  ["barrelPlayer", "14..15", 3, true],
  ["barrel", 7, null, false],
  ["sleep", "9..10", 3, true]
];

const createAltGfx = assets => {
  let spriteSheets = [];
  let animations = {};
  baseAnims.forEach(anim => {
    animations[anim[0] + "Right"] = {
      frames: anim[1],
      frameRate: anim[2],
      loop: anim[3]
    };
    animations[anim[0] + "Left"] = {
      ...animations[anim[0] + "Right"],
      flipped: true
    };
  });

  [
    [94, 94, 3],
    [173, 87, 38],
    [12, 38, 255],
    [
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random())
    ],
    [
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random())
    ],
    [
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random())
    ],
    [
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random())
    ],
    [
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random()),
      Math.floor(255 * Math.random())
    ]
  ].forEach((rgb, t) => {
    const tmpCanvas = document.createElement("canvas");
    const tmpContext = tmpCanvas.getContext("2d");
    const img = assets.gfx;
    tmpCanvas.width = 260; // 224 px plus 32 px for barrel animations
    tmpCanvas.height = 64;
    tmpContext.drawImage(img, 0, 0);
    tmpContext.drawImage(img, 0, 26, 16, 6, 224, 26, 16, 6); // First feet
    tmpContext.drawImage(img, 112, 5, 16, 27, 224, 0, 16, 27); // First barrel
    tmpContext.drawImage(img, 32, 26, 16, 6, 240, 26, 16, 6); // Second feet
    tmpContext.drawImage(img, 112, 5, 16, 27, 240, 1, 16, 27); // Second barrel

    var imageData = tmpContext.getImageData(0, 0, img.width, img.height);
    const r = Math.round(Math.random() * 7);
    const color = hex2rgb(skin[r]);

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 118) {
        imageData.data[i] = color[0];
        imageData.data[i + 1] = color[1];
        imageData.data[i + 2] = color[2];
      }
      if (
        imageData.data[i] == 148 // &&
      ) {
        imageData.data[i] = rgb[0];
        imageData.data[i + 1] = rgb[1];
        imageData.data[i + 2] = rgb[2];
      }
    }
    tmpContext.putImageData(imageData, 0, 0);
    spriteSheets[t] = SpriteSheet({
      image: tmpCanvas,
      frameWidth: 16,
      frameHeight: 32,
      animations
    });
  });

  return spriteSheets;
};

const GetSpriteSheets = assets => {
  return createAltGfx(assets);
};
export default GetSpriteSheets;
