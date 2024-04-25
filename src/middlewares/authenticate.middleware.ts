import { validateAccessToken } from "@/utils/auth.utils";

import type { Request, Response, NextFunction } from "express";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization ?? "";
  const accessToken = authorization?.split(" ")[1];

  // try {
  //   const { userId, workspaceId } = await validateAccessToken(
  //     accessToken ?? ""
  //   );
  //   req.userId = userId;
  //   req.workspaceId = workspaceId;
  //   next();
  // } catch (e) {
  //   const error = e as Error;
  //   return res.status(401).json({ message: error.message });
  // }

  req.userId = 1;
  req.workspaceId = 1;
  next();
}

export default authenticate;
