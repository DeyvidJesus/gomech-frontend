export type UserRole = 'ADMIN' | 'USER'

export interface Organization {
  id: number
  name: string
  slug: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  mfaEnabled: boolean
  organization: Organization
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
  mfaEnabled?: boolean
}

export interface UpdateUserRequest {
  name: string
  email: string
  role: UserRole
  mfaEnabled?: boolean
}

export interface UserListResponse {
  content: User[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface UserCreationWithMfaResponse {
  user: User
  mfaSecret: string
}
