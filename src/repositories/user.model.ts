import { PrismaClient } from "@prisma/client";

import {
  generateAccessToken,
  generatePassword,
  validatePassword,
} from "@/utils/auth.utils";

import type { User as IUser, Workspace, UserWorkspace } from "@prisma/client";

export interface User extends IUser {
  user_workspaces: UserWorkspace;
}

interface UserWorkspacesPayload {
  email: string;
  password: string;
}

interface UserLoginPayload extends UserWorkspacesPayload {
  workspaceId: number;
}

export interface UserRegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const prisma = new PrismaClient();

const select = {
  password: false,
  created_at: true,
  updated_at: true,
  email: true,
  first_name: true,
  last_name: true,
  id: true,
};

const sanitizeDbResponse = (data: any): User => {
  return {
    ...data,
    updated_at: data.created_at.toISOString(),
    created_at: data.updated_at.toISOString(),
  };
};

const sanitizeWorkspaceDbResponse = (data: any): Workspace => {
  return {
    ...data,
    created_at: data.created_at.toISOString(),
    updated_at: data.updated_at.toISOString(),
  };
};

export const registerUser = async ({
  email,
  firstName,
  lastName,
  password,
}: UserRegisterPayload): Promise<User> => {
  const hashedPassword = await generatePassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    },
    select,
  });

  return sanitizeDbResponse(user);
};

export const loginUser = async ({
  email,
  password,
  workspaceId,
}: UserLoginPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  const workspace = await prisma.workspace.findFirstOrThrow({
    where: {
      id: {
        equals: workspaceId,
      },
      user_workspaces: {
        some: {
          user_id: user.id,
        },
      },
    },
  });

  const isValidPassword = await validatePassword(password, user.password);

  if (!isValidPassword || !workspaceId) {
    throw new Error("Credentials are not valid");
  }

  const accessToken = await generateAccessToken({
    userId: user.id,
    workspaceId: workspace.id,
  });

  const { password: _, ...restUser } = user;

  return { access_token: accessToken, user: restUser };
};

export const getUserWorkspaces = async ({
  email,
  password,
}: UserWorkspacesPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  const workspaces = await prisma.workspace.findMany({
    where: {
      user_workspaces: {
        every: {
          user_id: {
            equals: user.id,
          },
        },
      },
    },
  });

  const isValidPassword = await validatePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("User o password is not valid.");
  }

  return workspaces.map(sanitizeWorkspaceDbResponse);
};
