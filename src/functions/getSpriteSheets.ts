import { SpriteSheet } from "../dependencies/kontra";
type IRGB = number[][];

const hex2rgb = hexColor => {
  const rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = 0xb * parseInt(hexColor.substr(i, 1), 16);
  }
  return rgb;
};

const skin = [
  "fec",
  "fea",
  "ec9",
  "fc8",
  "b63",
  "a86",
  "731",
  "210"
  // "fee3c6",
  // "fde7ad",
  // "ecc091",
  // "f2c280",
  // "bb6536",
  // "ad8a60",
  // "733f17",
  // "291709"
];

// export enum AnimationNames {
//   JumpUp,
//   JumpDown,
//   Walk,
//   Idle,
//   Duck,
//   Stab,
//   Knife,
//   enemyDead,
//   enemyIdle,
//   enemyWalk,
//   Star,
//   Barrel = 99,
//   BarrelPlayer,
//   Sleep
// }

const baseAnims = [
  ["jU", 2],
  ["jD", 0],
  ["walk", [1, 0, 2, 0], 4],
  ["idle", 0],
  ["duck", 5],
  ["stab", 3],
  ["knife", 4],
  ["dead", 11],
  ["eIdle", 12],
  ["eWalk", [12, 13], 3],
  ["star", 6],
  ["brlPlayer", [14, 15], 3],
  ["brl", 7],
  ["sleep", [9, 10], 3]
];

const createAltGfx = (gfx, custom) => {
  let spriteSheets = [];
  let animations = {};
  baseAnims.forEach(anim => {
    animations[anim[0] + "R"] = {
      frames: anim[1],
      frameRate: anim[2],
      loop: anim[3]
    };
    animations[anim[0] + "L"] = {
      ...animations[anim[0] + "R"],
      flipped: true
    };
  });

  let skinfix = false;

  ["9CF", "F9F", "0C0", "60C", "396", "630", "0CF"].forEach((hexColor, t) => {
    let rgb;
    if (t > 0) {
      rgb = hex2rgb(hexColor);
    } else {
      rgb = custom;
    }
    const tmpCanvas = document.createElement("canvas");
    const tmpContext = tmpCanvas.getContext("2d");
    const img = gfx;
    tmpCanvas.width = 260; // 224 px plus 32 px for brl animations
    tmpCanvas.height = 64;
    tmpContext.drawImage(img, 0, 0);
    tmpContext.drawImage(img, 0, 26, 16, 6, 224, 26, 16, 6); // First feet
    tmpContext.drawImage(img, 112, 5, 16, 27, 224, 0, 16, 27); // First brl
    tmpContext.drawImage(img, 32, 26, 16, 6, 240, 26, 16, 6); // Second feet
    tmpContext.drawImage(img, 112, 5, 16, 27, 240, 1, 16, 27); // Second brl

    let imageData = tmpContext.getImageData(0, 0, 260, 64);

    const color = hex2rgb(skin[Math.round(Math.random() * 7)]);

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData[i] != 0 && !skinfix) {
        skinfix = true;
      }

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

const GetSpriteSheets = (gfx, custom) => {
  return createAltGfx(gfx, custom);
};
export default GetSpriteSheets;
