"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface NavbarProps {
    user: User;
}

export default function Navbar({ user }: NavbarProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">
                        Smart Bookmark
                    </span>
                </div>

                {/* User info & Sign out */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        {user.user_metadata?.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="avatar"
                                className="w-7 h-7 rounded-full ring-2 ring-white/10"
                            />
                        )}
                        <span className="text-slate-400 text-sm truncate max-w-[160px]">
                            {user.user_metadata?.full_name || user.email}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
}
