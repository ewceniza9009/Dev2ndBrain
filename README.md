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
| 🌐 **Knowledge Graph** | Explore a dynamic react-flow graph with **hierarchical tag filters**. |
| ✂️ **Web Clipper** | Instantly clip text from any webpage into a new note via browser extension. |
| 💾 **Local-First Storage** | All data is stored on-device using **IndexedDB**, enabling offline use and privacy. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS · Monaco Editor · Zustand · react-flow · Dexie.js |
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

### Video Demo



https://github.com/user-attachments/assets/a7b5bd69-8b47-4cf3-8c9f-51c893af2fab

---

# Dev2ndBrain(Electron Installer) - Guide
## Table of Contents

- [1. Installation & Setup](#1-installation--setup)
- [2. Quick Tour (Sample Data)](#2-quick-tour-sample-data)
- [3. The Dev2ndBrain Interface](#3-the-dev2ndbrain-interface)
- [4. A Deep Dive into Each Page](#4-a-deep-dive-into-each-page)
  - [Dashboard](#dashboard)
  - [Notes](#notes)
  - [Snippets](#snippets)
  - [Projects](#projects)
  - [Flashcards](#flashcards)
  - [Graph View](#graph-view)
  - [Settings](#settings)
- [5. Web Clipper Extension](#5-web-clipper-extension)

## 1. Installation & Setup

Download the latest release from the project's GitHub page and run the installer.

### Critical First Step: Configuring `appsettings.json`
To enable GitHub integration (for Gist syncing and cloud backups), you must perform this one-time setup.

1.  **Locate the Backend Folder:** Navigate to the following folder on your computer, replacing `[User]` with your Windows username.
    * `C:\Users\[User]\AppData\Local\Programs\dev2ndbrain\resources\backend`

2.  **Create a GitHub OAuth App:**
    * Log in to GitHub and go to **Settings > Developer settings > OAuth Apps > New OAuth App**.
    * Use the following configuration:
        * **Application name:** `Dev2ndBrain Local`
        * **Homepage URL:** `http://localhost:5174`
        * **Authorization callback URL:** `http://localhost:5174/oauth/callback`

3.  **Generate a Client Secret** and copy both the **Client ID** and the new **Client Secret**.

4.  **Edit `appsettings.json`:** Open the `appsettings.json` file from the backend folder and replace its contents with the template below, pasting in your credentials.

    ```json
    {
      "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
      "AllowedHosts": "*",
      "ConnectionStrings": { "DefaultConnection": "Data Source=dev2ndbrain.db" },
      "GitHub": {
        "ClientId": "PASTE_YOUR_CLIENT_ID_HERE",
        "ClientSecret": "PASTE_YOUR_CLIENT_SECRET_HERE"
      },
      "FrontendOrigin": "http://localhost:5174",
      "Gemini": { "ApiKey": "YOUR_GOOGLE_AI_STUDIO_API_KEY_HERE" }
    }
    ```

5.  Save the file and restart the Dev2ndBrain application.

## 2. Quick Tour (Sample Data)
Want to see how the app works without creating content from scratch? The installer includes a sample data file that will populate the application with pre-made notes, projects, snippets, and flashcards.

### How to Import the Sample Data:
1.  Go to the **Settings** page.
2.  Find the **Database Management** section and click **Import Data**.
3.  Navigate to the application's installation directory (usually `C:\Users\[User]\AppData\Local\Programs\dev2ndbrain`) and select the file named `dev2ndbrain_db_local.json`.
4.  Confirm the overwrite warning. The app will reload with the sample data.

### 3. The Dev2ndBrain Interface
* **Sidebar:** Your main navigation on the left to access all major pages.
* **Header:** Contains the global search bar and GitHub login status.
* **Command Palette:** Your power tool. Press `Ctrl+K` to open a search bar that can find anything and create new items on the fly.
* **Tab Bar:** Switch between main pages and any items you've opened in a new tab.

### 4. A Deep Dive into Each Page

#### Dashboard
Your mission control, featuring widgets for:
* **Flashcard Summary:** Cards currently due for review.
* **Recent Items:** Quick links to your most recently edited notes and projects.
* **Quick Actions:** Buttons to instantly create a new Note, Snippet, or Deck.

#### Notes
The core of your knowledge base.
* **Mastering Markdown:** The editor includes a toolbar for easy formatting. You can use standard Markdown for headings (`#`), lists (`-`), emphasis (`**bold**`), and more.
    * **To Add Images:** Use the standard syntax `![alt text](https://url.to/image.png)`. For size control, use an HTML `<img>` tag: `<img src="..." width="300">`.
* **Linking Notes:** Create a link to another note by typing `[[` and selecting a note. This is the foundation of the Graph View.
* **Note AI Assistant:** Click "Ask AI" to summarize text, find action items, or explain complex concepts in simpler terms.

#### Snippets
A searchable library for your code.
* **Running Code:** Test `React`, `HTML`, `JavaScript`, and `C#` snippets in a sandboxed environment directly from the app.
* **Snippet AI Assistant:** Ask the AI to explain what a snippet does, suggest refactoring improvements, or answer custom questions about the code.
* **Gist Sync:** Sync snippets to private GitHub Gists for cloud access.

#### Projects
A dedicated workspace to manage your projects from start to finish.
* **Overview Tab:** A showcase of the project's title, Markdown-enabled description, and prominent cards for the **Current Goal** and **Next Step**.
* **Features Tab:** A searchable list to track all work items (features, bugs, etc.) with their status and description.
* **Resources Tab:** A searchable table of linked materials. Notes and Snippets are **clickable links** that open in a new app tab.
* **History Tab:** A complete, time-stamped audit trail with powerful search and filtering capabilities.

#### Flashcards
Memorize anything using a powerful Spaced Repetition System (SRS).
* Create decks and cards manually or generate them automatically from your notes.
* During review, rate your confidence, and the app's algorithm will schedule the card's next appearance for optimal learning.
* Use the **AI Review** after a session to get feedback on your performance and improve your understanding.

#### Graph View
Visualize the connections between your notes.
* Use the tag tree to filter the graph and focus on specific areas of knowledge.
* Use the **Annotation Layer** to add shapes, text, and arrows, turning your graph into an infinite mind-mapping canvas.

#### Settings
* **Note Templates:** Create templates for frequently used note structures.
* **Database Management (Backup & Restore):**
    * **Export Data:** Creates a full backup of your database as a single JSON file. Store this file in a safe place.
    * **Import Data:** Restores your application from a backup file.
        > **⚠️ Warning:** This is a destructive action. Importing a file will **completely erase all current data** in the application and replace it with the contents of the backup file. Please confirm the dialog box prompt before proceeding.


### 5. Web Clipper Extension
The Dev2ndBrain Chrome extension allows you to clip content from any webpage. Simply select text, right-click, and choose "Save to Dev2ndBrain" to automatically create a new, pre-formatted note.

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
