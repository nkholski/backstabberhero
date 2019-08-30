type ICanvasFunction = (CanvasRenderingContext2D) => void;

export const MakeTempCanvas = (canvasFunction: ICanvasFunction) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  canvasFunction(context);
  return canvas;
};
