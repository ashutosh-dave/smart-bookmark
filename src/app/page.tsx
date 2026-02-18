import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookmarkList from "@/components/BookmarkList";
import AddBookmarkForm from "@/components/AddBookmarkForm";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial bookmarks (server-side)
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Your Bookmarks
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Save and organize your favorite links.
          </p>
        </div>

        {/* Add Bookmark Form */}
        <div className="mb-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <AddBookmarkForm userId={user.id} />
        </div>

        {/* Bookmark List */}
        <BookmarkList userId={user.id} initialBookmarks={bookmarks || []} />
      </main>
    </div>
  );
}
