"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import MessageList from "@/components/MessageList";
import Composer from "@/components/Composer";
import { Message } from "@/types/message";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant. Always format output as real Markdown headings (#, ##, ###), bold (**), italics (*), lists, and code fences when appropriate. When not needed the output as non-styled paragraph is perfect.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    // simple “stick to bottom” behavior
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  function cancel() {
    abortRef.current?.abort();
    setLoading(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text } as Message];
    // prepare streaming bubble
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let acc = "";
      let rafPending = false;
      const flush = () => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") last.content = acc; // assign (prevents duplicates)
          return copy;
        });
        rafPending = false;
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        // supports plain text or SSE-ish lines; accumulate to acc
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            try {
              const evt = JSON.parse(payload);
              if (evt?.text) acc += evt.text;
            } catch {
              acc += payload;
            }
          } else {
            acc += line;
            if (lines.length > 1) acc += "\n";
          }
        }

        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(flush);
        }
      }
      if (rafPending) flush();

      // Optional: coerce plain "Heading:" into Markdown headings if none present
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.content && !/^\s*#{1,6}\s+/m.test(last.content)) {
          last.content = last.content
            .replace(/^(?:\s*)Heading:\s*(.+)$/im, (_, t) => `# ${t}`)
            .replace(/^(?:\s*)(Subheading|Subtitle):\s*(.+)$/im, (_, _l, t) => `## ${t}`);
        }
        return copy;
      });
    } catch (err) {
      if (ac.signal.aborted) {
        // show a subtle stopped state if nothing streamed
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && last.content === "") last.content = "[stopped]";
          return copy;
        });
      } else {
        console.error("Streaming error:", err);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Sorry—something went wrong while streaming. Please try again." },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="bg">
      <main className="mx-auto grid h-full w-full max-w-[920px] grid-rows-[auto_1fr_auto] gap-4 px-4 pt-8">
        <Header />

        {/* Unified glass panel (chat + composer) */}
        <section className="glass grid grid-rows-[1fr_auto] overflow-hidden rounded-3xl">
          <div ref={chatRef} className="chat-scroll min-h-0 overflow-y-auto p-4">
            {/* MessageList no longer needs listEndRef */}
            <MessageList messages={messages} loading={loading} />
          </div>


          <div className="border-t border-white/20 bg-white/5 p-3">
            <Composer
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={send}
              onCancel={cancel}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
