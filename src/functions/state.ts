import { getContext } from "../dependencies/kontra.js";

export const SetState = (state: any) => {
  const globalState: any = window["nkholski"] || {};
  window["nkholski"] = { ...globalState, ...state, context: getContext() };
};

export const GetState = () => {
  return window["nkholski"];
};
