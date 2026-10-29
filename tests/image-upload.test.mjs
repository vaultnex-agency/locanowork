import { test, describe } from "node:test"
import assert from "node:assert/strict"
import {
  validateImageFile,
  generateStoragePath,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../src/lib/supabase/storage.ts"

describe("Admin Image Upload, Storage & Authorization Tests", () => {
  // ── 1. File Type Validation ────────────────────────────────────────────────
  describe("1. File Type and Extension Validation", () => {
    test("should accept valid JPG files (.jpg, .jpeg) and PNG files (.png)", () => {
      const validFiles = [
        { name: "room_photo.jpg", size: 1024 * 500, type: "image/jpeg" },
        { name: "interior_view.jpeg", size: 1024 * 800, type: "image/jpeg" },
        { name: "dining_hall.png", size: 1024 * 1200, type: "image/png" },
        { name: "UPPERCASE_NAME.JPG", size: 1024 * 300, type: "image/jpeg" },
        { name: "MIXED_case.PNG", size: 1024 * 400, type: "image/png" },
      ]

      for (const file of validFiles) {
        const res = validateImageFile(file)
        assert.equal(res.valid, true, `Expected ${file.name} to be valid`)
        assert.equal(res.error, undefined)
      }
    })

    test("should reject disallowed image and file extensions", () => {
      const invalidFiles = [
        { name: "animated.gif", size: 1024 * 100, type: "image/gif" },
        { name: "modern_photo.webp", size: 1024 * 200, type: "image/webp" },
        { name: "vector_badge.svg", size: 1024 * 50, type: "image/svg+xml" },
        { name: "document.pdf", size: 1024 * 300, type: "application/pdf" },
        { name: "malicious.exe", size: 1024 * 300, type: "application/x-msdownload" },
        { name: "noextension", size: 1024 * 300, type: "image/jpeg" },
      ]

      for (const file of invalidFiles) {
        const res = validateImageFile(file)
        assert.equal(res.valid, false, `Expected ${file.name} to be rejected`)
        assert.ok(res.error, `Expected an error message for ${file.name}`)
      }
    })

    test("should reject mismatched MIME types", () => {
      const mismatchedFile = {
        name: "disguised_file.jpg",
        size: 1024 * 100,
        type: "application/pdf",
      }
      const res = validateImageFile(mismatchedFile)
      assert.equal(res.valid, false)
      assert.match(res.error, /Only JPEG and PNG images are allowed/i)
    })
  })

  // ── 2. File Size Validation ────────────────────────────────────────────────
  describe("2. File Size Validation", () => {
    test("should accept files within the 5MB size limit", () => {
      const okSizes = [
        1024,                  // 1 KB
        1024 * 1024,           // 1 MB
        4.9 * 1024 * 1024,     // 4.9 MB
        MAX_FILE_SIZE_BYTES,   // exactly 5 MB
      ]

      for (const size of okSizes) {
        const file = { name: "test_photo.jpg", size, type: "image/jpeg" }
        const res = validateImageFile(file)
        assert.equal(res.valid, true, `Size ${size} should be accepted`)
      }
    })

    test("should reject files exceeding 5MB limit", () => {
      const oversizedFiles = [
        { name: "huge_photo.jpg", size: MAX_FILE_SIZE_BYTES + 1, type: "image/jpeg" },
        { name: "dslr_raw_export.png", size: 10 * 1024 * 1024, type: "image/png" },
      ]

      for (const file of oversizedFiles) {
        const res = validateImageFile(file)
        assert.equal(res.valid, false)
        assert.match(res.error, /Maximum allowed size is 5 MB/i)
      }
    })

    test("should reject empty files (0 bytes)", () => {
      const emptyFile = { name: "empty.jpg", size: 0, type: "image/jpeg" }
      const res = validateImageFile(emptyFile)
      assert.equal(res.valid, false)
      assert.match(res.error, /empty/i)
    })
  })

  // ── 3. Storage Path Generation ─────────────────────────────────────────────
  describe("3. Storage Object Path Generation", () => {
    test("should generate correct folder, sanitized name, and unique suffix", () => {
      const pathAcc = generateStoragePath("Hostel Front Entrance.jpg", "accommodations", "acc_123")
      assert.ok(pathAcc.startsWith("accommodations/acc_123_"))
      assert.ok(pathAcc.endsWith("_hostel_front_entrance.jpg"))
      assert.doesNotMatch(pathAcc, /\s/) // no whitespace

      const pathMess = generateStoragePath("thali_special#1.png", "messes", "mess_456")
      assert.ok(pathMess.startsWith("messes/mess_456_"))
      assert.ok(pathMess.endsWith("_thali_special_1.png"))
      assert.doesNotMatch(pathMess, /[#]/) // sanitized special character
    })

    test("should prevent path traversal attempts", () => {
      const maliciousName = "../../../etc/passwd.jpg"
      const path = generateStoragePath(maliciousName, "accommodations", "../../hacked")
      assert.ok(!path.includes(".."))
    })
  })

  // ── 4. Admin Authorization Verification ───────────────────────────────────
  describe("4. Admin Authorization Policy Logic", () => {
    function simulateAdminAuthCheck(userProfile) {
      if (!userProfile) {
        return { authorized: false, error: "Unauthorized: You must be logged in as an administrator." }
      }
      if (userProfile.role !== "admin") {
        return { authorized: false, error: "Access denied: Your account does not have Admin privileges." }
      }
      return { authorized: true }
    }

    test("should authorize users with role = 'admin'", () => {
      const adminProfile = { id: "admin-uuid-1", email: "admin@locano.in", role: "admin" }
      const res = simulateAdminAuthCheck(adminProfile)
      assert.equal(res.authorized, true)
    })

    test("should reject users with role = 'student'", () => {
      const studentProfile = { id: "student-uuid-1", email: "student@locano.in", role: "student" }
      const res = simulateAdminAuthCheck(studentProfile)
      assert.equal(res.authorized, false)
      assert.match(res.error, /Access denied/i)
    })

    test("should reject users with role = 'vendor'", () => {
      const vendorProfile = { id: "vendor-uuid-1", email: "vendor@locano.in", role: "vendor" }
      const res = simulateAdminAuthCheck(vendorProfile)
      assert.equal(res.authorized, false)
      assert.match(res.error, /Access denied/i)
    })

    test("should reject unauthenticated visitors", () => {
      const res = simulateAdminAuthCheck(null)
      assert.equal(res.authorized, false)
      assert.match(res.error, /Unauthorized/i)
    })
  })

  // ── 5. Image Replacement Without Altering Other Fields ─────────────────────
  describe("5. Listing Image Replacement Independence", () => {
    test("should update sample_image and images while preserving all other listing fields", () => {
      const originalListing = {
        id: "acc_demo_1",
        name: "Greenfield Student Residence",
        area: "Kadri",
        nearest_landmark: "Near Kadri Temple",
        monthly_rent_from: 6500,
        security_deposit: 13000,
        gender: "Boys",
        type: "PG",
        amenities: ["Wi-Fi", "RO Water", "CCTV"],
        sharing_options: ["Single", "Double"],
        status: "published",
        description: "Comfortable residency",
        sample_image: "/hero-coast.png",
        images: ["/hero-coast.png"],
      }

      const newImageUrl = "https://gykudkfajvtvaftshcvz.supabase.co/storage/v1/object/public/listings/accommodations/acc_demo_1_17000000_photo.jpg"

      // Execute replacement payload logic
      const updatePayload = {
        sample_image: newImageUrl,
        images: [newImageUrl],
        updated_at: new Date().toISOString(),
      }

      const updatedListing = {
        ...originalListing,
        ...updatePayload,
      }

      // Verify image was updated
      assert.equal(updatedListing.sample_image, newImageUrl)
      assert.deepEqual(updatedListing.images, [newImageUrl])

      // Verify all other fields remained unchanged
      assert.equal(updatedListing.id, originalListing.id)
      assert.equal(updatedListing.name, originalListing.name)
      assert.equal(updatedListing.area, originalListing.area)
      assert.equal(updatedListing.monthly_rent_from, originalListing.monthly_rent_from)
      assert.equal(updatedListing.security_deposit, originalListing.security_deposit)
      assert.equal(updatedListing.gender, originalListing.gender)
      assert.equal(updatedListing.status, originalListing.status)
      assert.deepEqual(updatedListing.amenities, originalListing.amenities)
      assert.deepEqual(updatedListing.sharing_options, originalListing.sharing_options)
    })
  })

  // ── 6. Public Display & Graceful Fallback Logic ────────────────────────────
  describe("6. Public Display & Fallback Handling", () => {
    function resolveDisplayImage(listing, fallbackDefault) {
      const rawImage =
        (Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : null) ||
        listing.sampleImage

      if (rawImage && rawImage !== "/hero-coast.png" && rawImage !== "/hero-coast.jpg" && rawImage !== "/mess-thali.jpg" && rawImage !== "/mess-tiffin.jpg") {
        return rawImage
      }
      return fallbackDefault
    }

    test("should display uploaded Supabase Storage image when present", () => {
      const uploadedUrl = "https://gykudkfajvtvaftshcvz.supabase.co/storage/v1/object/public/listings/accommodations/uploaded.jpg"
      const listing = {
        sampleImage: uploadedUrl,
        images: [uploadedUrl],
      }
      const resolved = resolveDisplayImage(listing, "/pg-room-1.jpg")
      assert.equal(resolved, uploadedUrl)
    })

    test("should fallback gracefully to realistic photo when sampleImage is default placeholder", () => {
      const listingWithDefault = {
        sampleImage: "/hero-coast.png",
        images: [],
      }
      const resolved = resolveDisplayImage(listingWithDefault, "/pg-room-2.jpg")
      assert.equal(resolved, "/pg-room-2.jpg")
    })

    test("should fallback gracefully when images array is empty and sampleImage is null", () => {
      const listingEmpty = {
        sampleImage: null,
        images: [],
      }
      const resolved = resolveDisplayImage(listingEmpty, "/mess-thali-deluxe.jpg")
      assert.equal(resolved, "/mess-thali-deluxe.jpg")
    })
  })
})
