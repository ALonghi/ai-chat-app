"use client";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function doCopy() {
        if (!text) return;

        const rawHtml = marked.parse(text, { async: false }) as string;
        const html = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        const plain = text;

        // modern Clipboard API
        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const item = new window.ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([plain], { type: "text/plain" }),
                });
                await navigator.clipboard.write([item]);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
                return;
            } catch (err) {
                console.error("Clipboard API error:", err);
            }
        } else {
            console.error("Clipboard API not supported by this browser");
        }
    }

    return (
        <button
            type="button"
            onClick={doCopy}
            className="chip px-3 py-1 text-[11px] transition hover:-translate-y-px"
            aria-label="Copy message"
            title="Copy message"
        >
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}
