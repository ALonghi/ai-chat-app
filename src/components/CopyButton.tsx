"use client";

import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function CopyButton({
    text,
    className,
}: {
    text: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function doCopy() {
        if (!text) return;

        // Markdown -> HTML, then sanitize for safety
        const rawHtml = marked.parse(text, { async: false }) as string;
        const html = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        const plain = text;

        // Modern Clipboard API: write HTML + plain text together
        if (navigator.clipboard && (window as any).ClipboardItem) {
            try {
                const blobHtml = new Blob([html], { type: "text/html" });
                const blobPlain = new Blob([plain], { type: "text/plain" });
                // @ts-ignore: ClipboardItem type nuances across browsers
                const item = new (window as any).ClipboardItem({
                    "text/html": blobHtml,
                    "text/plain": blobPlain,
                });
                await navigator.clipboard.write([item]);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
                return;
            } catch { }
        }

        // Fallback: execCommand on a hidden contentEditable with sanitized HTML
        try {
            const container = document.createElement("div");
            container.contentEditable = "true";
            container.style.position = "fixed";
            container.style.left = "-9999px";
            container.style.top = "0";
            container.innerHTML = html;
            document.body.appendChild(container);

            const range = document.createRange();
            range.selectNodeContents(container);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);

            document.execCommand("copy");

            sel?.removeAllRanges();
            document.body.removeChild(container);

            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // Final fallback: plain text
            try {
                await navigator.clipboard.writeText(plain);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            } catch { }
        }
    }

    return (
        <button
            type="button"
            className={`chip xs below ${className ?? ""}`}
            onClick={doCopy}
            aria-label="Copy message"
            title="Copy message"
        >
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}
