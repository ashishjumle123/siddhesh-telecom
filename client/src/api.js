// API base URL strategy:
// 1. Locally, VITE_API_URL handles routing to localhost:8080.
// 2. On Vercel (Production), it defaults to empty string meaning requests are relative (e.g., /api/products)
//    which Vercel resolves using the vercel.json rewrite rules.

const envApiUrl = import.meta.env.VITE_API_URL;

const BASE_URL = envApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default BASE_URL;
