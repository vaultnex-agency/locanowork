/**
 * Universal Natural Language Search Query Parser for LOCANO
 * Detects user intent (Accommodation/PG, Food/Mess, Transport, Emergency)
 * and normalizes Mangaluru locations with typo tolerance.
 */

export interface ParsedSearchResult {
  category: "accommodation" | "mess" | "transport" | "emergency" | "all"
  targetUrl: string
  normalizedLocation: string | null
  displayLabel: string
  genderFilter?: "Boys" | "Girls"
  dietaryFilter?: "Pure Veg" | "Veg & Non-Veg"
  typeFilter?: "PG" | "Hostel" | "Flat / Shared Apartment"
}

export interface SearchSuggestion {
  title: string
  subtitle: string
  category: "accommodation" | "mess" | "transport" | "emergency"
  url: string
}

/* ------------------------------------------------------------------ */
/* Mangaluru Known Locations & Common Typo / Alias Map                 */
/* ------------------------------------------------------------------ */
export const MANGALURU_AREAS = [
  "Deralakatte",
  "Balmatta",
  "Kadri",
  "Bejai",
  "Kankanady",
  "Hampankatta",
  "Surathkal",
  "Kottara",
  "Falnir",
  "Pumpwell",
  "Mallikatte",
  "Jyothi",
  "Lalbagh",
  "Valencia",
  "Urwa",
  "State Bank",
  "Car Street",
  "Bendoorwell",
  "Attavar",
  "Kavoor",
  "Padil",
  "Yenepoya",
  "KSHEMA",
  "NITK",
] as const

const AREA_ALIASES: Record<string, string> = {
  // Deralakatte
  derlakatee: "Deralakatte",
  derlakatte: "Deralakatte",
  deralakate: "Deralakatte",
  derlakate: "Deralakatte",
  deralkatte: "Deralakatte",
  deralakatte: "Deralakatte",
  kshema: "Deralakatte",
  yenepoya: "Deralakatte",

  // Balmatta
  balmata: "Balmatta",
  balmatta: "Balmatta",

  // Surathkal
  suratkal: "Surathkal",
  surathkal: "Surathkal",
  suratkall: "Surathkal",
  nitk: "Surathkal",

  // Hampankatta
  hampankata: "Hampankatta",
  hampankatte: "Hampankatta",
  hampanakatta: "Hampankatta",
  hampankatta: "Hampankatta",

  // Kankanady
  kankanadi: "Kankanady",
  kankannady: "Kankanady",
  kankanady: "Kankanady",

  // Kadri & Mallikatte
  kadri: "Kadri",
  mallikatte: "Mallikatte",
  malikatte: "Mallikatte",

  // Bejai & Kottara
  bejai: "Bejai",
  bijai: "Bejai",
  kottara: "Kottara",
  "kottara chowki": "Kottara",

  // Pumpwell & Falnir
  pumpwell: "Pumpwell",
  pumpwel: "Pumpwell",
  falnir: "Falnir",
  falneer: "Falnir",

  // Others
  lalbagh: "Lalbagh",
  lalbag: "Lalbagh",
  jyothi: "Jyothi",
  jyoti: "Jyothi",
  valencia: "Valencia",
  urwa: "Urwa",
  "state bank": "State Bank",
  statebank: "State Bank",
  attavar: "Attavar",
  bendoorwell: "Bendoorwell",
}

/* ------------------------------------------------------------------ */
/* Levenshtein Distance for Typo-Tolerant String Matching             */
/* ------------------------------------------------------------------ */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

/**
 * Finds the canonical Mangaluru area for a given token using alias mapping
 * or fuzzy distance matching.
 */
export function matchMangaluruArea(rawInput: string): string | null {
  const clean = rawInput.trim().toLowerCase()
  if (!clean) return null

  // 1. Direct alias check
  if (AREA_ALIASES[clean]) {
    return AREA_ALIASES[clean]
  }

  // 2. Direct case-insensitive match against canonical areas
  for (const area of MANGALURU_AREAS) {
    if (area.toLowerCase() === clean) {
      return area
    }
  }

  // 3. Substring match
  for (const area of MANGALURU_AREAS) {
    if (clean.includes(area.toLowerCase()) || area.toLowerCase().includes(clean)) {
      if (clean.length >= 4) return area
    }
  }

  // 4. Fuzzy Levenshtein match for typos (threshold <= 2)
  let bestMatch: string | null = null
  let minDistance = 3

  for (const [alias, canonical] of Object.entries(AREA_ALIASES)) {
    const dist = levenshteinDistance(clean, alias)
    if (dist < minDistance) {
      minDistance = dist
      bestMatch = canonical
    }
  }

  return bestMatch
}

/* ------------------------------------------------------------------ */
/* Keywords Definition                                                */
/* ------------------------------------------------------------------ */
const MESS_KEYWORDS = [
  "mess",
  "food",
  "tiffin",
  "canteen",
  "meal",
  "meals",
  "thali",
  "hotel",
  "restaurant",
  "dining",
  "lunch",
  "dinner",
  "breakfast",
  "bhojnalaya",
]

const ACCOMMODATION_KEYWORDS = [
  "pg",
  "hostel",
  "room",
  "rooms",
  "flat",
  "flats",
  "apartment",
  "stay",
  "stays",
  "accommodation",
  "colive",
  "rent",
]

const TRANSPORT_KEYWORDS = [
  "bus",
  "buses",
  "route",
  "routes",
  "stop",
  "stops",
  "timing",
  "timings",
  "transit",
  "schedule",
]

const EMERGENCY_KEYWORDS = [
  "emergency",
  "hospital",
  "hospitals",
  "police",
  "ambulance",
  "fire",
  "doctor",
  "clinic",
  "helpline",
]

/* ------------------------------------------------------------------ */
/* Main Query Parser                                                  */
/* ------------------------------------------------------------------ */
export function parseSearchQuery(rawQuery: string): ParsedSearchResult {
  const query = rawQuery.trim().toLowerCase()
  if (!query) {
    return {
      category: "all",
      targetUrl: "/accommodation",
      normalizedLocation: null,
      displayLabel: "Search Mangaluru",
    }
  }

  // Check for gender filters
  let genderFilter: "Boys" | "Girls" | undefined
  if (/\b(girls?|women|female|ladies)\b/i.test(query)) {
    genderFilter = "Girls"
  } else if (/\b(boys?|men|male|gents)\b/i.test(query)) {
    genderFilter = "Boys"
  }

  // Check for dietary filters
  let dietaryFilter: "Pure Veg" | "Veg & Non-Veg" | undefined
  if (/\b(pure[\s-]?veg|vegetarian)\b/i.test(query)) {
    dietaryFilter = "Pure Veg"
  } else if (/\b(non[\s-]?veg)\b/i.test(query)) {
    dietaryFilter = "Veg & Non-Veg"
  }

  // Check for accommodation type
  let typeFilter: "PG" | "Hostel" | "Flat / Shared Apartment" | undefined
  if (/\bhostels?\b/i.test(query)) {
    typeFilter = "Hostel"
  } else if (/\b(flats?|apartments?)\b/i.test(query)) {
    typeFilter = "Flat / Shared Apartment"
  } else if (/\bpgs?\b/i.test(query)) {
    typeFilter = "PG"
  }

  // Extract location token by stripping known intent words and connectors
  const cleanedTokens = query
    .replace(/\b(in|at|near|around|for|to|from|find|look|show|me|the|and|or|best|cheap)\b/gi, " ")
    .replace(
      new RegExp(
        `\\b(${[
          ...MESS_KEYWORDS,
          ...ACCOMMODATION_KEYWORDS,
          ...TRANSPORT_KEYWORDS,
          ...EMERGENCY_KEYWORDS,
          "boys?",
          "girls?",
          "men",
          "women",
          "pure",
          "veg",
          "non-veg",
        ].join("|")})\\b`,
        "gi"
      ),
      " "
    )
    .trim()

  const matchedArea = matchMangaluruArea(cleanedTokens)

  // Determine Category Intent
  const hasMess = MESS_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(query))
  const hasAcc = ACCOMMODATION_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(query)) || !!genderFilter || !!typeFilter
  const hasTransport = TRANSPORT_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(query))
  const hasEmergency = EMERGENCY_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(query))

  // 1. Food & Mess
  if (hasMess && !hasAcc) {
    const params = new URLSearchParams()
    if (matchedArea) params.set("search", matchedArea)
    if (dietaryFilter) params.set("dietary", dietaryFilter)

    const targetUrl = `/mess${params.toString() ? `?${params.toString()}` : ""}`
    const label = matchedArea
      ? `${dietaryFilter || ""} Messes in ${matchedArea}`.trim()
      : "Mangaluru Food & Mess Directory"

    return {
      category: "mess",
      targetUrl,
      normalizedLocation: matchedArea,
      displayLabel: label,
      dietaryFilter,
    }
  }

  // 2. Accommodation
  if (hasAcc && !hasMess) {
    const params = new URLSearchParams()
    if (matchedArea) params.set("search", matchedArea)
    if (genderFilter) params.set("gender", genderFilter)
    if (typeFilter) params.set("type", typeFilter)

    const targetUrl = `/accommodation${params.toString() ? `?${params.toString()}` : ""}`
    const typeLabel = typeFilter ? `${typeFilter}s` : "PGs & Hostels"
    const genderLabel = genderFilter ? `${genderFilter} ` : ""
    const label = matchedArea
      ? `${genderLabel}${typeLabel} in ${matchedArea}`.trim()
      : `${genderLabel}${typeLabel} in Mangaluru`.trim()

    return {
      category: "accommodation",
      targetUrl,
      normalizedLocation: matchedArea,
      displayLabel: label,
      genderFilter,
      typeFilter,
    }
  }

  // 3. Transport
  if (hasTransport) {
    const params = new URLSearchParams()
    if (matchedArea) params.set("search", matchedArea)

    return {
      category: "transport",
      targetUrl: `/transport${params.toString() ? `?${params.toString()}` : ""}`,
      normalizedLocation: matchedArea,
      displayLabel: matchedArea ? `Buses connecting ${matchedArea}` : "Mangaluru Bus Transport",
    }
  }

  // 4. Emergency
  if (hasEmergency) {
    return {
      category: "emergency",
      targetUrl: "/emergency",
      normalizedLocation: matchedArea,
      displayLabel: "Mangaluru Emergency Services",
    }
  }

  // 5. Default: If only an area was typed (e.g., "derlakatee", "balmatta")
  if (matchedArea) {
    // Default to accommodation for this area, but suggestions will provide mess/transport
    return {
      category: "all",
      targetUrl: `/accommodation?search=${encodeURIComponent(matchedArea)}`,
      normalizedLocation: matchedArea,
      displayLabel: `Explore ${matchedArea} (PGs, Mess & Transport)`,
    }
  }

  // Fallback: search term applied to accommodations
  return {
    category: "accommodation",
    targetUrl: `/accommodation?search=${encodeURIComponent(rawQuery.trim())}`,
    normalizedLocation: null,
    displayLabel: `Search "${rawQuery.trim()}" across LOCANO`,
  }
}

/**
 * Generates instant quick-action suggestions as the user types
 */
export function getLiveSearchSuggestions(query: string): SearchSuggestion[] {
  const clean = query.trim()
  if (!clean) return []

  const parsed = parseSearchQuery(clean)
  const area = parsed.normalizedLocation || matchMangaluruArea(clean)

  if (area) {
    return [
      {
        title: `Messes & Food in ${area}`,
        subtitle: `Find student thalis, monthly mess passes & dining in ${area}`,
        category: "mess",
        url: `/mess?search=${encodeURIComponent(area)}`,
      },
      {
        title: `PGs & Hostels in ${area}`,
        subtitle: `Explore verified student accommodation & stays in ${area}`,
        category: "accommodation",
        url: `/accommodation?search=${encodeURIComponent(area)}`,
      },
      {
        title: `Buses & Routes for ${area}`,
        subtitle: `Check bus numbers, timings and stops connecting ${area}`,
        category: "transport",
        url: `/transport?search=${encodeURIComponent(area)}`,
      },
    ]
  }

  // If specific category was detected
  if (parsed.category === "mess") {
    return [
      {
        title: parsed.displayLabel,
        subtitle: "View dining, food and mess listings",
        category: "mess",
        url: parsed.targetUrl,
      },
      {
        title: "Explore Student PGs instead",
        subtitle: "Browse accommodations in Mangaluru",
        category: "accommodation",
        url: `/accommodation?search=${encodeURIComponent(clean)}`,
      },
    ]
  }

  if (parsed.category === "accommodation") {
    return [
      {
        title: parsed.displayLabel,
        subtitle: "View verified student stays, hostels and PGs",
        category: "accommodation",
        url: parsed.targetUrl,
      },
      {
        title: "Explore Mess & Food in this area",
        subtitle: "Browse dining and student meal plans",
        category: "mess",
        url: `/mess?search=${encodeURIComponent(clean)}`,
      },
    ]
  }

  return [
    {
      title: `Search "${clean}" in Accommodation`,
      subtitle: "PGs, student residences & hostels",
      category: "accommodation",
      url: `/accommodation?search=${encodeURIComponent(clean)}`,
    },
    {
      title: `Search "${clean}" in Food & Mess`,
      subtitle: "Daily meals, thalis & dining options",
      category: "mess",
      url: `/mess?search=${encodeURIComponent(clean)}`,
    },
    {
      title: `Search "${clean}" in Transport`,
      subtitle: "Bus routes, stops and numbers",
      category: "transport",
      url: `/transport`,
    },
  ]
}
