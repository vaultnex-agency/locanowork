"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import type { Stop } from "@/data/stops"

interface RouteMapInnerProps {
  stops: Stop[]
  fromId?: string
  toId?: string
  highlightIds?: string[]
}

function MapUpdater({ stops }: { stops: Stop[] }) {
  const map = useMap()

  useEffect(() => {
    if (stops.length === 0) return
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [stops, map])

  return null
}

const createCustomIcon = (type: "start" | "end" | "intermediate", label?: string) => {
  let bg = "#ffffff"
  let border = "#1f6fe5"
  let size = 16
  let text = ""

  if (type === "start") {
    bg = "#1f6fe5"
    border = "#ffffff"
    size = 28
    text = `<span style="color:white;font-weight:bold;font-size:12px;">${label || "A"}</span>`
  } else if (type === "end") {
    bg = "#10b981"
    border = "#ffffff"
    size = 28
    text = `<span style="color:white;font-weight:bold;font-size:12px;">${label || "B"}</span>`
  }

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${bg};
        border: 2px solid ${border};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      ">
        ${text}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export default function RouteMapInner({
  stops,
  fromId,
  toId,
}: RouteMapInnerProps) {
  if (stops.length === 0) return null

  const center: [number, number] = [stops[0].lat, stops[0].lng]
  const polylineCoords: [number, number][] = stops.map((s) => [s.lat, s.lng])

  const startIndex = fromId ? stops.findIndex((s) => s.id === fromId) : 0
  const effectiveStartIndex = startIndex !== -1 ? startIndex : 0

  const endIndex = toId
    ? stops.map((s) => s.id).lastIndexOf(toId)
    : stops.length - 1
  const effectiveEndIndex = endIndex !== -1 ? endIndex : stops.length - 1

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full rounded-3xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater stops={stops} />

      <Polyline
        positions={polylineCoords}
        color="#1f6fe5"
        weight={5}
        opacity={0.85}
        lineCap="round"
        lineJoin="round"
      />

      {stops.map((stop, idx) => {
        let type: "start" | "end" | "intermediate" = "intermediate"
        let label = ""

        if (idx === effectiveStartIndex) {
          type = "start"
          label = "A"
        } else if (idx === effectiveEndIndex) {
          type = "end"
          label = "B"
        }

        const icon = createCustomIcon(type, label)

        return (
          <Marker key={`${stop.id}-${idx}`} position={[stop.lat, stop.lng]} icon={icon}>
            <Popup className="custom-popup">
              <div className="p-1">
                <div className="font-bold text-sm text-[#10233f]">{stop.name}</div>
                {stop.area && stop.area !== stop.name && (
                  <div className="text-xs text-slate-500 mt-0.5">Area: {stop.area}</div>
                )}
                {stop.landmark && (
                  <div className="text-[11px] text-slate-400 mt-0.5">{stop.landmark}</div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
