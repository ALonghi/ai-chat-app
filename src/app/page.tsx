"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import MessageList from "@/components/MessageList";
import Composer from "@/components/Composer";
import { Message } from "../types/message";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant. Always format output as Markdown. Use real Markdown headings (#, ##, ###), bold (**), italics (*), lists, and code fences when appropriate.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);


  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    // Pre-create one assistant bubble (empty) that we'll fill while streaming.
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

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Accumulator + RAF batching to reduce React re-renders and avoid duplicates.
      let acc = "";
      let rafPending = false;
      function flushToUI() {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            last.content = acc; // assign the full accumulated content (safe against duplicates)
          }
          return copy;
        });
        rafPending = false;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        // Append whatever the backend sent
        acc += chunk;

        // Batch DOM updates to animation frames
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(flushToUI);
        }
      }

      // final flush (in case RAF didn't run)
      if (rafPending) flushToUI();
    } catch (err) {
      // If the user intentionally aborted, don't show an error message.
      if (ac.signal.aborted) {
        // Instead of removing an empty assistant bubble, mark it as stopped:
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            // <-- Replace the removal with this line:
            last.content = "[stopped]";
          }
          return copy;
        });
        // No error UI needed for an intentional stop.
      } else {
        // Unexpected error — replace the assistant bubble with the error message.
        console.error("Streaming error:", err);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              "Sorry—something went wrong while streaming. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    // user pressed Stop
    abortRef.current?.abort();
    // We don't immediately mutate messages here — the send() catch/finally will clean up.
    setLoading(false);
  }

  return (
    <div className="bg">
      <main className="shell">
        <Header />

        {/* unified panel */}
        <section className="glass panel">
          <div className="chat">     {/* scrolls */}
            <MessageList messages={messages} loading={loading} listEndRef={listEndRef} />
          </div>

          <div className="composer"> {/* sticks at bottom of panel */}
            <Composer
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={send}
              onCancel={cancel}
            />
          </div>
        </section>

        {/* <footer className="footer">
          <span>
            Streaming via OpenAI Chat Completions API (
            <a href="https://platform.openai.com/docs/api-reference/chat">
              docs
            </a>
            ).
          </span>
        </footer> */}
      </main>
    </div>
  );
}
