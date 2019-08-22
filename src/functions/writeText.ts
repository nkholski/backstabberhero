import { getContext } from "../dependencies/kontra";

const writeText = (font, text, x, y, s, aplitude = 0, tick = 0) => {
  console.log(tick);
  for (let i = 0; i < text.length; i++) {
    let code = (text.charCodeAt(i) - 65) * 8;
    if (code === -256) {
      code = 46 * 8;
    }
    getContext().drawImage(
      font,
      code,
      0,
      8,
      8,
      x + i * 8 * s,
      y + aplitude * Math.sin(tick / 9 + i / 3),
      s * 8,
      s * 8
    );
  }
};

export default writeText;
