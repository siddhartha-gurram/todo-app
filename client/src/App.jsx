import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tasks`)
      const data = await response.json()
      if (data.success) {
        setTasks(data.tasks)
      }
      setError(null)
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask })
      })
      const data = await response.json()
      if (data.success) {
        setTasks([...tasks, data.task])
        setNewTask('')
      }
    } catch (err) {
      setError('Failed to add task')
    }
  }

  // Delete a task
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.filter(task => task.id !== id))
      }
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  // Start editing a task
  const startEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.task)
  }

  // Save edited task
  const handleEdit = async (id) => {
    if (!editText.trim()) return

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: editText })
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, task: editText } : task
        ))
        setEditingId(null)
        setEditText('')
      }
    } catch (err) {
      setError('Failed to update task')
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

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
          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </form>

        <div className="tasks-container">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  {editingId === task.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleEdit(task.id)} className="btn btn-save">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="btn btn-cancel">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="task-number">{task.id}</span>
                      <span className="task-text">{task.task}</span>
                      <div className="task-actions">
                        <button onClick={() => startEdit(task)} className="btn btn-edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="btn btn-delete">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="footer">
          <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </footer>
      </div>
    </div>
  )
}

export default App
