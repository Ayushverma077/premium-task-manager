import { useEffect, useMemo, useState } from "react";
import "./App.css";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("taskflow-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    if (editingId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId ? { ...task, ...form } : task
        )
      );

      setEditingId(null);
    } else {
      setTasks((prev) => [
        {
          id: crypto.randomUUID(),
          ...form,
          completed: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setForm(emptyForm);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const editTask = (task) => {
    setEditingId(task.id);

    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const filteredTasks = useMemo(() => {
    const priorityRank = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return tasks
      .filter((task) => {
        const query = search.toLowerCase();

        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          (task.description || "").toLowerCase().includes(query);

        const matchesFilter =
          filter === "All" ||
          (filter === "Pending" && !task.completed) ||
          (filter === "Completed" && task.completed);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed);
        }

        return priorityRank[b.priority] - priorityRank[a.priority];
      });
  }, [tasks, search, filter]);

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  const highPriority = tasks.filter(
    (task) => task.priority === "High" && !task.completed
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completed / tasks.length) * 100);

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${task.dueDate}T00:00:00`);

    return due < today;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-logo">✓</div>

            <div>
              <h2>TaskFlow</h2>
              <span>Productivity Workspace</span>
            </div>
          </div>

          <p className="menu-label">WORKSPACE</p>

          <nav>
            <button
              className={`nav-item ${filter === "All" ? "active" : ""}`}
              onClick={() => setFilter("All")}
            >
              <span>▦</span>
              Overview
              <small>{tasks.length}</small>
            </button>

            <button
              className={`nav-item ${
                filter === "Pending" ? "active" : ""
              }`}
              onClick={() => setFilter("Pending")}
            >
              <span>◷</span>
              Pending
              <small>{pending}</small>
            </button>

            <button
              className={`nav-item ${
                filter === "Completed" ? "active" : ""
              }`}
              onClick={() => setFilter("Completed")}
            >
              <span>✓</span>
              Completed
              <small>{completed}</small>
            </button>
          </nav>

          <p className="menu-label secondary-label">PRIORITY</p>

          <div className="priority-menu">
            <div>
              <i className="priority-dot high-dot"></i>
              High Priority
            </div>

            <div>
              <i className="priority-dot medium-dot"></i>
              Medium Priority
            </div>

            <div>
              <i className="priority-dot low-dot"></i>
              Low Priority
            </div>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">TF</div>

          <div>
            <strong>My Workspace</strong>
            <span>Personal</span>
          </div>

          <span className="dots">•••</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Make today count.</h1>
            <p className="subtitle">
              Organize your work and focus on what matters.
            </p>
          </div>

          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple-icon">▦</div>
            <span>Total tasks</span>
            <h2>{tasks.length}</h2>
            <p>All your tasks</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange-icon">◷</div>
            <span>Pending</span>
            <h2>{pending}</h2>
            <p>Tasks remaining</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon red-icon">!</div>
            <span>High priority</span>
            <h2>{highPriority}</h2>
            <p>Need attention</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon green-icon">↗</div>
            <span>Progress</span>
            <h2>{progress}%</h2>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="create-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">
                {editingId ? "EDIT TASK" : "QUICK CREATE"}
              </p>

              <h2>
                {editingId ? "Update task" : "Create a new task"}
              </h2>
            </div>

            {editingId && (
              <button
                className="cancel-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-grid">
              <div className="field">
                <label>Task name</label>

                <input
                  name="title"
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Description</label>

                <input
                  name="description"
                  type="text"
                  placeholder="Add some details..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bottom-form">
              <div className="field">
                <label>Priority</label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="field">
                <label>Due date</label>

                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>

              <button className="primary-button" type="submit">
                {editingId ? "Save Changes" : "+ Add Task"}
              </button>
            </div>
          </form>
        </section>

        <section className="task-section">
          <div className="task-section-header">
            <div>
              <p className="eyebrow">YOUR WORK</p>
              <h2>Tasks</h2>
            </div>

            <div className="task-toolbar">
              <div className="filter-buttons">
                {["All", "Pending", "Completed"].map((item) => (
                  <button
                    key={item}
                    className={filter === item ? "selected" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {completed > 0 && (
                <button
                  className="clear-button"
                  onClick={clearCompleted}
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div>✓</div>
                <h3>Your workspace is clear</h3>
                <p>
                  Add a new task above and start making progress.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className={`task-card ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  <button
                    className={`check-button ${
                      task.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed && "✓"}
                  </button>

                  <div className="task-details">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>

                      {isOverdue(task) && (
                        <span className="overdue">Overdue</span>
                      )}
                    </div>

                    {task.description && (
                      <p>{task.description}</p>
                    )}

                    <div className="task-meta">
                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        <i></i>
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className="due-date">
                          ◷ {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button onClick={() => editTask(task)}>
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <footer>
          TaskFlow · Built with React
        </footer>
      </main>
    </div>
  );
}

export default App;