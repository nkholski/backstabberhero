import { Title } from './scenes/title';
import { init } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
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
      "iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAMAAAA8G4RnAAAAGFBMVEVHcEyUlAOGAQAAAAB2CFQ0NTQAAQD///9c2OnGAAAAAXRSTlMAQObYZgAABJhJREFUWMOlmQuW2yAMRYGHyf53PAYJ0A8nPsO06UCM0dUPQVNKqcyW3rXTvFfvg2npczf5gO7Jie41RzmhJHLyHQS2876N/wh4I6WvgPth9ZIDIBSBk+8IgvLb+FG1vV3QP5ZvE4RaibrWpEKgLpOT7wcQ9ZUbx+eB0PBdzkUj+VGrHKDfa0UKTar9w8t3AkGkuD5cx2Kfz1r/80AYuKixWPTtB4Jw0KGKVfQEVseHHwgXi3zczBOABWUIUGsNCJtoKeW7XesjX7ED1t7WQL1h7i4PMF/9bAG1SY3GndwHkOQsxcMZKOh/S2FARdjK/LnK1QJAY7ElLCowBZrA64E5lAKTGo17D4tBmrcU8d1tECo3G4txDCiHv0xzFqMefyiJVIwJQGNS0nhZGndyxyAtm3kKsLdWhEaGfgoBtlLa1T9a6S56KSMmaY8NuPtJQBsLeuBODNI4/XhePzDX0PMUIEH2v5KQH7vRBmBHjAGrcklvQfJSH6Qqx2yTgm3Rl3S8wQAlCrbUmicBGVIn7huLetOCD4DKYjMCq8qsogd2Sjg+dlHyqTKTKgMtueFAWtsQfRgtGcvSS6XKC8CE2oJRDPYMOf5gAsgkutYQb8/aWyDjiVXeB/LmHQZrKVDACL+8PbG0AghEcAgCyFCVIxOWvj+UHYPBNjEtdtjoaXFkVNV3Wl7Tx/ddSbkuARePUYDkW5RjPu9sMstnBPVxmyn0KgfArCyGvRRkmI/HFg8EIT8cAAJ1vg/zfVYBqYoogwTsRVaTCld+8/NGv1yABFC6hAReBNkBjoH9NYlSa+4qmTJ3nhwoYPyTd65sLEwFSbwIrd+sWrVJC7oYtECs67wY9gPLxMSDFAJzwJI5pv9OoBoooCIp38zw5b4671gLjuijrTDKokNWkBqxDHr3JzCzCpfVFvTAO5hYVMrxg8gpIEHuBQc3fDrPEd4DYBaJeEec6BPbDqIYMJ8AZyXSXbRW972OgtgLHwEpgz4B7uDGEkh0NyqlUUpn1mLQISmdTUgfKGDuBAsypf9YMNgHOf63C4L6e9uepuNaUicVDipZFeQsN04LZBQgp9C01xacMXg+LvXoEAJRX3jsXHRaMI8H9rZpTGjOXwZIKMAqRdcTx5upQxYtx31Qe7/u+x2WMiDyPmqA89TphmMD4XDlEZ3Cj4SnS7cz4CpVlMaRrY/ulFB1TjFXGLYSCo+cwZ0OgAZVif4CqDd6H4MyC4jCSwfhKP0AdUTT55nolup0C3IAbBPy3XWqLdVMFhVEurjeOYesiQzEtXb2uSH0wGTvpbxGBuVLQF3JRIBcXOqQ1/uASnABoK2DI4DkvFZcV8xua2/5frCgE9n0oXNEgotJIOevFtSAakJbnon3gF9q0b2eOf9YJxyH402k+OZneLWf11lH3Rwu7XIA8mHx/xZ0WXRVW1Jo04eIMl+YccVzMODc8jZShiLsv7UUOceP/2fTvgHardpt3cok9uywbib241x5yX2EpWdku+1AXK69JGz7YrSF96L+qhmHjSq8xpYFmTCaraXVO/BM+Hab+L4PHnYpkybijKjB0x/gLyth3ZF8gQAAAABJRU5ErkJggg=="
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
