import { Title } from "./scenes/title";
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
      "iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgBAMAAAD562lmAAAAGFBMVEVHcEyUlAOGAQAAAAA0NTR2CFQAAQD////Xg+MKAAAAAXRSTlMAQObYZgAABNdJREFUSMd1l01v4zgMhtUKm15XUNPz1On6LJlxeu40PyBdQ5hr4wG618EGmPz94adsJ60KVHYU8+FLkZTj3G2Dw30+5mtffA903J1/8f3dr2nNJ5kA5k80HRr6hrNMC8O2dnn9CdDduUsgACThQZo9sRHS7UZBc8Ob5vrapwXwVYebg0wYk8QfWUhmqGluOwVeQVSvXfvTArjVYSGtHOeLgACgJAuGxSQ5ASJpDgGo4fA9lOcTXvtz+jSkpmy6PQ30sIe+P6eZJ/0Az+ckt7CE2JoAN5sBysG5Z5H4wcOF8BLuQ7ifRbCUAUjgufT4AcBQTiDAfiCj4jkF4HxaQmyNgbGDrvvnYBJXLY7Hx/cKVGVstmcggQnY4xV7MvxggHjuh344wxKyqqqcyyFudPNRIkhWY+T3OkyZhzL0RQ3R9z0tFAntDwpx7Dry3P/b9ehLdYAsH3VNgQAjA/0ZNs61zXFsRycCX4JnIQzk2THaFFbw4Dx6jsNlwP9NqQ7w/uuaAEOIObL05/9xGhE4tjPgIKGsCl2vChEo2dQT0GUkjCMaJFCqDlBaoCpeEyAio+R31yRRuACqMtrCQfKVJ49EzRnkESBABwJq22/VAeQxom13TtUif+D83nSbqnDaw9IPHDpfCmc5PiH1GGIyhXIb+vK3YzXde3XArXABRzcCE32gJIzSIj1KbD9G3sNaFqQszQof3c29zAz0OYjSENbl7UAGNzA54I4kkHYO17HgpE6z1guQwqZ5bGbAKMoyORrJEAEPpDRHzYIJOPS4nnNI1QH3xhFl4vq/82+pszD1/cvCzxEALaMdikxiMMXSRwPmGLmg0UqJhRxal1Ad+KsAseIOzax3H+8cKnZdRysKbQ8NhPbpL3FEyT8CsjIFYwiRGCjCBDpUBwbP4USEp0jtG00OOxVwA9uHZsrSGKEAAgNAyTSjfQ6tgRSMoSCzaDXj3r315oBLnjfDgrgHAdbzDnkLIOkJDNIZqbxHM2CcA6mTlFDsXnY/5qBpEvYvT8hrKnC8BBKHQ8mRR/sU3wMpkZAGbRs5S9wyu+hmwMhIO4b2r1sEwqXCWocZM4BD2BdKlsw3mKV+ShatxyAFaiB1gOuGfFCFZPT7/SyktIft4ngqkVtZLDFHKwJSuH6TY0+3xwrVQOwAqCvaLAgYnlhjfd9p5bSYgBRTqT/gTNOivYn9gGXtB8hAZTkdnAxKU6dw01mO4xG2LPLW3qOaSyClmGQlzT5YgwlrvqA6Xbxq+OkEVSBd7XY720MerxWohV/3UJLA2Ux1mTxI8mmni/W1cfEyMgPuCGl72HCe1sK31qZZys06aNMOHLEYswBl60LNBwUiOOkRDfW9En5WoOTpZaeZgD7HyKeDzllTrgJjXgJx9nKuyP2KhK5+vk9ZyqH7UqFZtjlLTrhsewnhSqECZQGB2EEnYEDcy9NXvZSfU8drDIPnepN6jy5HN3shjgAQgQ+0HOTjD/zaBKS0ed1eKbQs5eNAW4lVOJuzng3OR0saWg8AiUlIDlQ44cHVeDj3tOf2/X36TTJeAL1Wts2qRIHkhBdjN6CdjHIZSdrNBLWy3rZVicZbjTSO03tpfYOGWZq7+tOC01Hy9AZjzYrw32KTGXV8+CJprupQQX4C6o8nzX2R/AcFQo4ITZ3JIwAAAABJRU5ErkJggg=="
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
