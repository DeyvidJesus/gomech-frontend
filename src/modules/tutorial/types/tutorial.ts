export type TutorialKey =
  | 'dashboard-overview'
  | 'clients-management'
  | 'client-details'
  | 'vehicles-management'
  | 'vehicle-details'
  | 'service-orders'
  | 'service-order-details'
  | 'inventory-dashboard'
  | 'parts-catalog'
  | 'analytics-dashboard'
  | 'admin-hub'

export interface TutorialProgress {
  completedTutorials: TutorialKey[]
  lastUpdatedAt?: string
}
