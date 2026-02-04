import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'
const FILTERS = ['all', 'active', 'completed']
const PRIORITIES = ['low', 'medium', 'high']

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatDueDate = (d) => {
    if (!d) return null
    const [y, m, day] = d.split('-')
    const date = new Date(y, m - 1, day)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate + 'T23:59:59')
    return due < today
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? `${API_URL}/tasks`
        : `${API_URL}/tasks?filter=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) setTasks(data.tasks)
      setError(null)
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: newTask,
          priority: newPriority,
          dueDate: newDueDate || undefined
        })
      })
      const data = await response.json()
      if (data.success) {
        setNewTask('')
        setNewPriority('medium')
        setNewDueDate('')
        fetchTasks()
      }
    } catch (err) {
      setError('Failed to add task')
    }
  }

  const handleToggleComplete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
        method: 'PATCH'
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: data.task.completed, dueDate: data.task.dueDate } : t))
      }
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.task)
    setEditPriority(task.priority || 'medium')
    setEditDueDate(task.dueDate || '')
  }

  const handleEdit = async (id) => {
    if (!editText.trim()) return
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: editText,
          priority: editPriority,
          dueDate: editDueDate || undefined
        })
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, task: editText, priority: editPriority, dueDate: editDueDate || null } : t
        ))
        setEditingId(null)
        setEditText('')
        setEditPriority('medium')
        setEditDueDate('')
      }
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditPriority('medium')
    setEditDueDate('')
  }

  const handleClearCompleted = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/completed`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) fetchTasks()
    } catch (err) {
      setError('Failed to clear completed')
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const hasCompleted = tasks.some(t => t.completed)

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Todo List</h1>
          <p className="subtitle">Stay organized, get things done</p>
        </header>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)} className="error-close">&times;</button>
          </div>
        )}

        <form onSubmit={handleAddTask} className="add-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="priority-select"
            title="Priority"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="due-date-input"
            title="Due date"
          />
          <button type="submit" className="btn btn-primary">Add Task</button>
        </form>

        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="tasks-container">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>
                {filter === 'all' && 'No tasks yet. Add one above!'}
                {filter === 'active' && 'No active tasks.'}
                {filter === 'completed' && 'No completed tasks yet.'}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  {editingId === task.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="priority-select edit-priority"
                      >
                        {PRIORITIES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="due-date-input edit-due"
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleEdit(task.id)} className="btn btn-save">Save</button>
                        <button onClick={cancelEdit} className="btn btn-cancel">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="checkbox"
                        onClick={() => handleToggleComplete(task.id)}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? '✓' : ''}
                      </button>
                      <span className="task-number">{task.id}</span>
                      <span className={`task-text ${task.completed ? 'strikethrough' : ''}`}>
                        {task.task}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`due-date-badge ${!task.completed && isOverdue(task.dueDate) ? 'overdue' : ''}`}
                          title={formatDueDate(task.dueDate)}
                        >
                          📅 {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                        {task.priority || 'medium'}
                      </span>
                      <div className="task-actions">
                        <button onClick={() => startEdit(task)} className="btn btn-edit">Edit</button>
                        <button onClick={() => handleDelete(task.id)} className="btn btn-delete">Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="footer">
          <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          {hasCompleted && (
            <button onClick={handleClearCompleted} className="btn-clear-completed">
              Clear completed ({completedCount})
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default App
