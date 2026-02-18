# Smart Bookmark 🔖

A real-time bookmark manager built with **Next.js** (App Router), **Supabase** (Auth, Database, Realtime), and **Tailwind CSS**.

🔗 **Live URL:** _[Add after deployment]_

## Features

- **Google OAuth** — Sign in with your Google account (no email/password)
- **Add & Delete Bookmarks** — Save any URL with a title, delete when you no longer need it
- **Private Bookmarks** — Each user's bookmarks are private (Row Level Security enforced)
- **Real-time Sync** — Open two tabs, add a bookmark in one, and it appears in the other instantly
- **Modern UI** — Dark theme with glassmorphism, smooth animations, and responsive design

## Tech Stack

| Technology | Usage |
|---|---|
| [Next.js 15](https://nextjs.org/) | App Router, SSR, middleware |
| [Supabase](https://supabase.com/) | Auth (Google OAuth), PostgreSQL database, Realtime subscriptions |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [Vercel](https://vercel.com/) | Deployment |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Cloud OAuth Client ID

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/smart-bookmark.git
cd smart-bookmark
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run this SQL in the SQL Editor to create the bookmarks table:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

3. Enable Realtime for the bookmarks table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

4. Enable Google provider in **Authentication → Providers → Google**

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!
5. **Important:** Add your Vercel URL to:
   - Supabase → Authentication → URL Configuration → Site URL
   - Supabase → Authentication → URL Configuration → Redirect URLs (add `https://your-app.vercel.app/auth/callback`)
   - Google Cloud Console → OAuth Client → Authorized redirect URIs

## Problems Encountered & Solutions

### 1. Supabase Auth Session Not Persisting Across Server/Client

**Problem:** After signing in with Google, the session was available on the client side but server components couldn't see it. This caused the main page to keep redirecting to login.

**Solution:** Used `@supabase/ssr` package with proper cookie-based session handling. Created separate browser (`createBrowserClient`) and server (`createServerClient`) clients. Added Next.js middleware to refresh the auth token on every request, ensuring both server and client components have access to the session.

### 2. Real-time Events Not Firing for Filtered Subscriptions

**Problem:** When subscribing to Supabase Realtime with a `filter` on `user_id`, DELETE events were not being received because Supabase doesn't send the full row data for deletes by default.

**Solution:** Enabled `REPLICA IDENTITY FULL` on the bookmarks table (or used the `old` record in the payload). Also ensured the Realtime publication was enabled with `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks`. The DELETE payload contains the old record's `id` which is sufficient to remove it from the local state.

### 3. Google OAuth Redirect URI Mismatch

**Problem:** After deploying to Vercel, Google OAuth sign-in failed with a "redirect_uri_mismatch" error because Google only knew about `localhost`.

**Solution:** Added the Vercel production URL (`https://your-app.vercel.app/auth/callback`) to both the Google Cloud Console's authorized redirect URIs and Supabase's redirect allow list. Also updated the Supabase Site URL to the Vercel domain.

### 4. Middleware Redirect Loop

**Problem:** The middleware was redirecting all unauthenticated requests to `/login`, including static assets and the auth callback route, creating infinite loops.

**Solution:** Used Next.js middleware `matcher` config to exclude static files, images, and `_next` paths. Also explicitly excluded `/login` and `/auth` paths from the authentication check to prevent redirect loops.

## Project Structure

```
src/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── login/page.tsx           # Google sign-in page
│   ├── page.tsx                 # Main bookmark dashboard
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── AddBookmarkForm.tsx      # Add bookmark form
│   ├── BookmarkList.tsx         # Bookmark list with realtime
│   └── Navbar.tsx               # Navigation bar
├── lib/supabase/
│   ├── client.ts                # Browser Supabase client
│   └── server.ts                # Server Supabase client
└── middleware.ts                # Auth middleware
```

## License

MIT
