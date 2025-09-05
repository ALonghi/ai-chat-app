"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import type { User } from "../../types/user";

const STORAGE_KEY = "demo_users";

const seed: User[] = [
    { id: "u_1", name: "Ada Lovelace", email: "ada@example.com", password: "pass1234" },
    { id: "u_2", name: "Alan Turing", email: "alan@example.com", password: "hunter2" },
];

function loadUsers(): User[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return seed;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : seed;
    } catch {
        return seed;
    }
}

function saveUsers(list: User[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { }
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<User>>({});

    useEffect(() => {
        setUsers(loadUsers());
    }, []);

    useEffect(() => {
        saveUsers(users);
    }, [users]);

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
        );
    }, [users, filter]);

    function startAdd() {
        setEditingId("NEW");
        setDraft({ name: "", email: "", password: "" });
    }

    function startEdit(u: User) {
        setEditingId(u.id);
        setDraft({ ...u });
    }

    function cancelEdit() {
        setEditingId(null);
        setDraft({});
    }

    function updateDraft<K extends keyof User>(k: K, v: User[K]) {
        setDraft(prev => ({ ...prev, [k]: v }));
    }

    function save() {
        const name = (draft.name ?? "").trim();
        const email = (draft.email ?? "").trim();
        const password = (draft.password ?? "").trim();

        // tiny validations
        if (!name) return alert("Name required");
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return alert("Valid email required");
        if (!password) return alert("Password required (demo only)");

        if (editingId === "NEW") {
            const id = `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
            setUsers(prev => [...prev, { id, name, email, password }]);
        } else {
            setUsers(prev => prev.map(u => (u.id === editingId ? { ...u, name, email, password } : u)));
        }
        cancelEdit();
    }

    function remove(id: string) {
        if (!confirm("Delete this user?")) return;
        setUsers(prev => prev.filter(u => u.id !== id));
    }

    return (
        <div className="bg">
            <main className="mx-auto grid h-dvh w-full max-w-[920px] grid-rows-[auto_1fr_auto] gap-4 px-4 pt-8">
                <Header />

                <section className="glass grid grid-rows-[auto_1fr] overflow-hidden rounded-3xl">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/20 bg-white/5 p-3">
                        <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search users…"
                            className="min-w-[220px] flex-1 rounded-xl border border-white/25 bg-white/10 px-3 py-2 outline-none"
                        />
                        <button
                            onClick={startAdd}
                            className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm transition hover:-translate-y-px"
                        >
                            + Add user
                        </button>
                    </div>

                    {/* Table */}
                    <div className="min-h-0 overflow-auto p-3">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead className="text-left text-xs uppercase tracking-wider opacity-70">
                                <tr>
                                    <th className="px-3 py-2">Name</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Password (demo)</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* New / Edit row */}
                                {editingId && (
                                    <tr className="bubble">
                                        <td className="px-3 py-3">
                                            <input
                                                value={draft.name ?? ""}
                                                onChange={(e) => updateDraft("name", e.target.value)}
                                                placeholder="Full name"
                                                className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none"
                                                autoFocus
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                value={draft.email ?? ""}
                                                onChange={(e) => updateDraft("email", e.target.value)}
                                                placeholder="email@example.com"
                                                className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                value={draft.password ?? ""}
                                                onChange={(e) => updateDraft("password", e.target.value)}
                                                placeholder="password (demo)"
                                                className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none"
                                                type="text" /* mask later when auth is real */
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={save}
                                                    className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Data rows */}
                                {filtered.map((u) => (
                                    <tr key={u.id} className="bubble">
                                        <td className="px-3 py-3">{u.name}</td>
                                        <td className="px-3 py-3">{u.email}</td>
                                        <td className="px-3 py-3">
                                            <span className="text-slate-200/90">••••••••</span>
                                            <span className="ms-2 opacity-60 text-xs">(stored plaintext for demo)</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(u)}
                                                    className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => remove(u.id)}
                                                    className="rounded-full border border-red-400/40 bg-red-400/20 px-3 py-2 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && !editingId && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-10 text-center opacity-70">
                                            No users yet. Click <strong>+ Add user</strong> to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="pb-6 text-center text-xs opacity-70">
                    Users are stored in <code>localStorage</code> for demo only. Replace with a DB + hashed passwords later.
                </footer>
            </main>
        </div>
    );
}
