"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href;

    return (
        <header className="sticky top-3 z-10 mx-1 rounded-full bg-white/6 px-3 py-2 backdrop-blur-md ring-1 ring-white/15">
            <div className="flex items-center gap-3">
                <div className="select-none px-1 text-sm font-semibold tracking-tight">
                    ✨ Liquid Chat
                </div>

                <nav className="ms-auto flex items-center gap-1">
                    <Link
                        href="/"
                        className={`rounded-full px-3 py-1.5 text-sm opacity-80 transition hover:opacity-100 ${isActive("/") ? "underline underline-offset-4" : ""
                            }`}
                    >
                        Chat
                    </Link>
                    <Link
                        href="/users"
                        className={`rounded-full px-3 py-1.5 text-sm opacity-80 transition hover:opacity-100 ${isActive("/users") ? "underline underline-offset-4" : ""
                            }`}
                    >
                        Users
                    </Link>
                </nav>
            </div>
        </header>
    );
}
