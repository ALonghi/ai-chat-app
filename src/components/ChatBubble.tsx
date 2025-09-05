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
        <div className={`bubble ${isUser ? "user" : "assistant"}`} aria-live="polite">
            <div className="bubble-body">
                <div className="role">{isUser ? "You" : "AI"}</div>

                <div className="content">
                    {typing ? (
                        <span className="dot-cursor" />
                    ) : msg.content === "[stopped]" ? (
                        <span className="stopped">[stopped]</span>
                    ) : (
                        <ReactMarkdown
                            // GitHub-flavored Markdown (bold, italics, tables, strikethrough, task lists)
                            remarkPlugins={[remarkGfm]}
                            // Sanitize any embedded HTML the model might produce
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
