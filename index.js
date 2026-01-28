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

// Load tasks from file
function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      const tasks = JSON.parse(data);
      return Array.isArray(tasks) ? tasks : [];
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

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json({
    success: true,
    count: tasks.length,
    tasks: tasks.map((task, index) => ({
      id: index + 1,
      task: task
    }))
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
  
  res.json({
    success: true,
    task: {
      id: id,
      task: tasks[id - 1]
    }
  });
});

// POST /tasks - Add a new task
app.post('/tasks', (req, res) => {
  const { task } = req.body;
  
  if (!task || typeof task !== 'string' || !task.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task is required and must be a non-empty string'
    });
  }
  
  const tasks = loadTasks();
  const newTask = task.trim();
  tasks.push(newTask);
  
  if (saveTasks(tasks)) {
    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task: {
        id: tasks.length,
        task: newTask
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save task'
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
  
  const deletedTask = tasks.splice(id - 1, 1)[0];
  
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: 'Task deleted successfully',
      deletedTask: {
        id: id,
        task: deletedTask
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
  const { task } = req.body;
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
  
  const updatedTask = task.trim();
  tasks[id - 1] = updatedTask;
  
  if (saveTasks(tasks)) {
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: {
        id: id,
        task: updatedTask
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
      'GET /tasks': 'Get all tasks',
      'GET /tasks/:id': 'Get a specific task',
      'POST /tasks': 'Add a new task (body: { "task": "your task" })',
      'PUT /tasks/:id': 'Update a task (body: { "task": "updated task" })',
      'DELETE /tasks/:id': 'Delete a specific task',
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
