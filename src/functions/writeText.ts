import { getContext } from "../dependencies/kontra";

const writeText = (
  font,
  text,
  x,
  y,
  scale = 1,
  amplitude = 0,
  tick = 0,
  context = getContext()
) => {
  text = "" + text;
  x = x === -1 ? -128 : x;
  x = x < 0 ? Math.abs(x) - (text.length * 8 * scale) / 2 : x;

  let adjX = 0;

  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i) - 65; // Normalize A-Z
    if (code != -33) {
      // Skip space

      if (code === -55) {
        // NEW LINE
        y += 10 * scale;
        code = -36;
        adjX = -(i + 1) * 8 * scale;
        continue;
      }

      if (code < 0) {
        // FIX numbers and special characters
        code += 46;
      }

      context.drawImage(
        font,
        code * 8,
        0,
        8,
        8,
        x + i * 8 * scale + adjX,
        y + amplitude * Math.sin(tick / 9 + i / 3),
        scale * 8,
        scale * 8
      );
    }
  }
};

export default writeText;
