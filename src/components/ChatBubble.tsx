"use client";

import React from "react";
import { Message } from "../types/message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export default function ChatBubble({
    msg,
    typing = false,
}: {
    msg: Message;
    typing?: boolean;
}) {
    const isUser = msg.role === "user";

    return (
        <div
            className={[
                "bubble max-w-full rounded-2xl p-4",
                isUser ? "ms-auto" : "me-auto",
            ].join(" ")}
            aria-live="polite"
        >
            <div className="grid gap-2">
                <div className="text-[11px] uppercase tracking-wider opacity-70">
                    {isUser ? "You" : "AI"}
                </div>

                <div className="content leading-relaxed">
                    {typing ? (
                        <div className="flex items-center gap-x-1">
                            <span className="dot-cursor" />
                            <span className="dot-cursor" />
                            <span className="dot-cursor" />
                        </div>
                    ) : msg.content === "[stopped]" ? (
                        <span className="opacity-75 italic text-slate-300">[stopped]</span>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                        >
                            {msg.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
}
