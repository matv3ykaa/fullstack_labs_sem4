const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');

// Модальное окно для заметок
const noteModal = document.getElementById('note-modal');
const noteInput = document.getElementById('note-input');
const saveNoteBtn = document.getElementById('save-note');
const cancelNoteBtn = document.getElementById('cancel-note');
let currentTaskId = null;

// Загрузка задач из localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  list.innerHTML = tasks.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-checkbox"></div>
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        ${task.note ? `<div class="task-note show">${escapeHtml(task.note)}</div>` : ''}
      </div>
      <button class="task-menu" data-id="${task.id}">⋯</button>
    </li>
  `).join('');
  
  // Показываем/скрываем пустой экран
  if (tasks.length > 0) {
    list.classList.add('show');
    emptyState.style.display = 'none';
  } else {
    list.classList.remove('show');
    emptyState.style.display = 'block';
  }
  
  // Обработчики чекбоксов и меню
  document.querySelectorAll('.task-item').forEach(item => {
    item.querySelector('.task-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTask(item.dataset.id);
    });
    item.querySelector('.task-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      openNoteModal(item.dataset.id);
    });
  });
}

// Добавление задачи
function addTask(text) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.push({ id: Date.now(), text, completed: false, note: '' });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

// Переключение статуса задачи
function toggleTask(id) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find(t => t.id == id);
  if (task) {
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
  }
}

// Открытие модального окна для заметки
function openNoteModal(id) {
  currentTaskId = id;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find(t => t.id == id);
  noteInput.value = task?.note || '';
  noteModal.style.display = 'flex';
}

// Сохранение заметки
function saveNote() {
  if (!currentTaskId) return;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find(t => t.id == currentTaskId);
  if (task) {
    task.note = noteInput.value.trim();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
  }
  noteModal.style.display = 'none';
}

// Экранирование HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Обработчики событий
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTask(text);
    input.value = '';
  }
});

saveNoteBtn.addEventListener('click', saveNote);
cancelNoteBtn.addEventListener('click', () => {
  noteModal.style.display = 'none';
});

noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) noteModal.style.display = 'none';
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW зарегистрирован:', reg.scope))
      .catch(err => console.error('Ошибка регистрации SW:', err));
  });
}

// Первоначальная загрузка
loadTasks();