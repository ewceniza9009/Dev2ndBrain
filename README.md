Dev2ndBrain 🧠
Dev2ndBrain is a powerful knowledge management application tailored for developers to organize notes 📝, code snippets 💻, and flashcards 📚 efficiently. It features a robust note-taking system with linking capabilities, a code snippet manager with GitHub Gist integration, and a flashcard system leveraging the SM-2 spaced repetition algorithm for optimized learning.
✨ Features

📝 Note Management: Create, edit, and organize notes with Markdown support. Link notes using [[uuid]] syntax for a graph-based knowledge network.
💻 Code Snippet Management: Store and manage code snippets with syntax highlighting for multiple languages. Sync snippets to GitHub Gists for sharing and backup.
📚 Flashcard System: Create decks and flashcards with a spaced repetition system (SM-2 algorithm) to enhance learning and retention.
🌐 Graph Visualization: Visualize note connections using an interactive graph powered by D3.js.
🔍 Search Functionality: Full-text search across notes and snippets using MiniSearch.
🔗 GitHub Integration: Authenticate with GitHub to sync snippets and import Gists.
🌙 Dark/Light Mode: Toggle between themes for a comfortable user experience.
💾 Local Storage: Uses Dexie.js for indexedDB-based persistent storage of notes, snippets, flashcards, and user data.

🛠️ Tech Stack
Frontend

React ⚛️: UI library for building components.
TypeScript 📜: Type-safe JavaScript for better developer experience.
Vite 🚀: Fast build tool and development server.
Tailwind CSS 🎨: Utility-first CSS framework for styling.
Monaco Editor 📝: Code editor for snippets and Markdown notes.
D3.js 📊: For rendering the note graph visualization.
Zustand 🗃️: State management for notes, snippets, flashcards, and app settings.
Dexie.js 💽: IndexedDB wrapper for local storage.
MiniSearch 🔎: Lightweight full-text search library.
React Router 🛤️: For navigation and routing.

Backend

ASP.NET Core 🔧: REST API for handling GitHub authentication and Gist operations.
Octokit 🐙: GitHub API client for .NET.
HttpClient 🌐: For making HTTP requests to GitHub's OAuth and Gist APIs.

📂 Project Structure
X:\Dev2ndBrain
├── backend
│   ├── Controllers
│   │   ├── GistController.cs
│   │   └── GitHubController.cs
│   ├── Models
│   │   ├── GitHubTokenRequest.cs
│   │   └── GithubUser.cs
│   ├── Services
│   │   └── GithubService.cs
│   ├── backend.csproj
│   ├── backend.sln
│   └── Program.cs
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── auth
│   │   │   │   └── GitHubLoginButton.tsx
│   │   │   ├── common
│   │   │   │   └── SearchBar.tsx
│   │   │   ├── flashcards
│   │   │   │   ├── DeckList.tsx
│   │   │   │   ├── DeckView.tsx
│   │   │   │   └── FlashcardPlayer.tsx
│   │   │   ├── graph
│   │   │   │   └── GraphView.tsx
│   │   │   ├── layout
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── notes
│   │   │   │   ├── LinkModal.tsx
│   │   │   │   ├── NoteDetailView.tsx
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   └── NoteList.tsx
│   │   │   └── snippets
│   │   │       ├── SnippetCard.tsx
│   │   │       ├── SnippetDetail.tsx
│   │   │       └── SnippetList.tsx
│   │   ├── pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── FlashcardsPage.tsx
│   │   │   ├── GraphPage.tsx
│   │   │   ├── NoteDetailPage.tsx
│   │   │   ├── NotesListPage.tsx
│   │   │   ├── OAuthCallbackPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── SnippetsPage.tsx
│   │   ├── services
│   │   │   ├── cryptoService.ts
│   │   │   ├── db.ts
│   │   │   ├── githubService.ts
│   │   │   └── searchService.ts
│   │   ├── stores
│   │   │   ├── useAppStore.ts
│   │   │   ├── useAuthStore.ts
│   │   │   ├── useFlashcardStore.ts
│   │   │   ├── useNoteStore.ts
│   │   │   └── useSnippetStore.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── README.md
│   ├── tailwind.config.ts
│   └── vite.config.ts
└── .gitignore

🚀 Setup Instructions
Prerequisites

Node.js (v18 or later)
.NET SDK (8.0 or later)
GitHub OAuth App 🔑: Create an app on GitHub to get a ClientId and ClientSecret. Set the callback URL to http://localhost:5173/oauth/callback.

Backend Setup

Navigate to the backend directory:cd backend


Create an appsettings.json file with:{
  "FrontendOrigin": "http://localhost:5173",
  "GitHub": {
    "ClientId": "your-github-client-id",
    "ClientSecret": "your-github-client-secret"
  }
}


Restore dependencies and run the backend:dotnet restore
dotnet run

The backend runs on https://localhost:7150.

Frontend Setup

Navigate to the frontend directory:cd frontend


Create a .env.local file with:VITE_GITHUB_CLIENT_ID=your-github-client-id


Install dependencies and start the development server:npm install
npm run dev

The frontend runs on http://localhost:5173.

Running the Application

Start the backend server (dotnet run in the backend directory).
Start the frontend server (npm run dev in the frontend directory).
Open http://localhost:5173 in your browser 🌐.
Log in with GitHub to enable Gist syncing and importing 🔗.

📖 Usage

🏠 Dashboard: View recent notes, flashcard review status, and quick stats.
📝 Notes: Create and link notes, edit with Markdown, and visualize connections in the Graph view.
💻 Snippets: Add code snippets, sync to GitHub Gists, or import existing Gists.
📚 Flashcards: Create decks, add cards, and review using spaced repetition.
🔍 Search: Use the search bar to find notes and snippets by title, content, or tags.
⚙️ Settings: Manage GitHub authentication and log out.

🛠️ Development
Frontend

Linting: Run npm run lint to check for code issues.
Build: Run npm run build for production builds.
Type Checking: TypeScript ensures type safety. Verify no type errors during development.

Backend

Controllers: GitHubController.cs handles OAuth token exchange; GistController.cs manages Gist creation and retrieval.
Services: GitHubService.cs encapsulates GitHub API interactions using Octokit.

Extending the Application

Add new note types or snippet languages in types/index.ts.
Enhance the SM-2 algorithm in useFlashcardStore.ts for custom review logic.
Expand search capabilities in searchService.ts by adding new fields or types.
Add more backend endpoints in Controllers for additional GitHub features.

⚠️ Known Limitations

The crypto key in cryptoService.ts is hardcoded for simplicity. In production, use a secure key management system 🔒.
The backend CORS is configured for localhost:5173. Update appsettings.json for other origins.
The graph view may slow down with a large number of notes due to D3.js rendering 📊.

🤝 Contributing
Contributions are welcome! Please:

Fork the repository 🍴.
Create a feature branch (git checkout -b feature/YourFeature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/YourFeature).
Open a pull request 📬.

📄 License
This project is licensed under the MIT License.
