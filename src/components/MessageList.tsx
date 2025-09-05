"use client";
import { MutableRefObject } from "react";
import ChatBubble from "./ChatBubble";
import CopyButton from "./CopyButton";
import { Message } from "../types/message";

export default function MessageList({
    messages,
    loading,
    listEndRef,
    typingBubbleIndex,
}: {
    messages: Message[];
    loading: boolean;
    listEndRef: MutableRefObject<HTMLDivElement | null>;
    typingBubbleIndex?: number | null;
}) {
    const visible = messages.filter((m) => m.role !== "system");

    return (
        <div className="flow">
            {visible.map((m, i) => {
                const isLast = i === visible.length - 1;
                const isTyping =
                    (typeof typingBubbleIndex === "number" ? typingBubbleIndex === i : false) ||
                    (loading && isLast && m.role === "assistant" && m.content === "");

                return (
                    <div key={i} className={`msg-row ${m.role === "user" ? "user" : "assistant"}`}>
                        <div className="msg-wrap" tabIndex={-1}>
                            <ChatBubble msg={isTyping ? { ...m, content: "" } : m} typing={isTyping} />
                            <div className="msg-bottom"><CopyButton text={isTyping ? "" : m.content} className="below" /></div>
                        </div>
                    </div>
                );
            })}
            <div ref={listEndRef} />
        </div>
    );
}
