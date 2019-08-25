export const SetState = (state: any) => {
  const globalState: any = window["nkholski"] || {};
  window["nkholski"] = { ...globalState, ...state };
};

export const GetState = () => {
  return window["nkholski"];
};
