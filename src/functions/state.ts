import { getContext } from "../dependencies/kontra.js";

export const SetState = (state: any) => {
  const globalState: any = window["nkholski"] || {};
  const images = {};
  const pngText = "data:image/png;base64,";
  const imgSrc = [
    pngText +
      "iVBORw0KGgoAAAANSUhEUgAAATgAAAAHAQMAAACm6sPlAAAABlBMVEVHcEz///7ok5LVAAAAAXRSTlMAQObYZgAAAOJJREFUGBkFgKFqw0AYgA8CNxPK5C9C5HSZGBHHFfokBz9ETVSOcaTPUbk3+dWnQmSZKGVqMkyNiOMobihhqzUy9STIJZePCWCswUnXxsNu6s8xunfG2Swhfk7rL8AswDruji68dOr7tFdVB4aZIf471X8AE7jmsbu4oO1T+zYlr+ooRilLFf+XagWWLKx1CMOXE237fmymNh5cxTADYUvXO+W+eSHXLKeLE21Dc25UtHEwzmYjwi2xYPMNYVhX+Tnu3Wt7Uq8q6h0lbNUiU14myPa5ZMnPIDXspTuco49RYngAcXeJFg24RkQAAAAASUVORK5CYII="
  ];
  ["font"].forEach((name, i) => {
    images[name] = new Image();
    images[name].src = imgSrc[i];
  });

  window["nkholski"] = {
    ...globalState,
    ...state,
    context: getContext(),
    mobile: screen.width < 800,
    ...images
  };
};

export const GetState = () => {
  return window["nkholski"];
};
