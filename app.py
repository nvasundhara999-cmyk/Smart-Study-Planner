from flask import Flask, jsonify, render_template, request
from pathlib import Path
from datetime import date
import json
import uuid

app = Flask(__name__)
DATA_FILE = Path(__file__).with_name("tasks.json")


def load_tasks():
    """Load saved tasks, returning an empty list on first run."""
    if not DATA_FILE.exists():
        return []
    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def save_tasks(tasks):
    """Write tasks to JSON using UTF-8."""
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(tasks, file, indent=2, ensure_ascii=False)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/tasks")
def get_tasks():
    return jsonify(load_tasks())


@app.post("/api/tasks")
def create_task():
    data = request.get_json(silent=True) or {}
    subject = str(data.get("subject", "")).strip()
    title = str(data.get("title", "")).strip()
    deadline = str(data.get("deadline", "")).strip()
    priority = str(data.get("priority", "Medium")).title()

    if not subject or not title:
        return jsonify({"error": "Subject and task title are required."}), 400
    if priority not in {"Low", "Medium", "High"}:
        priority = "Medium"

    if deadline:
        try:
            date.fromisoformat(deadline)
        except ValueError:
            return jsonify({"error": "Please provide a valid deadline."}), 400

    task = {
        "id": uuid.uuid4().hex,
        "subject": subject,
        "title": title,
        "deadline": deadline,
        "priority": priority,
        "completed": False,
    }
    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    return jsonify(task), 201


@app.patch("/api/tasks/<task_id>")
def update_task(task_id):
    data = request.get_json(silent=True) or {}
    tasks = load_tasks()

    for task in tasks:
        if task.get("id") == task_id:
            if "completed" in data:
                task["completed"] = bool(data["completed"])
            save_tasks(tasks)
            return jsonify(task)

    return jsonify({"error": "Task not found."}), 404


@app.delete("/api/tasks/<task_id>")
def delete_task(task_id):
    tasks = load_tasks()
    remaining = [task for task in tasks if task.get("id") != task_id]

    if len(remaining) == len(tasks):
        return jsonify({"error": "Task not found."}), 404

    save_tasks(remaining)
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
