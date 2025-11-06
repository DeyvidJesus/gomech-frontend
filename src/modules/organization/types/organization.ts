export interface Organization {
  id: number
  name: string
  slug: string
  description?: string
  active: boolean
  contactEmail?: string
  contactPhone?: string
  address?: string
  document?: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationCreateRequest {
  name: string
  slug?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  document?: string
}

export interface OrganizationUpdateRequest {
  name: string
  slug?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  document?: string
}

export interface OrganizationListResponse {
  content: Organization[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

