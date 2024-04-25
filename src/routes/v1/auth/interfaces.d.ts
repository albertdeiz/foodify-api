import {
  getUserWorkspaces,
  loginUser,
  registerUser,
} from "@/repositories/user.model";

export interface UserRegisterParams {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface UserWorkspacesParams {
  email: string;
  password: string;
}

export interface UserLoginParams {
  email: string;
  password: string;
  workspace_id: number;
}

export type ResponseData = {
  error?: string;
  data?:
    | Awaited<ReturnType<typeof loginUser>>
    | Awaited<ReturnType<typeof registerUser>>
    | Awaited<ReturnType<typeof getUserWorkspaces>>;
};
