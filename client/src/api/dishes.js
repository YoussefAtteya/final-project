// import http from './http';

// export const getFeatured = (categoryId) =>
//   http.get('/dishes', { params: { featured: 1, category_id: categoryId } });

// export const getTodaySpecial = () =>
//   http.get('/dishes/today-special'); 

import http from './http';

export const getAllDishes = () => http.get('/dishes');
export const getFeatured = () => http.get('/dishes/featured');
export const getTodaySpecial = () => http.get('/dishes/special');