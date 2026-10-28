import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { MessListing, DietaryType, ServiceType, MealType, MealPlan } from "@/types/mess"
import type { Database } from "@/types/database"

export interface FetchMessesParams {
  search?: string
  dietary?: string
  service?: string
  includeDemo?: boolean
}

type MessRow = Database["public"]["Tables"]["mess_listings"]["Row"]

function mapRowToMess(row: MessRow): MessListing {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    tagline: row.tagline,
    cuisine: row.cuisine,
    dietary: row.dietary as DietaryType,
    serviceType: row.service_type as ServiceType,
    area: row.area,
    approximateLocation: row.approximate_location,
    nearestLandmark: row.nearest_landmark,
    monthlyPriceFrom: row.monthly_price_from,
    perMealPriceFrom: row.per_meal_price_from,
    mealsServed: row.meals_served as MealType[],
    mealPlans: (row.meal_plans as unknown as MealPlan[]) || [],
    dailyMenuSample: (row.daily_menu_sample as unknown as MessListing["dailyMenuSample"]) || { lunch: "", dinner: "" },
    timings: (row.timings as unknown as MessListing["timings"]) || { lunch: "", dinner: "" },
    highlights: row.highlights,
    kitchenFeatures: row.kitchen_features,
    subscriptionRules: row.subscription_rules,
    description: row.description,
    sampleImage: row.sample_image || "/mess-tiffin.jpg",
    images: row.images,
    status: row.status,
    isDemo: row.is_demo,
    createdAt: row.created_at,
  }
}

export async function fetchMesses(
  params: FetchMessesParams = {}
): Promise<{ listings: MessListing[]; isFromDatabase: boolean; error?: string }> {
  const { search, dietary, service } = params

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient()
      if (supabase) {
        let query = supabase
          .from("mess_listings")
          .select("*")
          .eq("status", "published")
          .eq("is_demo", false)

        if (dietary && dietary !== "All") {
          query = query.eq("dietary", dietary as DietaryType)
        }
        if (service && service !== "All") {
          query = query.eq("service_type", service as ServiceType)
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) {
          console.error("Supabase mess query error:", error.message)
          return { listings: [], isFromDatabase: true, error: error.message }
        } else if (data) {
          let results = data.map(mapRowToMess)
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
      console.warn("Supabase mess query error:", err)
      return { listings: [], isFromDatabase: true }
    }
  }

  return { listings: [], isFromDatabase: false }
}

export async function fetchMessById(id: string): Promise<MessListing | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("mess_listings")
          .select("*")
          .eq("id", id)
          .eq("is_demo", false)
          .single()

        if (!error && data) {
          return mapRowToMess(data)
        }
      }
    } catch (err) {
      console.warn("Error fetching mess by id:", err)
    }
  }

  return null
}
