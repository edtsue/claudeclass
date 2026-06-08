// config.mjs — client-side configuration.
// Supabase is OPTIONAL. Leave url empty to run on seeded content + local edits
// (great for previewing). Fill these in once your Supabase project exists; the
// ANON key is safe to ship publicly because Row Level Security protects writes.
export const SUPABASE = {
  url: '',       // e.g. 'https://xxxx.supabase.co'
  anonKey: '',   // the public anon key
};

// The email allowed to edit content (must match your Supabase login).
export const INSTRUCTOR_EMAIL = '';
