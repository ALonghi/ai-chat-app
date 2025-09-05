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
            className="glass composer"
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
            />
            <div className="actions">
                {loading ? (
                    <button type="button" className="pill danger" onClick={onCancel}>
                        Stop
                    </button>
                ) : (
                    <button type="submit" className="pill">
                        Send
                    </button>
                )}
            </div>
        </form>
    );
}
