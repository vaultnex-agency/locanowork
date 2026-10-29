export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"]
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const DEFAULT_STORAGE_BUCKET = "listings"
export const FALLBACK_STORAGE_BUCKET = "listing-images"

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates file type and size on client before upload.
 * Only .jpg, .jpeg, and .png up to 5MB are permitted.
 */
export function validateImageFile(file: { name: string; size: number; type?: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file was selected." }
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty (0 bytes)." }
  }

  // Check extension
  const dotIndex = file.name.lastIndexOf(".")
  if (dotIndex === -1) {
    return {
      valid: false,
      error: "File has no extension. Please select a .jpg, .jpeg, or .png image.",
    }
  }

  const ext = file.name.slice(dotIndex).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file format (${ext}). Only .jpg, .jpeg, and .png images are permitted.`,
    }
  }

  // Check MIME type if present
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type (${file.type}). Only JPEG and PNG images are allowed.`,
    }
  }

  // Check size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`,
    }
  }

  return { valid: true }
}

/**
 * Generates clean, unique storage object path
 */
export function generateStoragePath(
  fileName: string,
  folder: "accommodations" | "messes",
  listingId?: string
): string {
  const baseName = fileName.split(/[/\\]/).pop() || "image.jpg"
  const sanitizedName = baseName
    .replace(/\.{2,}/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase()
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const cleanListingId = (listingId || "new")
    .replace(/\.{2,}/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
  return `${folder}/${cleanListingId}_${timestamp}_${randomSuffix}_${sanitizedName}`
}
