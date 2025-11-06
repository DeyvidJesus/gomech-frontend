export type UserRole = 'ADMIN' | 'USER'

export interface Organization {
  id: number
  name: string
  slug: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  id: number
  name: string
  email: string
  role: UserRole
  mfaEnabled?: boolean
  organization?: Organization
}

export interface LoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: UserRole
  mfaEnabled?: boolean
}

export interface RegisterResponse extends AuthResponse {
  mfaSetupSecret?: string
}

export interface RefreshTokenResponse extends AuthTokens {}
