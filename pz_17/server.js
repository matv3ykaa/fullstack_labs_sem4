const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// VAPID-ключи
const vapidKeys = {
  publicKey: 'BFKpb4a9jTQOTpjjbceDENHqgNb8TUabD6LewFgdY_ZlAO2KZUQTZi7BrOt2wyXpapkMgpPC_B-5HjM7q-WGVKg',
  privateKey: '-DYpBKt7wWjNqNlD4de2Wik7RWxZQrkh8eb8ZHV710M'
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// Хранилище подписок
let subscriptions = [];

// Хранилище активных напоминаний (ключ это id заметки, а значение это объект с таймером и данными)
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Обработка WebSocket-соединений
io.on('connection', (socket) => {
  console.log('Клиент подключён:', socket.id);

  // Обработка события 'newTask' от клиента
  socket.on('newTask', (task) => {
    // Рассылаем событие всем подключённым клиентам
    io.emit('taskAdded', task);

    // Формируем payload для push-уведомления
    const payload = JSON.stringify({
      title: 'Новая задача',
      body: task.text
    });

    // Отправляем push всем подписанным клиентам
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push error:', err);
      });
    });
  });

  socket.on('newReminder', (reminder) => {
    const { id, text, reminderTime } = reminder;
    const delay = reminderTime - Date.now();
    if (delay <= 0) return;

    // Сохраняем таймер
    const timeoutId = setTimeout(() => {
      // Отправляем push-уведомление всем подписанным клиентам
      const payload = JSON.stringify({
        title: '!!! Напоминание',
        body: text,
        reminderId: id
      });
      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err =>
          console.error('Push error:', err));
      });
      // Удаляем напоминание из хранилища после отправки
      reminders.set(id, { timeoutId: null, text, reminderTime });
    }, delay);

    reminders.set(id, { timeoutId, text, reminderTime });
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключён:', socket.id);
  });
});

// Эндпоинты для управления push-подписками
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  res.status(200).json({ message: 'Подписка удалена' });
});

app.post('/snooze', (req, res) => {
  const reminderId = parseInt(req.query.reminderId, 10);
  console.log(` Получен запрос на откладывание ID: ${reminderId}`); // <-- ЭТО ПОЯВИТСЯ В КОНСОЛИ
  
  if (!reminderId || !reminders.has(reminderId)) {
    console.log('Напоминание не найдено');
    return res.status(404).json({ error: 'Reminder not found' });
  }

  const reminder = reminders.get(reminderId);
  console.log(`Старый таймер отменен, ставим новый на 5 мин...`);
  
  // Отменяем старый
  clearTimeout(reminder.timeoutId);

  // 5 минут (300 000 мс)
  const newDelay = 5 * 60 * 1000;

  const newTimeoutId = setTimeout(() => {
    console.log(`Таймер сработал! Отправляем Push для ID: ${reminderId}`);
    const payload = JSON.stringify({
      title: 'Напоминание (отложено)',
      body: reminder.text,
      reminderId: reminderId
    });

    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
    });
    reminders.delete(reminderId);
  }, newDelay);

  // Сохраняем новый таймер
  reminders.set(reminderId, { timeoutId: newTimeoutId, text: reminder.text });
  
  res.status(200).json({ message: 'Snoozed' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});