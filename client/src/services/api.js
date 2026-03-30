const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getDishes(categoryId) {
  const url = categoryId ? `${API}/api/dishes?category=${categoryId}` : `${API}/api/dishes`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load dishes');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API}/api/categories`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}