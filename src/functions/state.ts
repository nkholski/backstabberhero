import { getContext } from "../dependencies/kontra.js";

export const SetState = (state: any) => {
  const body = document.getElementsByTagName("body")[0];

  const globalState: any = window["nkholski"] || {};

  const context = getContext();

  let mobile = "ontouchstart" in window;

  window["nkholski"] = {
    body,
    ...globalState,
    ...state,
    context,
    mobile,
    press: (mobile ? "TOUCH" : "PRESS Z") + " TO CONTINUE"
  };
};

export const GetState = () => {
  return window["nkholski"];
};
