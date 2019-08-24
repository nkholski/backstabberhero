export const CheckCollidingBody = (body, others) => {
  let col = null;

  others.forEach(enemy => {
    if (enemy.dead) {
      return;
    }
    // Could share with getBlocked
    if (
      body.x < enemy.x + enemy.width &&
      body.x + 16 > enemy.x &&
      body.y < enemy.y + enemy.height &&
      body.y + body.height > enemy.y
    ) {
      col = enemy;
    }
    if (enemy.vision === true && enemy.y === 128) {
      //  debugger;
    }
  });
  return col;
};
