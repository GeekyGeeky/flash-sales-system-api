export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  emailOrUsername: string;
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
