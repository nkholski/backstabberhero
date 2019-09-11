import { getContext } from "../dependencies/kontra.js";

export const SetState = (state: any) => {
  const body = document.getElementsByTagName("body")[0];

  const globalState: any = window["nkholski"] || {};

  const context = getContext();

  window["nkholski"] = {
    body,
    ...globalState,
    ...state,
    context,
    mobile: "ontouchstart" in window
  };
};

export const GetState = () => {
  return window["nkholski"];
};
