import { GameScene } from "./scenes/game";
import { init } from "./dependencies/kontra";
import GetSpriteSheets from "./functions/getSpriteSheets";
import { SetState, GetState } from "./functions/state";
import { Title } from "./scenes/title";
import { helpScene } from "./scenes/help";
import { initKeys } from "./functions/input";

const canvas = document.getElementsByTagName("canvas")[0];

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

  if (document.monetization && document.monetization.state === "started") {
    alert("hej");
  }
  let l = 1;
  window["zzfx_x"] = new AudioContext();

  // Base64
  const images: any = {};
  const pngText = "data:image/png;base64,";
  const imgSrc = [
    pngText +
      "iVBORw0KGgoAAAANSUhEUgAAATgAAAAHAQMAAACm6sPlAAAABlBMVEVHcEz///7ok5LVAAAAAXRSTlMAQObYZgAAAOJJREFUGBkFgKFqw0AYgA8CNxPK5C9C5HSZGBHHFfokBz9ETVSOcaTPUbk3+dWnQmSZKGVqMkyNiOMobihhqzUy9STIJZePCWCswUnXxsNu6s8xunfG2Swhfk7rL8AswDruji68dOr7tFdVB4aZIf471X8AE7jmsbu4oO1T+zYlr+ooRilLFf+XagWWLKx1CMOXE237fmymNh5cxTADYUvXO+W+eSHXLKeLE21Dc25UtHEwzmYjwi2xYPMNYVhX+Tnu3Wt7Uq8q6h0lbNUiU14myPa5ZMnPIDXspTuco49RYngAcXeJFg24RkQAAAAASUVORK5CYII=",
    pngText +
      "iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgBAMAAAD562lmAAAAGFBMVEVHcEyUlAOGAQAAAAA0NTR2CFQAAQD////Xg+MKAAAAAXRSTlMAQObYZgAABNhJREFUSMd1l01PIzkQhg3WhutaJpyHDttnuwuHM0N+QNiWNVfokdjraJEmf3/q090dwEi4G5N66q0P23HussPhPh/LtS/+D3RcnX7x+9Wvec0nmQCWn+gGNPQNZ5lWhm3t/PkToLty50AASMKDtPjETkiXOwUtDe+6j88+rYBPOtwSZMKYJP7IQjJDXXc5KPADRPXas39fAe91WEgbx/mKD56BNVkwLCbJCRBJSwhAC4cvUB/e8dmf0qchNWXz6/tIH/ZQyiktPCkjPJySvMIaYmsC3O1GqEfnHkTiGw8XwmO4DuF6EcFaRyCBp1rQIsBY30GAZSSj4jkF4PS+htgaA+MAw/DP0SRuehy3ty8NqMrYbGEggQlY8Ik9GX8wQDz3YxlPsIZsmirncog7TT5KBKlqjPxBhynzUMdS1ZCEFBhIof1B73EYyHP/71DQl+YAWX7VNQUCTAz0J9g513evUz85EfgYPAthIM+O0aYQnIJH59FzHC4D/u5qc4Dzr2sCDCHmyNIf/sdpQuDUL4CjhLIpdEUVIlCqqRDQZSRMExokUGoOUFmgKl4TICKj1PfQJVG4AqoySuEo9TpCQoNI1JpBHgECDCCgvv/WHEAeI/p+71Qt8keu792wawrnHNYycuh8rVzlQEmgfw8xmUJ5DaX+7VjN8NIccBtcwDFMwEQfqAijbJEeJfZvE+ewtQUpS4vGR3dzPPLMQJ+DKA1hW5+PZHAHswPulQRS5nAdG076NGu/ACnsuttuAYyiLJOjkQwRsJLSHLUKZuBYcD3nkJoD7pkjysTtf6ff0mdh3vfPGz9HALSMdigyicEUSx8NmGPkhkYrNVZyaFtDc+CvCsSKezSz3b+9cKjYdR29KLQcGgjt00/iiJJ/BGRlCsYQIjFQhAl0bA6MnsOJCE+ROnRaHHYqYAL7m26u0hihAgIDQM00o30OrYEUjKEgs2g1Y+6eizngkudkWBAPIMB23iFvBSQ9gUE6I5VztADGJZCKuIZq75L9mIOWSTg83iGva8DpHEgcDiVHHu1TfI+kREIadNvIWeKW2UW3AEZG2jF0eLpHIJwrbH2YsQI4hKVSsWR+KQici0X7EVe4nBWkDnDfkA+qkIx+v16ElHLYr46nyo3uY405WhOQwu2zHHuaHmtUA7EDoK6ILwwMd6yx3Xd6OS1mIMVU+g+40rRpL2IZsa39CBnKcXn1YFCadwo3n+U4buGeRV7aPao7B1KJSVXS7INtMGHLD9Snq6uGn09QBdLTfr+3HPJ4akBt/JZDKQJnM/Vl8iDFpztdbNfG1WVkAdwT0nLYcZ22xretTauUN+ugm3bgiMWYBSipC60eFIjgBDA7wPdK+NmAUqfnO80M9DlGPkx0zlpyDRjzGoizl3NF3jckdPPzZa5SDt2XCs2yzVlqwmXLJYQPChUoCwjEHXQGBsQ93n21l/Ln1PEWw+C536Tfo8vRLS7EEQAi8IGWg/z5zbk8A6lsnu4/KLQq5eNAtxLrcDZnezY4H61oaD0AJCYhOVDjhBvX4uHc3YG37+/zd5LpDOi1s21WJQokJ7wYuwDdyaiWkaS7maA2trfdq0TjbSYar/O9tN2gYVHmrn214HKUOr3AWLMi/LVKMqNeb74omg99qCA/A/XLk9a+SP4DmfeO6HZyoK8AAAAASUVORK5CYII="
  ];
  ["font", "gfx"].forEach((name, i) => {
    images[name] = new Image();
    images[name].src = imgSrc[i];
  });

  images.gfx.onload = () => {
    let spriteSheets = GetSpriteSheets(images.gfx);
    const state: any = { ...images, spriteSheets, touches: {}, keys: {} };
    SetState(state);
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
