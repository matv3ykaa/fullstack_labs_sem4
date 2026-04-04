// DOM элементы для навигации
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// Модальное окно для заметок
const noteModal = document.getElementById('note-modal');
const noteInput = document.getElementById('note-input');
const saveNoteBtn = document.getElementById('save-note');
const cancelNoteBtn = document.getElementById('cancel-note');
let currentTaskId = null;

// Подключение к серверу Socket.io
const socket = io('http://localhost:3001');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Вспомогательная функция для преобразования VAPID-ключа
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Подписка на push-уведомления
async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('changethis')
    });
    await fetch('http://localhost:3001/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    console.log('Подписка на push отправлена');
  } catch (err) {
    console.error('Ошибка подписки на push:', err);
  }
}

// Отписка от push-уведомлений
async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await fetch('http://localhost:3001/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
    await subscription.unsubscribe();
    console.log('Отписка выполнена');
  }
}

// Активация кнопки навигации
function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

// Загрузка динамического контента
async function loadContent(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    if (page === 'home') {
      initTasks();
    }
  } catch (err) {
    contentDiv.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Ошибка загрузки</p>';
    console.error(err);
  }
}

// Инициализация функционала задач
function initTasks() {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  
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
    
    if (tasks.length > 0) {
      list.classList.add('show');
      emptyState.style.display = 'none';
    } else {
      list.classList.remove('show');
      emptyState.style.display = 'block';
    }
    
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
  
  function addTask(text) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({ id: Date.now(), text, completed: false, note: '' });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    
    // Отправляем событие на сервер через WebSocket
    socket.emit('newTask', { text, timestamp: Date.now() });
  }
  
  function toggleTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id == id);
    if (task) {
      task.completed = !task.completed;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      loadTasks();
    }
  }
  
  function openNoteModal(id) {
    currentTaskId = id;
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id == id);
    noteInput.value = task?.note || '';
    noteModal.style.display = 'flex';
  }
  
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
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) { addTask(text); input.value = ''; }
  });
  
  saveNoteBtn.addEventListener('click', saveNote);
  cancelNoteBtn.addEventListener('click', () => { noteModal.style.display = 'none'; });
  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) noteModal.style.display = 'none';
  });
  
  loadTasks();
}

// Обработчик получения задачи от другого клиента
socket.on('taskAdded', (task) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <img src="/icons/icon-192x192.png" alt="flow" class="toast-icon">
    <div class="toast-content">
      <div class="toast-title">Новая задача</div>
      <div class="toast-body">${escapeHtml(task.text)}</div>
    </div>
    <button class="toast-close" aria-label="Закрыть">&times;</button>
  `;
  document.body.appendChild(toast);

  // Запуск анимации появления на следующем кадре рендера
  requestAnimationFrame(() => toast.classList.add('show'));

  const autoHide = setTimeout(hideToast, 8000);

  function hideToast() {
    clearTimeout(autoHide);
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Удаляем элемент строго после завершения CSS-перехода
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) toast.remove();
    }, { once: true });

    // Страховочный таймер (если браузер не сгенерирует событие transitionend)
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }

  toast.querySelector('.toast-close').addEventListener('click', hideToast);
});

// Обработчики навигации
homeBtn.addEventListener('click', () => { setActiveButton('home-btn'); loadContent('home'); });
aboutBtn.addEventListener('click', () => { setActiveButton('about-btn'); loadContent('about'); });

// Регистрация Service Worker + настройка кнопок уведомлений
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered');
      
      const enableBtn = document.getElementById('enable-push');
      const disableBtn = document.getElementById('disable-push');
      
      if (enableBtn && disableBtn) {
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          enableBtn.style.display = 'none';
          disableBtn.style.display = 'inline-block';
        } else {
          enableBtn.style.display = 'inline-block';
          disableBtn.style.display = 'none';
        }
        
        enableBtn.addEventListener('click', async () => {
          if (Notification.permission === 'denied') {
            alert('Уведомления запрещены. Разрешите их в настройках браузера.');
            return;
          }
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              alert('Необходимо разрешить уведомления.');
              return;
            }
          }
          await subscribeToPush();
          enableBtn.style.display = 'none';
          disableBtn.style.display = 'inline-block';
        });
        
        disableBtn.addEventListener('click', async () => {
          await unsubscribeFromPush();
          disableBtn.style.display = 'none';
          enableBtn.style.display = 'inline-block';
        });
      }
    } catch (err) {
      console.log('SW registration failed:', err);
    }
  });
}

// Загрузка главной страницы при старте
loadContent('home');