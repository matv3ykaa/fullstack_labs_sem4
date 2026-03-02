const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Стартовые данные — 10 настольных игр
let products = [
  {
    id: nanoid(6),
    name: 'Колонизаторы',
    category: 'Стратегия',
    description: 'Классическая стратегия на строительство поселений и торговлю ресурсами. 3-4 игрока.',
    price: 2990,
    stock: 15,
    rating: 4.8,
    image: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__imagepage/img/M_3Vg1j2HlNgkv7PL1xl1_-PkKA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2419375.jpg',
  },
  {
    id: nanoid(6),
    name: 'Каркассон',
    category: 'Стратегия',
    description: 'Игра на выкладывание тайлов и расстановку мипплов для захвата территорий.',
    price: 1890,
    stock: 22,
    rating: 4.6,
    image: 'https://cf.geekdo-images.com/okM0dq_bEXnbyQTOvHfwRA__imagepage/img/H1oi5ek0kRjXapKvPkfpQmMqkqA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2337577.jpg',
  },
  {
    id: nanoid(6),
    name: 'Диксит',
    category: 'Вечеринка',
    description: 'Творческая игра с иллюстрациями, где нужно угадывать истории других игроков.',
    price: 2200,
    stock: 18,
    rating: 4.7,
    image: 'https://cf.geekdo-images.com/lDe9QfMfOSXqXnmEFvNFAA__imagepage/img/8I2jXzAQSs6e3KBQPKZ3mj5x6tk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic3738270.jpg',
  },
  {
    id: nanoid(6),
    name: 'Пандемия',
    category: 'Кооператив',
    description: 'Совместная игра: команда врачей останавливает распространение болезней по всему миру.',
    price: 2750,
    stock: 10,
    rating: 4.9,
    image: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVqA__imagepage/img/2Kpf5TrgrMiALDHYdwKnHQgXS9w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1534148.jpg',
  },
  {
    id: nanoid(6),
    name: 'Ticket to Ride',
    category: 'Семейная',
    description: 'Прокладывайте железнодорожные маршруты по всей Европе. Легко учится, сложно мастерится.',
    price: 3400,
    stock: 8,
    rating: 4.8,
    image: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__imagepage/img/hF1AZIaZlrfhWdRDIKsxVBQfwl0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic38668.jpg',
  },
  {
    id: nanoid(6),
    name: 'Имаджинариум',
    category: 'Вечеринка',
    description: 'Русская версия Диксита с оригинальными иллюстрациями. Отлично подходит для компании.',
    price: 1650,
    stock: 30,
    rating: 4.4,
    image: 'https://images.2game.ru/images/products/1/6748/66739447/imaginarium.jpg',
  },
  {
    id: nanoid(6),
    name: 'Betrayal at House on the Hill',
    category: 'Хоррор',
    description: 'Исследуйте жуткий особняк. В какой-то момент один из игроков становится предателем.',
    price: 3900,
    stock: 5,
    rating: 4.5,
    image: 'https://cf.geekdo-images.com/oOmMnSfgcNWmqQjBFN_oXg__imagepage/img/0N4Ky1ZCi_MJFyinYMDfSyWqUys=/fit-in/900x600/filters:no_upscale():strip_icc()/pic828598.jpg',
  },
  {
    id: nanoid(6),
    name: 'Dominion',
    category: 'Карточная',
    description: 'Первая колодостроительная игра. Каждая партия уникальна благодаря разным наборам карт.',
    price: 2100,
    stock: 12,
    rating: 4.5,
    image: 'https://cf.geekdo-images.com/j4ZDCJoHRSFfuE6_O7hTZA__imagepage/img/2T4flWC0P_4IWJpXIxAVKJSNGMc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic394356.jpg',
  },
  {
    id: nanoid(6),
    name: '7 Wonders',
    category: 'Стратегия',
    description: 'Стройте одно из 7 чудес света, одновременно развивая науку, армию и торговлю.',
    price: 3100,
    stock: 9,
    rating: 4.7,
    image: 'https://cf.geekdo-images.com/RvFVTEpnbb4NM7k0IF8V7A__imagepage/img/F-Vf3ORTkHkEMWCy0GHQZ-mN3fk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic860217.jpg',
  },
  {
    id: nanoid(6),
    name: 'Клуэдо',
    category: 'Детектив',
    description: 'Классическая детективная игра: выясните, кто убил мистера Боди, где и чем.',
    price: 1450,
    stock: 20,
    rating: 4.2,
    image: 'https://cf.geekdo-images.com/PJosGEMEMfBunDMELh3bQA__imagepage/img/WzPnhBiHkQ3AJqBH0MaGMVsDTCE=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1299166.jpg',
  },
];

// Разрешаем запросы с фронтенда
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Парсим JSON из тела запроса
app.use(express.json());

// Логируем каждый запрос в консоль
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Ищем товар по id, если нет — сразу отдаём 404
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

// Проверяем поля при создании и обновлении
function validateProductFields(body, requireAll = true) {
  const errors = [];

  if (requireAll || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('name: обязательная строка');
    }
  }
  if (requireAll || body.category !== undefined) {
    if (typeof body.category !== 'string' || body.category.trim().length === 0) {
      errors.push('category: обязательная строка');
    }
  }
  if (requireAll || body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.trim().length === 0) {
      errors.push('description: обязательная строка');
    }
  }
  if (requireAll || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('price: неотрицательное число');
    }
  }
  if (requireAll || body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('stock: целое неотрицательное число');
    }
  }
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      errors.push('rating: число от 0 до 5');
    }
  }
  if (body.image !== undefined && body.image !== null && body.image !== '') {
    if (typeof body.image !== 'string') {
      errors.push('image: строка с URL');
    }
  }

  return errors;
}

// POST /api/products — создать товар
app.post('/api/products', (req, res) => {
  const errors = validateProductFields(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Ошибки валидации', details: errors });
  }

  const { name, category, description, price, stock, rating, image } = req.body;
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating !== undefined ? Number(rating) : null,
    image: image || null,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// GET /api/products — список товаров
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id — один товар
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

// PATCH /api/products/:id — частичное обновление
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const updatableFields = ['name', 'category', 'description', 'price', 'stock', 'rating', 'image'];
  const hasAnyField = updatableFields.some(f => req.body[f] !== undefined);
  if (!hasAnyField) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }

  const errors = validateProductFields(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Ошибки валидации', details: errors });
  }

  const { name, category, description, price, stock, rating, image } = req.body;
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image || null;

  res.json(product);
});

// DELETE /api/products/:id — удалить товар
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });

  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

// 404 для всего остального
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Глобальный обработчик — чтобы сервер не падал от неожиданных ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});