# StudyFlow — Smart Study Planner

A full-stack study planner built with Python, Flask, HTML, CSS, and vanilla JavaScript. Organize study tasks, set deadlines, track completion, and keep your task data between sessions.

## Features

- Dashboard with total, pending, completed, and progress statistics
- Create tasks with a subject, deadline, and priority
- Mark tasks as complete or pending
- Delete tasks
- Search tasks by title or subject
- Filter by all, pending, or completed
- JSON file storage through a Flask API
- Responsive layout for desktop and mobile
- Form validation and clear feedback messages

## Tech stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python + Flask
- **Storage:** JSON
- **Version control:** Git + GitHub

## Run locally

### 1. Install Python

Use Python 3.10 or later. Check your installation:

```bash
python --version
```

On some Windows setups, use `py --version` instead.

### 2. Open the project folder

Open this folder in VS Code and open a terminal inside it.

### 3. Create and activate a virtual environment (recommended)

Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can run the environment's Python directly instead:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Start the app

```bash
python app.py
```

If `python` is not recognized on Windows, try `py app.py`.

Open the local address printed in the terminal, usually:

http://127.0.0.1:5000

Keep the terminal running while you use the app. Press `Ctrl+C` to stop the server.

## Data storage

The app creates `tasks.json` automatically when you add your first task. It is intentionally excluded from Git by `.gitignore` because it may contain personal task details. If you want sample data for screenshots, create a few tasks through the app after starting it.

## Project structure

```text
Smart-Study-Planner/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## GitHub setup

Create an empty repository on GitHub named `Smart-Study-Planner` (do not add a README there if you already have this one locally). Then run these commands from this folder, replacing `YOUR-USERNAME` with your GitHub username:

```bash
git init
git add .
git commit -m "Build Smart Study Planner"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Smart-Study-Planner.git
git push -u origin main
```

If Git asks you to identify yourself first:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the email you want associated with your commits.

## Important note about deployment

GitHub Pages can host static files, but it cannot run this Flask backend. This repository is ready for GitHub as source code. To make the app publicly interactive, deploy the Flask app to a Python-compatible hosting service separately.

## Future improvements

- Edit existing tasks
- Subject-wise progress charts
- Weekly study timetable
- Optional reminders
- Database storage with SQLite
