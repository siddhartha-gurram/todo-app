const fs = require('fs');
const readline = require('readline');

// Create an interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Load tasks from a file (if it exists)
let tasks = [];
if (fs.existsSync('tasks.json')) {
  try {
    const data = fs.readFileSync('tasks.json', 'utf8');
    tasks = JSON.parse(data);
    if (!Array.isArray(tasks)) {
      tasks = [];
    }
  } catch (error) {
    console.error('Error loading tasks file:', error.message);
    tasks = [];
  }
}

// Function to save tasks to a file
function saveTasks() {
  try {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error saving tasks:', error.message);
  }
}

// Function to display the menu
function showMenu() {
  console.log('\n--- To-Do List App ---');
  console.log('1. View Tasks');
  console.log('2. Add Task');
  console.log('3. Delete Task');
  console.log('4. Exit');
  rl.setPrompt('Enter your choice: ');
  rl.prompt();
}

// Function to handle user input
function handleInput(choice) {
  const trimmedChoice = choice.trim();
  switch (trimmedChoice) {
    case '1':
      viewTasks();
      break;
    case '2':
      addTask();
      break;
    case '3':
      deleteTask();
      break;
    case '4':
      console.log('Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      showMenu();
      break;
  }
}

// Function to view tasks
function viewTasks() {
  if (tasks.length === 0) {
    console.log('No tasks found.');
  } else {
    console.log('\n--- Your Tasks ---');
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task}`);
    });
  }
  showMenu();
}

// Function to add a task
function addTask() {
  rl.question('Enter a new task: ', (task) => {
    if (task.trim()) {
      tasks.push(task.trim());
      saveTasks();
      console.log('Task added successfully!');
    } else {
      console.log('Task cannot be empty.');
    }
    showMenu();
  });
}

// Function to delete a task
function deleteTask() {
  if (tasks.length === 0) {
    console.log('No tasks to delete.');
    showMenu();
    return;
  }
  
  viewTasks();
  rl.question('Enter the task number to delete: ', (taskNumber) => {
    const index = parseInt(taskNumber) - 1;
    if (index >= 0 && index < tasks.length) {
      const deletedTask = tasks[index];
      tasks.splice(index, 1);
      saveTasks();
      console.log(`Task "${deletedTask}" deleted successfully!`);
    } else {
      console.log('Invalid task number.');
    }
    showMenu();
  });
}

// Start the app
showMenu();
rl.on('line', (choice) => {
  handleInput(choice);
});
