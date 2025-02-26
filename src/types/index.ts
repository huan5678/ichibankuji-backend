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

export interface UpdateProfileInput {
  name?: string
  picture?: string
  currentPassword?: string
  newPassword?: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  password: string
}

export interface AdminUserUpdateInput {
  isActive?: boolean
  role?: 'USER' | 'ADMIN'
  credits?: number
}

export interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    picture?: string
    credits?: number
    isActive?: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}