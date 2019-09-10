import { getContext } from "../dependencies/kontra.js";

export enum Ekeys {
  Jump,
  Up,
  Left,
  Right,
  Duck,
  Stab,
  Action,
  Any,
  Space
}

let pressedKeys = {};
let keyMap = {};
let touches = [];

function keydownEventHandler(evt) {
  let key = keyMap[evt.which];
  if (key) {
    pressedKeys[key] = true;
  }
  pressedKeys[Ekeys.Jump] = key == Ekeys.Up || key == Ekeys.Space;
  pressedKeys[Ekeys.Action] = key == Ekeys.Stab || key == Ekeys.Space;
  pressedKeys[Ekeys.Any] = true;
}

function keyupEventHandler(evt) {
  let key = keyMap[evt.which];
  if (key) {
    pressedKeys[key] = false;
  }
  pressedKeys[Ekeys.Jump] = false;
  pressedKeys[Ekeys.Action] = false;
  pressedKeys[Ekeys.Any] = false;
  pressedKeys[Ekeys.Any] = !!Object.keys(pressedKeys).find(
    id => pressedKeys[id]
  );
}

function blurEventHandler() {
  pressedKeys = {};
}

export function initKeys() {
  keyMap = {
    17: Ekeys.Stab, // Ctrl
    32: Ekeys.Space, // Space
    37: Ekeys.Left, // LeftArrow
    38: Ekeys.Up, // UpArrow
    39: Ekeys.Right, // RightArrow
    40: Ekeys.Duck, // DownArrow,
    90: Ekeys.Stab // Z
  };
  window.addEventListener("keydown", keydownEventHandler);
  window.addEventListener("keyup", keyupEventHandler);
  window.addEventListener("blur", blurEventHandler);

  // DOM-keys
  [
    { i: "l", k: 37 },
    { i: "r", k: 39 },
    { i: "l2", k: 37 },
    { i: "r2", k: 39 },
    { i: "j", k: 32 },
    { i: "s", k: 90 },
    { i: "d", k: 40 }
  ].forEach(btnkey => {
    const btn = document.getElementById(btnkey.i);
    const evt = { which: btnkey.k };
    btn.ontouchstart = () => keydownEventHandler(evt);
    btn.ontouchend = () => keyupEventHandler(evt);
  });

  // Canvas Touch
  let canvas = getContext().canvas;
  const update = e => {
    touches = [];
    const ratio = 256 / canvas.offsetWidth;
    for (let i = 0; i < e.touches.length; i++) {
      console.log("x=", e.touches[i].clientX, e.target.offsetLeft);

      touches[i] = {
        x: (e.touches[i].clientX - e.target.offsetLeft) * ratio,
        y: e.touches[i].clientY * ratio
      };
    }
    pressedKeys[Ekeys.Any] = touches.length > 0;
    pressedKeys[Ekeys.Action] = touches.length > 0;
  };
  canvas.ontouchstart = update;
  canvas.ontouchend = update;
}

export function keyPressed(key) {
  return !!pressedKeys[key];
}

export function getTouches() {
  return touches;
}
