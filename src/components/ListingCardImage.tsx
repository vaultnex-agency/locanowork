"use client"

import React, { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"

export interface ListingCardImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc: string
}

export function ListingCardImage({
  src,
  fallbackSrc,
  alt,
  unoptimized,
  ...props
}: ListingCardImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  const isHttp = typeof currentSrc === "string" && currentSrc.startsWith("http")

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized ?? isHttp}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
