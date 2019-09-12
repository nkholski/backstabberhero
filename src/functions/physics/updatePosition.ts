export const updatePosition = body => {
  body.position = { x: body.x + body.dx, y: body.y + body.dy };
};
