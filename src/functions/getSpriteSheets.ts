import { SpriteSheet } from "../dependencies/kontra";
type IRGB = number[][];

const baseAnims = [
  ["jumpUp", 0, null, false],
  ["jumpDown", 1, null, false],
  ["walk", "0..3", 3, true],
  ["idle", 6, null, false],
  ["duck", 7, null, false],
  ["stab", 4, null, false],
  ["knife", 5, null, false],
  ["dead", 10, null, false],
  ["star", 8, null, false],
  ["barrelPlayer", "12..13", 3, true],
  ["barrel", 14, null, false],
  ["sleep", "15..16", 3, true]
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
    [104, 38, 104],
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
    const img = assets.gfx8colors;
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpContext.drawImage(img, 0, 0);
    var imageData = tmpContext.getImageData(0, 0, img.width, img.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      // if (
      //   imageData.data[i] !== 0 &&
      //   imageData.data[i] !== 227 &&
      //   imageData.data[i] !== 87 &&
      //   imageData.data[i] !== 57 &&
      //   imageData.data[i] !== 32 &&
      //   imageData.data[i] !== 252
      // ) {
      //   console.log(i, imageData.data[i]);
      //   debugger;
      // }
      if (
        imageData.data[i] == 7 // &&
        // imageData.data[i + 1] == 57 &&
        // imageData.data[i + 2] == 239
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
