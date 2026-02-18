"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Bookmark {
    id: string;
    title: string;
    url: string;
    created_at: string;
    user_id: string;
}

interface BookmarkListProps {
    userId: string;
    initialBookmarks: Bookmark[];
}

export default function BookmarkList({
    userId,
    initialBookmarks,
}: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const supabase = createClient();

    // Subscribe to realtime changes
    useEffect(() => {
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newBookmark = payload.new as Bookmark;
                    setBookmarks((prev) => {
                        // Avoid duplicates
                        if (prev.some((b) => b.id === newBookmark.id)) return prev;
                        return [newBookmark, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const deletedId = (payload.old as { id: string }).id;
                    setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            console.error("Failed to delete bookmark:", error.message);
        }
        setDeletingId(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return url;
        }
    };

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-4">
                    <svg
                        className="w-8 h-8 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                    </svg>
                </div>
                <h3 className="text-slate-400 font-medium mb-1">No bookmarks yet</h3>
                <p className="text-slate-600 text-sm">
                    Add your first bookmark using the form above.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
            </p>
            {bookmarks.map((bookmark) => (
                <div
                    key={bookmark.id}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-xl px-4 py-3.5 transition-all duration-200"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-medium text-sm hover:text-indigo-400 transition-colors line-clamp-1"
                            >
                                {bookmark.title}
                            </a>
                            <div className="flex items-center gap-2 mt-1.5">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=16`}
                                    alt=""
                                    className="w-3.5 h-3.5 rounded-sm opacity-60"
                                />
                                <span className="text-slate-500 text-xs truncate">
                                    {getDomain(bookmark.url)}
                                </span>
                                <span className="text-slate-700 text-xs">·</span>
                                <span className="text-slate-600 text-xs">
                                    {formatDate(bookmark.created_at)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(bookmark.id)}
                            disabled={deletingId === bookmark.id}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 cursor-pointer disabled:opacity-50"
                            title="Delete bookmark"
                        >
                            {deletingId === bookmark.id ? (
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
