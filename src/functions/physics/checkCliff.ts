import { GetBlocked } from "./getBlocked";
export const CheckCliff = (body, level) => {
  const tmpBody = {
    ...body,
    x: body.x + (body.facing === 1 ? 8 : -8),
    y: body.y + 8
  };
  GetBlocked(tmpBody, level);
  return tmpBody.blocked;
};
