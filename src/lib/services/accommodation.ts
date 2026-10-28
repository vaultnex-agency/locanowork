import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { AccommodationListing, AccommodationType, GenderPreference, SharingOption } from "@/types/accommodation"
import type { Database } from "@/types/database"

export interface FetchAccommodationsParams {
  search?: string
  gender?: string
  type?: string
  includeDemo?: boolean
}

type AccommodationRow = Database["public"]["Tables"]["accommodation_listings"]["Row"]

function mapRowToListing(row: AccommodationRow): AccommodationListing {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    tagline: row.tagline,
    type: row.type as AccommodationType,
    gender: row.gender as GenderPreference,
    area: row.area,
    approximateLocation: row.approximate_location,
    nearestLandmark: row.nearest_landmark,
    monthlyRentFrom: row.monthly_rent_from,
    securityDeposit: row.security_deposit,
    sharingOptions: row.sharing_options as SharingOption[],
    amenities: row.amenities,
    roomFeatures: row.room_features,
    houseRules: row.house_rules,
    foodOption: row.food_option as AccommodationListing["foodOption"],
    noticePeriodDays: row.notice_period_days,
    description: row.description,
    sampleImage: row.sample_image || "/hero-coast.png",
    images: row.images,
    status: row.status,
    isDemo: row.is_demo,
    createdAt: row.created_at,
  }
}

export async function fetchAccommodations(
  params: FetchAccommodationsParams = {}
): Promise<{ listings: AccommodationListing[]; isFromDatabase: boolean; error?: string }> {
  const { search, gender, type } = params

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient()
      if (supabase) {
        let query = supabase
          .from("accommodation_listings")
          .select("*")
          .eq("status", "published")
          .eq("is_demo", false)

        if (gender && gender !== "All") {
          query = query.eq("gender", gender as GenderPreference)
        }
        if (type && type !== "All") {
          query = query.eq("type", type as AccommodationType)
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) {
          console.error("Supabase accommodation query error:", error.message)
          return { listings: [], isFromDatabase: true, error: error.message }
        } else if (data) {
          let results = data.map(mapRowToListing)
          if (search) {
            const q = search.trim().toLowerCase()
            results = results.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.area.toLowerCase().includes(q) ||
                item.nearestLandmark.toLowerCase().includes(q)
            )
          }
          return { listings: results, isFromDatabase: true }
        }
      }
    } catch (err) {
      console.warn("Supabase query error:", err)
      return { listings: [], isFromDatabase: true }
    }
  }

  return { listings: [], isFromDatabase: false }
}

export async function fetchAccommodationById(
  id: string
): Promise<AccommodationListing | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("accommodation_listings")
          .select("*")
          .eq("id", id)
          .eq("is_demo", false)
          .single()

        if (!error && data) {
          return mapRowToListing(data)
        }
      }
    } catch (err) {
      console.warn("Error fetching accommodation by id:", err)
    }
  }

  return null
}

export interface SubmitAccommodationInput {
  name: string
  tagline: string
  type: AccommodationType
  gender: GenderPreference
  area: string
  approximateLocation: string
  nearestLandmark: string
  monthlyRentFrom: number
  securityDeposit: number
  sharingOptions: string[]
  amenities: string[]
  roomFeatures: string[]
  houseRules: string[]
  foodOption: string
  noticePeriodDays: number
  description: string
  sampleImage?: string
}

export async function submitAccommodationListing(
  input: SubmitAccommodationInput
): Promise<{ success: boolean; listingId?: string; isPending: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isPending: false,
      message:
        "Supabase environment is not yet configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live listing submissions.",
    }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return {
      success: false,
      isPending: false,
      message: "Database client is unavailable.",
    }
  }

  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id

  const insertPayload: Database["public"]["Tables"]["accommodation_listings"]["Insert"] = {
    owner_id: userId || null,
    name: input.name,
    tagline: input.tagline,
    type: input.type,
    gender: input.gender,
    area: input.area,
    approximate_location: input.approximateLocation,
    nearest_landmark: input.nearestLandmark,
    monthly_rent_from: input.monthlyRentFrom,
    security_deposit: input.securityDeposit,
    sharing_options: input.sharingOptions,
    amenities: input.amenities,
    room_features: input.roomFeatures,
    house_rules: input.houseRules,
    food_option: input.foodOption,
    notice_period_days: input.noticePeriodDays,
    description: input.description,
    sample_image: input.sampleImage || "/hero-coast.png",
    status: "pending", // CRITICAL: strictly pending until admin approval
    is_demo: false,
  }

  const { data, error } = await supabase
    .from("accommodation_listings")
    .insert(insertPayload)
    .select("id")
    .single()

  if (error) {
    return {
      success: false,
      isPending: false,
      message: error.message || "Failed to submit property listing.",
    }
  }

  return {
    success: true,
    listingId: data ? (data as { id: string }).id : undefined,
    isPending: true,
    message:
      "Listing submitted successfully! It is now pending admin review. A Locano representative will contact you soon.",
  }
}
