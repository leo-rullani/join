# Join – Task Management System

A lightweight, responsive **Kanban board** for team and individual work.  
Goal: **Organize tasks, manage contacts, and visualize workflows** – with a clean, modular frontend (HTML/CSS/JS) and a well-structured project architecture.

---

## ✨ Features

- **Kanban Board**
  - Columns: *To Do*, *Doing*, *Waiting for Feedback*, *Done*
  - **Drag & Drop** for tasks (including visual feedback)
  - **Search/Filter** for tasks
  - **Detail popups** for adding/editing/deleting tasks
- **Contact Management**
  - Add, edit, and delete contacts
  - **Assign** contacts to tasks (checkbox system)
- **Login & Registration (Basic)**
  - Registration & login (array-based user simulation)
  - Planned option: Firebase Authentication
- **Mobile Optimization**
  - Fully responsive (Desktop/Tablet/Mobile)
  - Dynamic greeting & progress tracking
- **Legal Pages**
  - *Imprint* and *Privacy Policy* (available/planned)
- **Architecture & Code Quality**
  - Modular structure with separate HTML pages (e.g., contacts, popups)
  - Clean DOM manipulation
  - Consistent classes & buttons (global CSS rules)

---

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Build/Tools:** Not required (optional: npm scripts)
- **Optional Services:** Firebase (Auth/Storage in later phase)
- **Version Control:** Git & GitHub

---

## 🗂️ Project Structure (Example)

```
join/
├─ index.html
├─ /assets
├─ /css
│  ├─ global.css
│  └─ components/*.css
├─ /js
│  ├─ app.js
│  ├─ utils/
│  ├─ components/
│  ├─ models/
│  └─ pages/ (board, contacts, login, register, ...)
├─ /pages
│  ├─ board.html
│  ├─ contacts.html
│  ├─ login.html
│  └─ register.html
├─ /img
├─ /docs
└─ README.md
```

> Adjust the structure to match the actual repository files. I can automatically update this once the code is finalized.

---

## 🚦 Quick Start

### Requirements
- Node.js LTS (recommended)
- Git

### Installation & Run (optional with npm)
```bash
# Clone the repository
git clone git@github.com:leo-rullani/join.git
cd join

# Optional: Install dependencies (if package.json exists)
npm install

# Local dev server (e.g., live-server or Vite; if set up)
npm run dev

# Build (if set up)
npm run build
```

> If **no** build tools are used: open `index.html` directly in your browser or use VS Code “Live Server” for testing.

---


## 🧭 Development Standards

Based on your specifications:

- **DOM Rendering:** HTML is rendered into a `div#xy` via `.innerHTML`.
- **Selectors:** Prefer `getElementById` / `getElementsByClassName`.
- **JS Documentation:** **JSDoc** for all functions  
  - `@param`, `@returns`, `@example`
  - Comments in **English** and **rephrased**
- **Form Handling:** Store in JSON arrays; validate via HTML5 attributes (`required`, `minlength`, `email`, `pattern`)
- **Drag & Drop:** Native API with clear UX
- **Responsive Design:** Mobile-first, clean breakpoints
- **Consistent UI:** Unified buttons/class names, global CSS rules
- **Code Length (Python analogy):** Short, clear functions (when applicable to JS)

---

## 🔐 Security & Privacy

- Do not store sensitive data in the repository (API keys, passwords).
- If Firebase is used: **.env** / **config** should not be committed.
- GDPR compliance: provide Privacy Policy & Imprint.

---

## 🚀 Deployment

Options:
- **GitHub Pages** (static hosting)
- **Netlify** / **Vercel** (preview deployments via Git)

---

## 🤝 Contribution

1. Create an issue or reference an existing one
2. Create a branch: `feat/<short-description>` or `fix/<short-description>`
3. Open a PR with a **clear description** and **screenshots** (if UI)
4. Wait for code review

Recommended commit style:
```
feat: add drag-and-drop to board
fix: correct task sorting when filtering
docs: update README with setup steps
refactor: split board.js into modules
```

---

## Author
Developed by [Leo-Rullani](https://github.com/leo-rullani) / [AbbasEl11](https://https://github.com/AbbasEl11) / [Saiyarr](https://github.com/Saiyarr)


