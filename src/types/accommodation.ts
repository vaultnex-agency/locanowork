export type AccommodationType = "PG" | "Hostel" | "Shared Apartment"
export type GenderPreference = "Boys" | "Girls" | "Co-ed"
export type SharingOption = "Single Room" | "Double Sharing" | "Triple Sharing" | "Four Sharing"

export interface AccommodationListing {
  id: string
  ownerId?: string | null
  name: string
  tagline: string
  type: AccommodationType
  gender: GenderPreference
  area: string
  approximateLocation: string
  nearestLandmark: string
  monthlyRentFrom: number
  securityDeposit: number
  sharingOptions: SharingOption[]
  amenities: string[]
  roomFeatures: string[]
  houseRules: string[]
  foodOption: "Included (3 meals)" | "Optional / Available" | "Self-cooking only"
  noticePeriodDays: number
  description: string
  sampleImage: string
  images?: string[]
  status?: "pending" | "published" | "rejected" | "archived"
  isDemo?: boolean
  createdAt?: string
}
