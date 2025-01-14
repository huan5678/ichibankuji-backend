import { Context } from "hono";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserPayload;
}

export interface DrawResult {
  prizeId: string;
  prizeName: string;
}

export interface IController {
  success<T>(c: Context, data: T, status?: number): Response
  error(c: Context, message: string, status?: number): Response
}


export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}