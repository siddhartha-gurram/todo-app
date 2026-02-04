# Todo List App

A full-stack todo app with a **React** frontend and **Node.js/Express** API. Tasks are stored in `tasks.json`.

## Features

- **Add, edit, delete** tasks
- **Mark complete/incomplete** with a checkbox
- **Filter** by All, Active, or Completed
- **Priority** (Low, Medium, High) when adding or editing
- **Due date** – optional date per task; overdue tasks are highlighted in red
- **Clear completed** – remove all completed tasks at once
- Responsive UI

## Tech Stack

| Layer      | Tech              |
|-----------|-------------------|
| Frontend  | React (Vite)      |
| Backend   | Node.js, Express  |
| Storage  | tasks.json (file) |

## Setup

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

## How to Run

Use **two terminals**.

**Terminal 1 – Backend**
```bash
npm start
```
Runs the API at http://localhost:3000 (or the next free port if 3000 is in use).

**Terminal 2 – Frontend**
```bash
cd client
npm run dev
```
Opens the app at http://localhost:5173.

## API Endpoints

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | /tasks                 | Get all tasks (?filter=active\|completed) |
| GET    | /tasks/:id             | Get one task             |
| POST   | /tasks                 | Add task (body: `{ "task": "text", "priority": "...", "dueDate": "YYYY-MM-DD" }`) |
| PUT    | /tasks/:id             | Update task              |
| PATCH  | /tasks/:id/toggle      | Toggle completed         |
| DELETE | /tasks/:id             | Delete one task         |
| DELETE | /tasks/completed       | Delete all completed    |
| DELETE | /tasks                 | Delete all tasks        |

## Project Structure

```
todo-app-main/
├── index.js          # Express API
├── package.json
├── tasks.json        # Task storage
├── README.md
└── client/           # React app
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```
