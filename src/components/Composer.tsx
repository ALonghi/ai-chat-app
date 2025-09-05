"use client";

export default function Composer({
    input,
    setInput,
    loading,
    onSend,
    onCancel,
}: {
    input: string;
    setInput: (v: string) => void;
    loading: boolean;
    onSend: () => void;
    onCancel: () => void;
}) {
    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    return (
        <form
            className="grid grid-cols-[1fr_auto] gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                onSend();
            }}
        >
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask me anything… (Shift+Enter for newline)"
                className="min-h-[72px] max-h-[200px] resize-y rounded-xl border border-white/25 bg-white/10 px-3 py-3 text-ink outline-none"
            />
            <div className="self-end">
                {loading ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm"
                    >
                        Send
                    </button>
                )}
            </div>
        </form>
    );
}
