import type { MetadataRoute } from "next"
import { buses } from "@/data/buses"
import { stops } from "@/data/stops"

const BASE_URL = "https://locano.in"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/transport`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/transport/near`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/transport/route/balmatta-to-deralakatte`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/transport/route/state-bank-to-surathkal`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/accommodation`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/mess`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/pg-owner/submit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const busRoutes: MetadataRoute.Sitemap = buses.map((bus) => ({
    url: `${BASE_URL}/transport/bus/${encodeURIComponent(bus.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const stopRoutes: MetadataRoute.Sitemap = stops.map((stop) => ({
    url: `${BASE_URL}/transport/stop/${encodeURIComponent(stop.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...busRoutes, ...stopRoutes]
}
