"use client";

import ChatBubble from "./ChatBubble";
import CopyButton from "./CopyButton";
import { Message } from "../types/message";

export default function MessageList({
    messages,
    loading,
    typingBubbleIndex,
}: {
    messages: Message[];
    loading: boolean;
    typingBubbleIndex?: number | null;
}) {
    const visible = messages.filter((m) => m.role !== "system");

    return (
        <div className="grid gap-3 p-1">
            {visible.map((m, i) => {
                const isLast = i === visible.length - 1;
                const isTyping =
                    (typeof typingBubbleIndex === "number" ? typingBubbleIndex === i : false) ||
                    (loading && isLast && m.role === "assistant" && m.content === "");

                const showCopy = !(isTyping && m.role === "assistant");

                return (
                    <div key={i} className={`group flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="flex max-w-[86%] flex-col gap-2">
                            <ChatBubble msg={isTyping ? { ...m, content: "" } : m} typing={isTyping} />
                            {showCopy && (
                                <div className="flex w-full justify-end opacity-0 transition group-hover:opacity-100 sm:opacity-100">
                                    <CopyButton text={isTyping ? "" : m.content} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
