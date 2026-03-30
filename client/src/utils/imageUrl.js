const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export function getImageUrl(imagePath) {
  if (!imagePath) return "/logo.jpg";

  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE}${imagePath}`;
  }

  return `${API_BASE}/uploads/${imagePath}`;
}