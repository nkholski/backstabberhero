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

let gamepad: Gamepad;

let pressedKeys = {};
let pressedGamepadKeys = {
  left: false,
  right: false,
  down: false,
  up: false,
  stab: false,
  jump: false
};
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
    90: Ekeys.Stab, // Z
    65: Ekeys.Left, // A
    87: Ekeys.Up, // W
    68: Ekeys.Right, // S
    83: Ekeys.Duck // D,
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
      touches[i] = {
        x: (e.touches[i].clientX - canvas.offsetLeft) * ratio,
        y: e.touches[i].clientY * ratio
      };
    }
    pressedKeys[Ekeys.Any] = touches.length > 0;
    pressedKeys[Ekeys.Action] = touches.length > 0;
  };
  canvas.ontouchstart = update;
  canvas.ontouchend = update;

  const updateMouse = e => {
    update({ touches: e.type === "mouseup" ? [] : [e] });
  };
  canvas.onmousedown = updateMouse;
  canvas.onmouseup = updateMouse;

  window.addEventListener("gamepadconnected", (event: GamepadEvent) => {
    gamepad = event.gamepad;
  });
}

const updateGamepadKeys = () => {
  const keys = {
    left: false,
    right: false,
    down: false,
    up: false,
    stab: false,
    jump: false
  };
  const keyMapper = [
    { i: "left", k: 37 },
    { i: "right", k: 39 },
    { i: "jump", k: 32 },
    { i: "stab", k: 90 },
    { i: "up", k: 38 },
    { i: "down", k: 40 }
  ];

  for (let i = 0; i < gamepad.axes.length - 1; i += 2) {
    keys.left = keys.left || gamepad.axes[i] < -0.5;
    keys.right = keys.right || gamepad.axes[i] > 0.5;
    keys.up = keys.up || gamepad.axes[i + 1] < -0.5;
    keys.down = keys.down || gamepad.axes[i + 1] > 0.5;
  }
  keys.jump = gamepad.buttons[0].pressed || gamepad.buttons[1].pressed;
  keys.stab = gamepad.buttons[2].pressed || gamepad.buttons[3].pressed;

  keyMapper.forEach(btnkey => {
    if (keys[btnkey.i] === pressedGamepadKeys[btnkey.i]) {
      return;
    }
    const evt = { which: btnkey.k };

    keys[btnkey.i] ? keydownEventHandler(evt) : keyupEventHandler(evt);
  });
  pressedGamepadKeys = keys;
};

export function keyPressed(key) {
  var gamepads = navigator.getGamepads();

  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) gamepad = gamepads[i];
  }
  if (gamepad) {
    updateGamepadKeys();
  }
  return !!pressedKeys[key];
}

export function getTouches() {
  return touches;
}
