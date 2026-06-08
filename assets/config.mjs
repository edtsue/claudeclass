// config.mjs — client-side configuration.
// Reads come straight from Supabase using the PUBLISHABLE key (safe to ship —
// Row Level Security allows public read only). Writes never use this key; they go
// through /api/save, which is gated by EDIT_PASSWORD and uses the secret key
// server-side. Leave url empty to fall back to seeded content + local edits.
export const SUPABASE = {
  url: 'https://cgrspyalvjceiecdkojx.supabase.co',
  anonKey: 'sb_publishable_4T75izfr2r3yyJwNIQXXdA_4TbKKlmM',
};
