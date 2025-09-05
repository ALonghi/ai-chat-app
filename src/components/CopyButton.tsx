"use client";

import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

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
            } catch { }
        }
        // fallback
        try {
            const el = document.createElement("div");
            el.contentEditable = "true";
            el.style.position = "fixed";
            el.style.left = "-9999px";
            el.innerHTML = html;
            document.body.appendChild(el);
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            document.execCommand("copy");
            sel?.removeAllRanges();
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch {
            try {
                await navigator.clipboard.writeText(plain);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            } catch { }
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
