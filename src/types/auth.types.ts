export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}
