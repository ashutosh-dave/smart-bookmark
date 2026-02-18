"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AddBookmarkFormProps {
    userId: string;
}

export default function AddBookmarkForm({ userId }: AddBookmarkFormProps) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        setLoading(true);
        setError(null);

        // Basic URL validation - prepend https if no protocol
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = "https://" + finalUrl;
        }

        const { error: insertError } = await supabase.from("bookmarks").insert({
            title: title.trim(),
            url: finalUrl,
            user_id: userId,
        });

        if (insertError) {
            setError(insertError.message);
        } else {
            setTitle("");
            setUrl("");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Bookmark title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm whitespace-nowrap"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
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
                            Adding...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Bookmark
                        </span>
                    )}
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                    {error}
                </p>
            )}
        </form>
    );
}
