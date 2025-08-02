# 🧠✨ Dev2ndBrain

**The second brain every developer deserves.**  
Organize notes 📝, code snippets 💻, and flashcards 📚 — all in one elegant, local-first workspace.

---

## 🌟 Features at a Glance

| Feature | Description |
|--------|-------------|
| 📝 **Note Management** | Write in Markdown, use note **templates**, and interlink notes with `[[bi-directional links]]`. |
| 💻 **Code Snippet Manager** | Save syntax-highlighted snippets with **two-way GitHub Gist sync** (push, pull, import). |
| 📚 **Smart Flashcards** | Learn effectively using spaced-repetition via the **SM-2 algorithm**. |
| 🤖 **AI Assistant** | Let **Google Gemini** summarize notes, extract action items, or brainstorm ideas. |
| 🔍 **Command Palette** | Press `Ctrl + K` to quickly navigate, search, and execute actions. |
| 🌐 **Knowledge Graph** | Explore a dynamic D3.js graph with **hierarchical tag filters**. |
| ✂️ **Web Clipper** | Instantly clip text from any webpage into a new note via browser extension. |
| 💾 **Local-First Storage** | All data is stored on-device using **IndexedDB**, enabling offline use and privacy. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS · Monaco Editor · Zustand · D3.js · Dexie.js |
| **Backend** | ASP.NET Core · Entity Framework Core · Octokit.NET · Google Gemini API |
| **Browser Extension** | JavaScript · WebExtensions API |

---

## 🚀 Getting Started

### ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (v8.0+)
- GitHub OAuth App ([Create one](https://github.com/settings/developers))
- Google Gemini API Key ([Get one](https://aistudio.google.com/app/apikey))

---

### 1️⃣ Backend Setup

```bash
cd backend
````
Run the backend:

```bash
dotnet restore
dotnet run
```

➡️ Now available at: `https://localhost:7150`

---

### 2️⃣ Frontend Setup

```bash
cd ../frontend
```

Create a `.env.local` file:

```env
VITE_API_BASE_URL=https://localhost:7150
VITE_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
VITE_REDIRECT_CALLBACK_URL=http://localhost:5173/oauth/callback
VITE_GIST_SCOPE=read:user gist
```

Start the app:

```bash
npm install
npm run dev
```

➡️ Now available at: `http://localhost:5173`

---

### 3️⃣ Browser Extension Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the `extension/` directory in the root of the project

🎉 The extension is ready! You can now clip content and log in with GitHub.

---

## 🤝 Contributing

We welcome your contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to GitHub

   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request 🎉

---

## 📜 License

Distributed By: Erwin Wilson Ceniza

---

## Developed By: Erwin Wilson Ceniza

---

## 🔗 Project Link

[👉 View on GitHub](https://github.com/your-username/Dev2ndBrain)
