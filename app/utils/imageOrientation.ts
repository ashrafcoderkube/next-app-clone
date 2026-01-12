/**
 * Utility to detect and correct EXIF orientation for WebP images
 * Based on EXIF orientation tag values:
 * 1 = Normal (0°)
 * 3 = 180° rotation
 * 6 = 90° clockwise rotation
 * 8 = 90° counter-clockwise rotation
 *
 * NOTE: This requires CORS to be enabled on the image server.
 * If CORS is not enabled, the fetch will fail and default to normal orientation.
 *
 * To enable CORS on your image server, add these headers:
 * - Access-Control-Allow-Origin: *
 * - Access-Control-Allow-Methods: GET
 */

// Cache for orientation data to avoid re-fetching
const orientationCache: Map<string, number> = new Map();

/**
 * Get EXIF orientation from WebP image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<number>} - Orientation value (1-8) or 1 if not found/error
 *
 * Usage in browser console for testing:
 * import { getWebPOrientation } from './utils/imageOrientation';
 * getWebPOrientation('https://assets.jdwebnship.com/products/images/1766469431_X6Iw1I.webp').then(console.log)
 */
export async function getWebPOrientation(imageUrl: string): Promise<number> {
  // Only process .webp images
  if (!imageUrl || !imageUrl.toLowerCase().endsWith(".webp")) {
    return 1; // Default orientation (no rotation)
  }

  // Check cache first
  if (orientationCache.has(imageUrl)) {
    return orientationCache.get(imageUrl)!;
  }

  try {
    // Fetch image as ArrayBuffer
    // Note: This requires CORS to be enabled on the image server
    // If CORS is not enabled, this will fail and default to normal orientation
    let response: Response;
    try {
      // Try with CORS first
      response = await fetch(imageUrl, {
        mode: "cors",
        credentials: "omit", // Don't send credentials
      });
    } catch (fetchError: any) {
      // CORS error - this is the most common issue
      // console.error(`[EXIF] CORS error fetching image: ${imageUrl}`);
      // console.error(
      //   `[EXIF] The image server needs to allow CORS. Add these headers:`
      // );
      // console.error(`[EXIF] Access-Control-Allow-Origin: *`);
      // console.error(`[EXIF] Access-Control-Allow-Methods: GET`);
      console.error(`[EXIF] Error details:`, fetchError);
      orientationCache.set(imageUrl, 1);
      return 1;
    }

    if (!response.ok) {
      // console.warn(
      //   `[EXIF] Failed to fetch image (status ${response.status}): ${imageUrl}`
      // );
      orientationCache.set(imageUrl, 1);
      return 1;
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      console.warn(`[EXIF] Empty array buffer for image: ${imageUrl}`);
      orientationCache.set(imageUrl, 1);
      return 1;
    }
    const dataView = new DataView(arrayBuffer);

    // WebP file structure: RIFF header (4 bytes) + file size (4 bytes) + "WEBP" (4 bytes)
    if (dataView.byteLength < 12) {
      orientationCache.set(imageUrl, 1);
      return 1;
    }

    // Check RIFF header
    const riff = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );

    if (riff !== "RIFF") {
      orientationCache.set(imageUrl, 1);
      return 1;
    }

    // Check WEBP identifier
    const webp = String.fromCharCode(
      dataView.getUint8(8),
      dataView.getUint8(9),
      dataView.getUint8(10),
      dataView.getUint8(11)
    );

    if (webp !== "WEBP") {
      orientationCache.set(imageUrl, 1);
      return 1;
    }

    // Search for EXIF chunk in RIFF structure
    // WebP can have EXIF in different chunk types: 'EXIF', 'exif', or embedded in 'VP8X' extended format
    let offset = 12; // Start after RIFF header
    let orientation = 1; // Default orientation
    let foundExifChunk = false;
    const foundChunks: Array<{ type: string; size: number; offset: number }> =
      [];

    while (offset < dataView.byteLength - 8) {
      // Read chunk type (4 bytes)
      const chunkType = String.fromCharCode(
        dataView.getUint8(offset),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2),
        dataView.getUint8(offset + 3)
      );

      // Read chunk size (4 bytes, little-endian)
      const chunkSize = dataView.getUint32(offset + 4, true);

      // Debug: track chunk
      foundChunks.push({ type: chunkType, size: chunkSize, offset });

      // Check for EXIF chunk (case-insensitive)
      if (chunkType === "EXIF" || chunkType === "exif") {
        foundExifChunk = true;
        // EXIF data starts at offset + 8
        const exifData = new Uint8Array(arrayBuffer, offset + 8, chunkSize);
        orientation = parseEXIFOrientation(exifData);
        break;
      }

      // Move to next chunk (chunk size + 8 bytes for type and size)
      offset += 8 + chunkSize;

      // Align to even boundary (RIFF chunks are word-aligned)
      if (chunkSize % 2 !== 0) {
        offset += 1;
      }
    }

    if (!foundExifChunk) {
      // console.warn(`[EXIF] No EXIF chunk found in image: ${imageUrl}`);
      // console.warn(
      //   `[EXIF] Found chunks:`,
      //   foundChunks.map((c) => c.type).join(", ")
      // );
      // console.warn(`[EXIF] Total chunks found: ${foundChunks.length}`);
    }

    orientationCache.set(imageUrl, orientation);
    return orientation;
  } catch (error: any) {
    // If any error occurs, default to normal orientation
    // console.warn(
    //   `[EXIF] Failed to read EXIF orientation for image: ${imageUrl}`,
    //   error
    // );
    // console.warn(`[EXIF] Error details:`, {
    //   message: error.message,
    //   stack: error.stack,
    //   name: error.name,
    // });
    orientationCache.set(imageUrl, 1);
    return 1;
  }
}

/**
 * Parse EXIF orientation from EXIF data
 * @param {Uint8Array} exifData - EXIF data bytes
 * @returns {number} - Orientation value (1-8)
 */
function parseEXIFOrientation(exifData: Uint8Array): number {
  try {
    // EXIF structure: TIFF header (8 bytes) + IFD entries
    if (exifData.length < 8) {
      console.warn(`[EXIF] EXIF data too short: ${exifData.length} bytes`);
      return 1;
    }

    // Check for EXIF/TIFF header
    // Byte order: "II" (Intel, little-endian) or "MM" (Motorola, big-endian)
    const byteOrder = String.fromCharCode(exifData[0], exifData[1]);
    const isLittleEndian = byteOrder === "II";

    if (byteOrder !== "II" && byteOrder !== "MM") {
      console.warn(
        `[EXIF] Invalid byte order: ${byteOrder} (expected II or MM)`
      );
      return 1;
    }

    // Read TIFF magic number (should be 42)
    const readUint16 = (offset: number): number => {
      if (isLittleEndian) {
        return exifData[offset] | (exifData[offset + 1] << 8);
      } else {
        return (exifData[offset] << 8) | exifData[offset + 1];
      }
    };

    const readUint32 = (offset: number): number => {
      if (isLittleEndian) {
        return (
          exifData[offset] |
          (exifData[offset + 1] << 8) |
          (exifData[offset + 2] << 16) |
          (exifData[offset + 3] << 24)
        );
      } else {
        return (
          (exifData[offset] << 24) |
          (exifData[offset + 1] << 16) |
          (exifData[offset + 2] << 8) |
          exifData[offset + 3]
        );
      }
    };

    const magicNumber = readUint16(2);
    if (magicNumber !== 42) {
      return 1;
    }

    // Read offset to first IFD
    let ifdOffset = readUint32(4);

    // Search through IFD entries for Orientation tag (tag 274 or 0x0112)
    while (ifdOffset > 0 && ifdOffset < exifData.length - 2) {
      // Read number of IFD entries
      const numEntries = readUint16(ifdOffset);

      if (numEntries === 0 || numEntries > 100) {
        break; // Sanity check
      }

      // Search through IFD entries
      for (let i = 0; i < numEntries; i++) {
        const entryOffset = ifdOffset + 2 + i * 12;

        if (entryOffset + 12 > exifData.length) {
          break;
        }

        // Read tag number
        const tag = readUint16(entryOffset);

        // Orientation tag is 274 (0x0112)
        if (tag === 274) {
          // Read value type (should be 3 = SHORT)
          const type = readUint16(entryOffset + 2);

          if (type === 3) {
            // Read count (should be 1)
            const count = readUint32(entryOffset + 4);

            if (count === 1) {
              // Read orientation value (stored in value field for SHORT type)
              const orientation = readUint16(entryOffset + 8);

              // Valid orientation values are 1-8
              if (orientation >= 1 && orientation <= 8) {
                return orientation;
              } else {
                console.warn(
                  `[EXIF] Invalid orientation value: ${orientation} (expected 1-8)`
                );
              }
            }
          } else {
            console.warn(
              `[EXIF] Orientation tag has wrong type: ${type} (expected 3)`
            );
          }
          break;
        }
      }

      // Read offset to next IFD (if any)
      const nextIfdOffset = readUint32(ifdOffset + 2 + numEntries * 12);
      ifdOffset =
        nextIfdOffset > 0 && nextIfdOffset < exifData.length
          ? nextIfdOffset
          : 0;
    }

    return 1; // Default if not found
  } catch (error) {
    console.warn("Error parsing EXIF orientation:", error);
    return 1;
  }
}

/**
 * Convert EXIF orientation to CSS transform rotation
 * @param {number} orientation - EXIF orientation value (1-8)
 * @returns {number} - Rotation angle in degrees
 */
export function getRotationFromOrientation(orientation: number): number {
  switch (orientation) {
    case 1: // Normal (no rotation)
      return 0;
    case 3: // 180° rotation
      return 180;
    case 6: // 90° clockwise
      return 90;
    case 8: // 90° counter-clockwise
      return -90;
    default:
      return 0;
  }
}

/**
 * Get CSS transform string for EXIF orientation
 * @param {number} orientation - EXIF orientation value (1-8)
 * @returns {string} - CSS transform string
 */
export function getTransformFromOrientation(orientation: number): string {
  const rotation = getRotationFromOrientation(orientation);

  // For orientations that require flipping, we need more complex transforms
  // But for now, we'll focus on rotation only (most common case)
  switch (orientation) {
    case 2: // Horizontal flip
      return "scaleX(-1)";
    case 4: // Vertical flip
      return "scaleY(-1)";
    case 5: // 90° clockwise + horizontal flip
      return "rotate(90deg) scaleX(-1)";
    case 7: // 90° counter-clockwise + horizontal flip
      return "rotate(-90deg) scaleX(-1)";
    default:
      return rotation !== 0 ? `rotate(${rotation}deg)` : "none";
  }
}

// Export for debugging in browser console (development only)
declare global {
  interface Window {
    __testWebPOrientation?: typeof getWebPOrientation;
    __getRotationFromOrientation?: typeof getRotationFromOrientation;
  }
}

// import.meta.env.DEV is Vite style. Use process.env.NODE_ENV check instead.
if (
  typeof window !== "undefined" &&
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development"
) {
  window.__testWebPOrientation = getWebPOrientation;
  window.__getRotationFromOrientation = getRotationFromOrientation;
}
