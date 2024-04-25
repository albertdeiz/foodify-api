import express from "express";
import {
  getUserWorkspaces,
  loginUser,
  registerUser,
} from "@/repositories/user.model";

import type { Request, Response } from "express";
import type {
  ResponseData,
  UserLoginParams,
  UserRegisterParams,
  UserWorkspacesParams,
} from "./interfaces";

const router = express.Router();

router.post(
  "/register",
  async (
    req: Request<{}, ResponseData, UserRegisterParams>,
    res: Response<ResponseData>
  ): Promise<void> => {
    const data = req.body;

    try {
      const user = await registerUser({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        password: data.password,
      });

      res.status(200).json({ data: user });
    } catch (e) {
      const error = e as Error;

      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/workspaces",
  async (
    req: Request<{}, ResponseData, UserWorkspacesParams>,
    res: Response<ResponseData>
  ): Promise<void> => {
    const data = req.body;

    try {
      const workspaces = await getUserWorkspaces({
        email: data.email,
        password: data.password,
      });

      res.status(200).json({ data: workspaces });
    } catch (e) {
      const error = e as Error;

      res.status(401).json({ error: error.message });
    }
  }
);

router.post(
  "/login",
  async (
    req: Request<{}, ResponseData, UserLoginParams>,
    res: Response<ResponseData>
  ) => {
    const data = req.body;

    try {
      const auth = await loginUser({
        email: data.email,
        password: data.password,
        workspaceId: data.workspace_id,
      });

      res.status(200).json({ data: auth });
    } catch (e) {
      const error = e as Error;
      res.status(401).json({ error: error.message });
    }
  }
);

export default router;
