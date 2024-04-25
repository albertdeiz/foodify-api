import { nanoid } from "nanoid";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

import { AUTH_SECRET_PHRASE } from "@/constants";

import type { JWTPayload } from "jose";

export interface UserJwtPayload extends JWTPayload {
  userId: number;
  workspaceId: number;
}

export const generateAccessToken = async (payload: UserJwtPayload) => {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(AUTH_SECRET_PHRASE));

  return token;
};

export const validateAccessToken = async (
  accessToken: string
): Promise<UserJwtPayload> => {
  try {
    const verified = await jwtVerify(
      accessToken,
      new TextEncoder().encode(AUTH_SECRET_PHRASE)
    );

    return verified.payload as UserJwtPayload;
  } catch (err) {
    throw new Error("Your token has expired.");
  }
};

export const generatePassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

export const validatePassword = async (
  password: string,
  userPassword: string
): Promise<boolean> => {
  return compare(password, userPassword);
};
