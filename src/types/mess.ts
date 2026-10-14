export type DietaryType = "Pure Veg" | "Veg & Non-Veg"
export type ServiceType = "Dine-in Mess" | "Tiffin & Delivery" | "Dine-in & Delivery"
export type MealType = "Breakfast" | "Lunch" | "Dinner"

export interface MealPlan {
  name: string
  price: number
  period: "month" | "15-days" | "per-meal"
  description: string
  popular?: boolean
}

export interface MessListing {
  id: string
  name: string
  tagline: string
  cuisine: string
  dietary: DietaryType
  serviceType: ServiceType
  area: string
  approximateLocation: string
  nearestLandmark: string
  monthlyPriceFrom: number
  perMealPriceFrom: number
  mealsServed: MealType[]
  mealPlans: MealPlan[]
  dailyMenuSample: {
    breakfast?: string
    lunch: string
    dinner: string
  }
  timings: {
    breakfast?: string
    lunch: string
    dinner: string
  }
  highlights: string[]
  kitchenFeatures: string[]
  subscriptionRules: string[]
  description: string
  sampleImage: string
  isDemo: true
}
