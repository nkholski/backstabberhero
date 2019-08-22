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
  ["dead", 10, null, false]
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

  [[7, 57, 239], [104, 38, 104], [173, 87, 38]].forEach((rgb, t) => {
    const tmpCanvas = document.createElement("canvas");
    const tmpContext = tmpCanvas.getContext("2d");
    const img = assets.gfx;
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpContext.drawImage(img, 0, 0);
    var imageData = tmpContext.getImageData(0, 0, img.width, img.height);

    for (var i = 0; i < imageData.data.length; i += 4) {
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
  console.log("alt", createAltGfx(assets));
  console.log("boots", assets);
};
export default GetSpriteSheets;
