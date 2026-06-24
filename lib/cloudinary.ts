import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Upload image buffer to Cloudinary
export async function uploadImage(
  buffer: Buffer,
  folder: string = "pgsathi/listings"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit", quality: "auto:good" },
            { fetch_format: "webp" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// Generate thumbnail URL
export function getThumbnailUrl(url: string, width = 400, height = 300): string {
  if (!url) return "";
  // Don't try to transform external URLs like Google Maps or Unsplash
  if (!url.includes("cloudinary.com")) return url;

  return cloudinary.url(url, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    fetch_format: "webp",
  });
}
