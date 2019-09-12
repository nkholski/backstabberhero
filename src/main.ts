import { Coil } from "./scenes/coil";
import { init } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
import { Title } from "./scenes/title";
import { initKeys } from "./functions/input";

const resize = () => {
  document
    .getElementById("c")
    .style.setProperty("height", window.innerHeight + "px");
};

const rotateDevice = () => {
  let bodyClasses = GetState().body.classList;
  bodyClasses.add("mobile");
  bodyClasses.remove("por");

  if (screen.width < screen.height) {
    bodyClasses.add("por");
  }
  // setTimeout(rotateDevice, 500);
};

init();
const assets = {};
(() => {
  initKeys();

  //@ts-ignore
  let l = 1;
  window["zzfx_x"] = new AudioContext();

  // Base64
  const images: any = {};
  const pngText = "data:image/png;base64,";
  const imgSrc = [
    pngText +
      "iVBORw0KGgoAAAANSUhEUgAAATgAAAAHAQMAAACm6sPlAAAABlBMVEVHcEz///7ok5LVAAAAAXRSTlMAQObYZgAAAOJJREFUGBkFgKFqw0AYgA8CNxPK5C9C5HSZGBHHFfokBz9ETVSOcaTPUbk3+dWnQmSZKGVqMkyNiOMobihhqzUy9STIJZePCWCswUnXxsNu6s8xunfG2Swhfk7rL8AswDruji68dOr7tFdVB4aZIf471X8AE7jmsbu4oO1T+zYlr+ooRilLFf+XagWWLKx1CMOXE237fmymNh5cxTADYUvXO+W+eSHXLKeLE21Dc25UtHEwzmYjwi2xYPMNYVhX+Tnu3Wt7Uq8q6h0lbNUiU14myPa5ZMnPIDXspTuco49RYngAcXeJFg24RkQAAAAASUVORK5CYII=",
    pngText +
      "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"
  ];
  ["font", "gfx"].forEach((name, i) => {
    images[name] = new Image();
    images[name].src = imgSrc[i];
  });

  images.gfx.onload = () => {
    let customColors = [0x99, 0xcc, 0xff];
    let spriteSheets = GetSpriteSheets(images.gfx, customColors);
    const state: any = {
      ...images,
      spriteSheets,
      touches: {},
      keys: {},
      customColors
    };
    SetState(state);
    if (GetState().mobile) {
      window.onorientationchange = rotateDevice;
      window.onresize = resize;
      rotateDevice();
    }
    Title();
  };
  //@ts-ignore

  // ["gfx"].forEach(file => {
  //   assets[file] = new Image();
  //   assets[file].src = `assets/${file}.png`;
  //   assets[file].onload = () => {
  //     if (!--l) {
  //       let spriteSheets = GetSpriteSheets(assets);
  //       const state: any = { assets, spriteSheets, touches: {}, keys: {} };
  //       SetState(state);
  //       if (GetState().mobile) {
  //         window.onorientationchange = rotateDevice;
  //         rotateDevice();
  //       }
  //       //       Title();
  //       GameScene(3);
  //     }
  //   };
  // });
})();
