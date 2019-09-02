import { GetBlocked } from "./getBlocked";
export const CheckCliff = (body, platforms) => {
  const tmpBody = {
    ...body,
    x: body.x + (body.facing === 1 ? 8 : -8),
    y: body.y + 8
  };
  GetBlocked(tmpBody, platforms);
  return tmpBody.blocked;
};
