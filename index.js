const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Normalize task: string -> { task, completed, priority }
function normalizeTask(item, index) {
  if (typeof item === 'string') {
    return { task: item, completed: false, priority: 'medium' };
  }
  return {
    task: item.task || '',
    completed: Boolean(item.completed),
    priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium'
  };
}

// Load tasks from file (supports legacy array of strings)
function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      const raw = JSON.parse(data);
      const tasks = Array.isArray(raw) ? raw.map(normalizeTask) : [];
      return tasks;
    }
  } catch (error) {
    console.error('Error loading tasks:', error.message);
  }
  return [];
}

// Save tasks to file
function saveTasks(tasks) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error.message);
    return false;
  }
}

// GET /tasks - Get all tasks (optional ?filter=active|completed)
app.get('/tasks', (req, res) => {
  const all = loadTasks();
  let tasks = all;
  const filter = req.query.filter;
  if (filter === 'active') tasks = all.filter(t => !t.completed);
  if (filter === 'completed') tasks = all.filter(t => t.completed);
  const withIds = all.map((item, i) => ({
    id: i + 1,
    task: item.task,
    completed: item.completed,
    priority: item.priority
  }));
  const filtered = filter === 'active'
    ? withIds.filter(t => !t.completed)
    : filter === 'completed'
      ? withIds.filter(t => t.completed)
      : withIds;
  res.json({
    success: true,
    count: filtered.length,
    tasks: filtered
  });
});

// GET /tasks/:id - Get a specific task
app.get('/tasks/:id', (req, res) => {
  const tasks = loadTasks();
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id < 1 || id > tasks.length) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const item = tasks[id - 1];
  res.json({
    success: true,
    task: {
      id,
      task: item.task,
      completed: item.completed,
      priority: item.priority
    }
  });
});

// POST /tasks - Add a new task
app.post('/tasks', (req, res) => {
  const { task, priority = 'medium' } = req.body;
  
  if (!task || typeof task !== 'string' || !task.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task is required and must be a non-empty string'
    });
  }
  
  const p = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
  const tasks = loadTasks();
  const newItem = { task: task.trim(), completed: false, priority: p };
  tasks.push(newItem);
  
  if (saveTasks(tasks)) {
    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task: {
        id: tasks.length,
        task: newItem.task,
        completed: false,
        priority: newItem.priority
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save task'
    });
  }
});

// DELETE /tasks/completed - Delete all completed tasks (must be before /tasks/:id)
app.delete('/tasks/completed', (req, res) => {
  const tasks = loadTasks().filter(t => !t.completed);
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: 'Completed tasks deleted successfully',
      remaining: tasks.length
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete completed tasks'
    });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const tasks = loadTasks();
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id < 1 || id > tasks.length) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const deleted = tasks.splice(id - 1, 1)[0];
  
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: 'Task deleted successfully',
      deletedTask: {
        id,
        task: deleted.task,
        completed: deleted.completed,
        priority: deleted.priority
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

// PATCH /tasks/:id/toggle - Toggle completed status
app.patch('/tasks/:id/toggle', (req, res) => {
  const tasks = loadTasks();
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id < 1 || id > tasks.length) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const item = tasks[id - 1];
  item.completed = !item.completed;
  
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: item.completed ? 'Task marked complete' : 'Task marked incomplete',
      task: {
        id,
        task: item.task,
        completed: item.completed,
        priority: item.priority
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
  const { task, priority } = req.body;
  const id = parseInt(req.params.id);
  
  if (!task || typeof task !== 'string' || !task.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task is required and must be a non-empty string'
    });
  }
  
  const tasks = loadTasks();
  
  if (isNaN(id) || id < 1 || id > tasks.length) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const item = tasks[id - 1];
  item.task = task.trim();
  if (priority && ['low', 'medium', 'high'].includes(priority)) item.priority = priority;
  
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: {
        id,
        task: item.task,
        completed: item.completed,
        priority: item.priority
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /tasks - Delete all tasks
app.delete('/tasks', (req, res) => {
  if (saveTasks([])) {
    res.json({
      success: true,
      message: 'All tasks deleted successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete tasks'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Todo List API',
    endpoints: {
      'GET /tasks': 'Get all tasks (?filter=active|completed)',
      'GET /tasks/:id': 'Get a specific task',
      'POST /tasks': 'Add task (body: { "task": "text", "priority": "low|medium|high" })',
      'PUT /tasks/:id': 'Update task (body: { "task": "text", "priority": "..." })',
      'PATCH /tasks/:id/toggle': 'Toggle completed status',
      'DELETE /tasks/:id': 'Delete a task',
      'DELETE /tasks/completed': 'Delete all completed tasks',
      'DELETE /tasks': 'Delete all tasks'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║           Todo List API Server                    ║
╠═══════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}         ║
╠═══════════════════════════════════════════════════╣
║  Endpoints:                                       ║
║    GET    /tasks      - Get all tasks             ║
║    GET    /tasks/:id  - Get a specific task       ║
║    POST   /tasks      - Add a new task            ║
║    PUT    /tasks/:id  - Update a task             ║
║    DELETE /tasks/:id  - Delete a task             ║
║    DELETE /tasks      - Delete all tasks          ║
╚═══════════════════════════════════════════════════╝
  `);
});
