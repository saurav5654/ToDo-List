let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let draggedItem = null;

const todoList = document.getElementById('todoList');
const newTodoInput = document.getElementById('newTodoInput');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const itemsCount = document.getElementById('itemsCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.src = './images/icon-sun.svg';
    themeIcon.alt = 'Toggle light mode';
  }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeIcon.src = isDark ? './images/icon-sun.svg' : './images/icon-moon.svg';
  themeIcon.alt = isDark ? 'Toggle light mode' : 'Toggle dark mode';
});

// Add new todo
newTodoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && newTodoInput.value.trim()) {
    const newTodo = {
      id: Date.now(),
      text: newTodoInput.value.trim(),
      completed: false
    };
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    newTodoInput.value = '';
    newTodoInput.focus();
  }
});

// Render todos
function renderTodos() {
  todoList.innerHTML = '';
  
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML = '<div class="empty-state">No todos to show</div>';
    updateItemsCount();
    return;
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.draggable = true;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <button class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
        ${todo.completed ? '<img src="./images/icon-check.svg" alt="Check">' : ''}
      </button>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" data-id="${todo.id}">
        <img src="./images/icon-cross.svg" alt="Delete">
      </button>
    `;

    // Checkbox toggle
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('click', () => {
      const todoItem = todos.find(t => t.id === todo.id);
      if (todoItem) {
        todoItem.completed = !todoItem.completed;
        saveTodos();
        renderTodos();
      }
    });

    // Delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    // Drag events
    li.addEventListener('dragstart', () => {
      draggedItem = li;
      li.style.opacity = '0.5';
    });

    li.addEventListener('dragend', () => {
      li.style.opacity = '1';
      draggedItem = null;
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== li) {
        const rect = li.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (e.clientY < midpoint) {
          li.parentNode.insertBefore(draggedItem, li);
        } else {
          li.parentNode.insertBefore(draggedItem, li.nextSibling);
        }
        // Update todos array order
        updateTodosOrder();
      }
    });

    todoList.appendChild(li);
  });

  updateItemsCount();
}

// Update todos order from DOM
function updateTodosOrder() {
  const items = document.querySelectorAll('.todo-item');
  const newOrder = Array.from(items).map(item => parseInt(item.dataset.id));
  todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
  saveTodos();
}

// Update items count
function updateItemsCount() {
  const activeCount = todos.filter(t => !t.completed).length;
  itemsCount.textContent = activeCount;
}

// Clear completed todos
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
initializeTheme();
renderTodos();
