const taskList = document.querySelector("#task-list");
const taskDialog = document.querySelector("#task-dialog");
const taskForm = document.querySelector("#task-form");
const formError = document.querySelector("#form-error");
const searchInput = document.querySelector("#search-input");
const toast = document.querySelector("#toast");

let tasks = [];
let activeFilter = "all";
let toastTimer;

const todayISO = new Date().toLocaleDateString("en-CA");
document.querySelector("#current-date").textContent =
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
document.querySelector("#today-label").textContent =
  new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }).toUpperCase();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#pending-count").textContent = pending;
  document.querySelector("#completed-count").textContent = completed;
  document.querySelector("#progress-count").textContent = `${percent}%`;
  document.querySelector("#progress-bar").style.width = `${percent}%`;
  document.querySelector("#task-summary").textContent =
    tasks.length ? `${completed} of ${tasks.length} tasks completed` : "Your plan starts here.";
}

function formatDeadline(deadline) {
  if (!deadline) return "No deadline";
  const parsed = new Date(`${deadline}T00:00:00`);
  return `Due ${parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function renderTasks() {
  updateStats();
  const query = searchInput.value.trim().toLowerCase();
  const filtered = tasks.filter(task => {
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "completed" && task.completed)
      || (activeFilter === "pending" && !task.completed);
    const matchesSearch = `${task.title} ${task.subject}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (!filtered.length) {
    const hasTasks = tasks.length > 0;
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">${hasTasks ? "⌕" : "✦"}</div>
        <strong>${hasTasks ? "No matching tasks" : "A fresh start"}</strong>
        <p>${hasTasks ? "Try another search or filter." : "Add your first study task and build momentum."}</p>
      </div>`;
  } else {
    taskList.innerHTML = filtered.map(task => {
      const isOverdue = task.deadline && task.deadline < todayISO && !task.completed;
      const priority = ["High", "Medium", "Low"].includes(task.priority) ? task.priority : "Medium";
      return `
        <article class="task-row ${task.completed ? "is-completed" : ""}">
          <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(task.title)} completed"
            data-action="toggle" data-id="${escapeHTML(task.id)}" ${task.completed ? "checked" : ""}>
          <div class="task-main">
            <p class="task-title">${escapeHTML(task.title)}</p>
            <div class="task-meta">
              <span class="subject-tag">${escapeHTML(task.subject)}</span>
              <span class="priority priority-${priority.toLowerCase()}">${priority} priority</span>
              <span class="deadline ${isOverdue ? "overdue" : ""}">${isOverdue ? "Overdue · " : ""}${escapeHTML(formatDeadline(task.deadline))}</span>
            </div>
          </div>
          <button class="delete-button" type="button" aria-label="Delete ${escapeHTML(task.title)}"
            title="Delete task" data-action="delete" data-id="${escapeHTML(task.id)}">×</button>
        </article>`;
    }).join("");
  }
}

function openDialog() {
  formError.textContent = "";
  taskForm.reset();
  document.querySelector("#task-priority").value = "Medium";
  taskDialog.showModal();
  document.querySelector("#task-title").focus();
}

document.querySelector("#add-task-button").addEventListener("click", openDialog);
document.querySelector("#banner-add-button").addEventListener("click", openDialog);
document.querySelector("#close-dialog").addEventListener("click", () => taskDialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => taskDialog.close());
taskDialog.addEventListener("click", event => {
  if (event.target === taskDialog) taskDialog.close();
});

taskForm.addEventListener("submit", async event => {
  event.preventDefault();
  formError.textContent = "";
  const formData = new FormData(taskForm);
  const task = {
    title: formData.get("title").trim(),
    subject: formData.get("subject").trim(),
    deadline: formData.get("deadline"),
    priority: formData.get("priority")
  };
  try {
    const created = await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task)
    });
    tasks.push(created);
    taskDialog.close();
    renderTasks();
    showToast("Study task added successfully.");
  } catch (error) {
    formError.textContent = error.message;
  }
});

taskList.addEventListener("change", async event => {
  const control = event.target.closest('[data-action="toggle"]');
  if (!control) return;
  try {
    const updated = await api(`/api/tasks/${encodeURIComponent(control.dataset.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: control.checked })
    });
    tasks = tasks.map(task => task.id === updated.id ? updated : task);
    renderTasks();
    showToast(updated.completed ? "Nice work — task completed!" : "Task moved back to pending.");
  } catch (error) {
    control.checked = !control.checked;
    showToast(error.message);
  }
});

taskList.addEventListener("click", async event => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  const task = tasks.find(item => item.id === button.dataset.id);
  if (!task || !window.confirm(`Delete "${task.title}"?`)) return;
  try {
    await api(`/api/tasks/${encodeURIComponent(task.id)}`, { method: "DELETE" });
    tasks = tasks.filter(item => item.id !== task.id);
    renderTasks();
    showToast("Task deleted.");
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelectorAll(".filter-tab").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach(tab => {
      tab.classList.toggle("selected", tab === button);
    });
    renderTasks();
  });
});
searchInput.addEventListener("input", renderTasks);

async function init() {
  try {
    tasks = await api("/api/tasks");
    renderTasks();
  } catch (error) {
    taskList.innerHTML = `<div class="empty-state"><strong>Couldn't load your tasks</strong><p>Make sure the Flask server is running, then refresh this page.</p></div>`;
    showToast("Could not connect to the backend.");
  }
}
init();
