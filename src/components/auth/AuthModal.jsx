// We no longer need this modal since we use Supabase Google OAuth which redirects
// But keeping it as an empty component to satisfy the import in App.jsx for now,
// or we can remove it from App.jsx. I will just make it return null for now.
export default function AuthModal() {
  return null;
}
