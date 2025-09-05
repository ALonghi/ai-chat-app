export default function Header() {
    return (
        <div className="header">
            <div className="logo">✨ Liquid Glass AI Chat</div>
            <div className="spacer" />
            <button className="pill" onClick={() => location.reload()}>
                Reset
            </button>
        </div>
    );
}
