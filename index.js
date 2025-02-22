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
  tasks = JSON.parse(fs.readFileSync('tasks.json'));
}

// Function to save tasks to a file
function saveTasks() {
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
}

// Function to display the menu
function showMenu() {
  console.log('\n--- To-Do List App ---');
  console.log('1. View Tasks');
  console.log('2. Add Task');
  console.log('3. Delete Task');
  console.log('4. Exit');
}

// Function to handle user input
function handleInput(choice) {
  switch (choice) {
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
    tasks.push(task);
    saveTasks();
    console.log('Task added successfully!');
    showMenu();
  });
}

// Function to delete a task
function deleteTask() {
  rl.question('Enter the task number to delete: ', (taskNumber) => {
    const index = taskNumber - 1;
    if (index >= 0 && index < tasks.length) {
      tasks.splice(index, 1);
      saveTasks();
      console.log('Task deleted successfully!');
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