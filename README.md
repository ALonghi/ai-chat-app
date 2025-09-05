# ✨ Liquid Glass Chat – POC

This project is a **proof of concept** that demonstrates a minimal AI-powered chat experience wrapped in a playful “liquid glass” UI. It is not production-ready.

---

## Features

### 🔒 Basic Access Control

- The **Chat page**.
- A **Users page** is open and allows adding/editing/removing mock users (email + password).
- No real authentication or persistence yet — this is only a demo of flow.

### 💬 Chat Interface

- Chat with an AI assistant that streams responses in real time.
- Responses support **Markdown formatting**: headings, bold/italic, lists, and code blocks.
- A **typing indicator** shows when the AI is still generating.
- Messages have a **copy button** (hidden while the AI is typing) that preserves formatting when pasted into Google Docs.

### 🪟 Liquid Glass UI

- A single glass-styled panel holds chat history and composer.
- Subtle animated gradients and “liquid” blobs in the background.
- Navigation bar is lightweight, non-glass, and highlights the active page.

### 👤 User Management (demo only)

- `/users` page lists demo users with **name, email, password** fields.
- Add, edit, and delete users — stored locally in `localStorage`.
- Passwords are plain text in this POC (not secure).

### 🛠️ Misc

- Header provides navigation between **Chat** and **Users**.
- Users can reset the chat or stop an AI response mid-generation.
- Only the chat area scrolls; headers and nav remain visible.

---

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Setup a `OPENAI_API_KEY` Environment Variable in a `.env` file
3. Run the dev server:

```bash
pnpm run dev
```
