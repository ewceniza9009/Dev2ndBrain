# 🧠✨ Dev2ndBrain

**The second brain every developer deserves.**  
Organize notes 📝, code snippets 💻, and flashcards 📚 — all in one elegant workspace.

![MIT License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![ASP.NET](https://img.shields.io/badge/ASP.NET-512BD4?style=flat&logo=.net&logoColor=white)

</div>

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 📝 **Note Management** | Markdown notes with bi-directional linking & live graph. |
| 💻 **Code Snippets** | Syntax-highlighted snippets, synced with **GitHub Gists**. |
| 📚 **Flashcards** | Spaced-repetition decks powered by **SM-2**. |
| 🔍 **Full-text Search** | Lightning-fast search across everything via **MiniSearch**. |
| 🌐 **Graph View** | Interactive D3.js graph of your knowledge base. |
| 🌙 **Theme Toggle** | Dark / light mode in one click. |
| 🔐 **GitHub Auth** | Login with GitHub, sync & import Gists instantly. |
| 💾 **Local-First** | Persistent storage via **IndexedDB (Dexie.js)**. |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) ![Monaco](https://img.shields.io/badge/-Monaco-007ACC?logo=microsoft&logoColor=white) ![D3](https://img.shields.io/badge/-D3.js-F9A03C?logo=d3&logoColor=white) ![Zustand](https://img.shields.io/badge/-Zustand-20232A?logo=react&logoColor=white) ![Dexie](https://img.shields.io/badge/-Dexie.js-2F2F2F?logo=indexeddb&logoColor=white) ![MiniSearch](https://img.shields.io/badge/-MiniSearch-64B5F6?logo=javascript&logoColor=white)

### Backend
![ASP.NET Core](https://img.shields.io/badge/-ASP.NET%20Core-512BD4?logo=.net&logoColor=white) ![Octokit](https://img.shields.io/badge/-Octokit-181717?logo=github&logoColor=white) ![HttpClient](https://img.shields.io/badge/-HttpClient-0078D4?logo=microsoft&logoColor=white)

---

## 📂 Project Structure

```
Dev2ndBrain/
├── backend/                 # ASP.NET Core API
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── Program.cs
├── frontend/                # React (Vite) SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **.NET SDK** ≥ 8.0
- A GitHub OAuth App ([create here](https://github.com/settings/developers))  
  Set **Authorization callback URL** to `http://localhost:5173/oauth/callback`

### 1. Backend

```bash
cd backend
```

Create `appsettings.json`

```json
{
  "FrontendOrigin": "http://localhost:5173",
  "GitHub": {
    "ClientId": "your-github-client-id",
    "ClientSecret": "your-github-client-secret"
  }
}
```

```bash
dotnet restore
dotnet run                  # https://localhost:7150
```

### 2. Frontend

```bash
cd ../frontend
```

Create `.env.local`

```bash
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

```bash
npm install
npm run dev                 # http://localhost:5173
```

Visit [http://localhost:5173](http://localhost:5173) and log in with GitHub! 🎉

---

## 📝 Usage

| Page | What to do |
|------|------------|
| 🏠 **Dashboard**    | See recent notes, flashcard stats & quick actions. |
| 📝 **Notes**        | Write Markdown, link notes, view graph. |
| 💻 **Snippets**     | Save, tag, and sync code with GitHub Gists. |
| 📚 **Flashcards**   | Create decks → review using the SM-2 algorithm. |
| 🔍 **Search**       | `Ctrl+K` to open the global search bar. |
| ⚙️ **Settings**     | Log out or revoke GitHub access. |

---

## 🛠️ Development Tips

| Task | Command |
|------|---------|
| **Frontend lint** | `npm run lint` |
| **Frontend build** | `npm run build` |
| **Add new type** | `frontend/src/types/index.ts` |
| **Extend SM-2** | `useFlashcardStore.ts` |
| **New endpoint** | Add controller in `backend/Controllers/` |

---

## ⚠️ Known Limitations
- **Crypto key** is hard-coded in `cryptoService.ts` → replace with secure key management in production.  
- **CORS** is configured for `localhost:5173` only → update `appsettings.json` for other origins.  
- **Graph performance** may degrade with 1000+ notes → consider virtualization.

---

## 🤝 Contributing

1. Fork the repo 🍴  
2. Create your feature branch: `git checkout -b feature/AmazingFeature`  
3. Commit: `git commit -m 'Add AmazingFeature'`  
4. Push: `git push origin feature/AmazingFeature`  
5. Open a Pull Request 📬  

---

## 📜 License
Distributed By: Erwin Wilson Ceniza
